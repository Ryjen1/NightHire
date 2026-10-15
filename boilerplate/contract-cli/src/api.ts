// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Ryjen1 (NightHire contributors)
// Licensed under the Apache License, Version 2.0

import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { contracts } from '@midnight-ntwrk/contract';
import { nativeToken, Transaction } from '@midnight-ntwrk/ledger';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { getLedgerNetworkId, getZswapNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  type BalancedTransaction,
  type FinalizedTxData,
  type MidnightProvider,
  type UnbalancedTransaction,
  type WalletProvider,
} from '@midnight-ntwrk/midnight-js-types';
import { type Resource, WalletBuilder } from '@midnight-ntwrk/wallet';
import { type Wallet } from '@midnight-ntwrk/wallet-api';
import { Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import { webcrypto } from 'crypto';
import { type Logger } from 'pino';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';
import path from 'path';
import { type Config, currentDir } from './config';

import { NightHirePrivateStateId, type NightHireProviders } from './common-types';

let logger: Logger | undefined;
export function setLogger(l: Logger) { logger = l; }
export { nativeToken };

// ── Config providers ────────────────────────────────────────────────────────

export async function configureProviders(
  wallet: Wallet & Resource,
  config: Config
): Promise<NightHireProviders> {
  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => wallet.coinPublicKey,
    getEncryptionPublicKey: () => wallet.encryptionPublicKey,
    async balanceTx(tx: UnbalancedTransaction, _ps: unknown[]) {
      const txNew = await wallet.balanceTransaction(
        ZswapTransaction.deserialize(tx.serialize(getLedgerNetworkId()), getZswapNetworkId()),
        tx.callerAddress ?? wallet.address,
      );
      return wallet.submitTransaction(txNew);
    },
    async submitTx(tx: BalancedTransaction): Promise<any> {
      return await wallet.submitTransaction(tx.serialize(getZswapNetworkId()) as any);
    },
  };

  const midnightProvider: MidnightProvider = {
    async submitTx(tx: BalancedTransaction): Promise<FinalizedTxData> {
      const txSerialized = tx.serialize(getZswapNetworkId());
      const txIds = await wallet.submitTransaction(txSerialized as any);
      const txId = Array.isArray(txIds) ? txIds[0] : txIds;
      return {
        txHash: toHex(txId ?? new Uint8Array(32)),
        blockHeight: BigInt(0),
      };
    },
  };

  const zkConfigPath = path.resolve(
    currentDir, '..', '..', 'boilerplate', 'contract', 'src', 'managed', 'nighthire', 'keys'
  );

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: NightHirePrivateStateId,
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
    proofProvider: httpClientProofProvider(config.proofServer),
    walletProvider,
    midnightProvider,
  } as unknown as NightHireProviders;
}

// ── Wallet ───────────────────────────────────────────────────────────────────

export async function buildWalletAndWaitForFunds(
  config: Config,
  seed: string,
  _cacheFileName?: string
): Promise<Wallet & Resource> {
  // @ts-ignore WebSocket global for apollo client
  globalThis.WebSocket = WebSocket;

  const wallet = await WalletBuilder.native()
    .withNetworkId(getLedgerNetworkId())
    .withSeed(seed)
    .build() as unknown as Wallet & Resource;

  await new Promise<void>((resolve) => {
    const sub = (wallet as any).state().subscribe((s: any) => {
      const bal = s.balances?.[nativeToken()]?.valueOf?.() ?? BigInt(0);
      if (bal > BigInt(0)) { sub.unsubscribe(); resolve(); }
    });
    setTimeout(() => { sub.unsubscribe(); resolve(); }, 60_000);
  });

  return wallet;
}

export async function saveState(_wallet: Wallet & Resource, _name?: string): Promise<void> {
  // No-op in Wave 2 tests; production persistence is out of scope here.
}

// ── Contract module ──────────────────────────────────────────────────────────

const contractModule: any = (contracts as any).NightHire;
if (!contractModule) {
  throw new Error(
    'NightHire contract module not found in @midnight-ntwrk/contract. ' +
    'Did you run `npm run compact` in boilerplate/contract?'
  );
}
const NightHireContract: any = contractModule.Contract;
const ledgerDecoder: any = contractModule.ledger;

// ── Deploy ───────────────────────────────────────────────────────────────────

export type DeployedNightHire = {
  contract: any;
  contractAddress: ContractAddress;
};

export async function deploy(
  providers: NightHireProviders,
  adminKey: Uint8Array,
  privateState: any
): Promise<DeployedNightHire> {
  const deployed = await deployContract(providers as any, {
    compiledContract: NightHireContract,
    privateStateId: NightHirePrivateStateId,
    initialPrivateState: privateState,
    signingKey: adminKey,
    args: [adminKey],
  } as any) as any;
  return {
    contract: deployed,
    contractAddress: (deployed as any).deployTxData.public.contractAddress,
  };
}

// ── Ledger ───────────────────────────────────────────────────────────────────

export async function getLedgerState(
  providers: NightHireProviders,
  d: DeployedNightHire
): Promise<any> {
  const state = await (providers.publicDataProvider as any).queryContractState(
    d.contractAddress
  );
  if (!state?.data) throw new Error('No contract state returned by indexer');
  return ledgerDecoder(state.data);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function callCircuit(
  providers: NightHireProviders,
  d: DeployedNightHire,
  circuitId: string,
  args: any[]
): Promise<{ txHash: string; blockHeight: bigint }> {
  const fn = (d.contract as any)[circuitId];
  if (!fn) throw new Error(`Contract has no circuit: ${circuitId}`);
  const tx = await fn.call(d.contract, ...args);
  return { txHash: toHex(tx?.public?.txId ?? new Uint8Array(32)), blockHeight: BigInt(0) };
}

// ── Circuit wrappers ─────────────────────────────────────────────────────────

export const register            = (p: NightHireProviders, d: DeployedNightHire, _ps: any, cm: Uint8Array) =>
  callCircuit(p, d, 'register', [cm]);
export const issueCredential     = (p: NightHireProviders, d: DeployedNightHire, _ps: any) =>
  callCircuit(p, d, 'issueCredential', []);
export const submitRating        = (p: NightHireProviders, d: DeployedNightHire, _cm: Uint8Array, rating: bigint) =>
  callCircuit(p, d, 'submitRating', [_cm, rating]);
export const proveMinRating      = (p: NightHireProviders, d: DeployedNightHire, _ps: any, threshold: bigint) =>
  callCircuit(p, d, 'proveMinRating', [threshold]);
export const proveMinJobs        = (p: NightHireProviders, d: DeployedNightHire, _ps: any, threshold: bigint) =>
  callCircuit(p, d, 'proveMinJobs', [threshold]);
export const proveRegistered     = (p: NightHireProviders, d: DeployedNightHire, _ps: any) =>
  callCircuit(p, d, 'proveRegistered', []);
export const proveCredential     = (p: NightHireProviders, d: DeployedNightHire, _ps: any) =>
  callCircuit(p, d, 'proveCredential', []);
export const proveSalaryFits     = (p: NightHireProviders, d: DeployedNightHire, _ps: any, lower: bigint, upper: bigint) =>
  callCircuit(p, d, 'proveSalaryFits', [lower, upper]);
export const proveJurisdiction   = (p: NightHireProviders, d: DeployedNightHire, _ps: any, expected: Uint8Array) =>
  callCircuit(p, d, 'proveJurisdiction', [expected]);

// Re-export for test convenience.
export type { NightHirePrivateState } from './common-types';
