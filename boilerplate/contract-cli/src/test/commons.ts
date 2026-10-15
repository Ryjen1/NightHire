// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Ryjen1 (NightHire contributors)
// Licensed under the Apache License, Version 2.0

import { type Config, StandaloneConfig, TestnetRemoteConfig, currentDir } from '../config';
import {
  DockerComposeEnvironment,
  GenericContainer,
  type StartedDockerComposeEnvironment,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';
import path from 'path';
import * as api from '../api';
import * as Rx from 'rxjs';
import { nativeToken } from '@midnight-ntwrk/ledger';
import type { Logger } from 'pino';
import type { Wallet } from '@midnight-ntwrk/wallet-api';
import type { Resource } from '@midnight-ntwrk/wallet';
import { expect } from 'vitest';

const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

export interface TestConfiguration {
  seed: string;
  dappConfig: Config;
  psMode: string;
  cacheFileName: string;
}

export class LocalTestConfig implements TestConfiguration {
  seed = GENESIS_MINT_WALLET_SEED;
  psMode = 'undeployed';
  cacheFileName = '';
  dappConfig = new StandaloneConfig();
}

export class TestEnvironment {
  private readonly logger?: Logger;
  private env: StartedDockerComposeEnvironment | undefined;
  private dockerEnv: DockerComposeEnvironment | undefined;
  private container: StartedTestContainer | undefined;
  private wallet: (Wallet & Resource) | undefined;
  private testConfig: TestConfiguration;

  constructor(logger?: Logger) {
    this.logger = logger;
    this.testConfig = new LocalTestConfig();
  }

  start = async (): Promise<TestConfiguration> => {
    this.testConfig = new LocalTestConfig();
    this.logger?.info('Test containers starting...');

    const composeFile = process.env.COMPOSE_FILE ?? 'standalone.yml';
    this.dockerEnv = new DockerComposeEnvironment(path.resolve(currentDir, '..'), composeFile)
      .withWaitStrategy(
        'counter-proof-server',
        Wait.forLogMessage('Actix runtime found; starting in Actix runtime', 1),
      )
      .withWaitStrategy('counter-indexer', Wait.forLogMessage(/starting indexing/, 1));
    this.env = await this.dockerEnv.up();

    this.testConfig.dappConfig = {
      ...this.testConfig.dappConfig,
      indexer: TestEnvironment.mapContainerPort(this.env, this.testConfig.dappConfig.indexer, 'counter-indexer'),
      indexerWS: TestEnvironment.mapContainerPort(this.env, this.testConfig.dappConfig.indexerWS, 'counter-indexer'),
      node: TestEnvironment.mapContainerPort(this.env, this.testConfig.dappConfig.node, 'counter-node'),
      proofServer: TestEnvironment.mapContainerPort(
        this.env, this.testConfig.dappConfig.proofServer, 'counter-proof-server',
      ),
    };
    return this.testConfig;
  };

  static mapContainerPort = (env: StartedDockerComposeEnvironment, url: string, containerName: string) => {
    const mappedUrl = new URL(url);
    const container = env.getContainer(containerName);
    mappedUrl.port = String(container.getFirstMappedPort());
    return mappedUrl.toString().replace(/\/+$/, '');
  };

  shutdown = async () => {
    if (this.wallet !== undefined) await this.wallet.close();
    if (this.env !== undefined) await this.env.down();
    if (this.container !== undefined) await this.container.stop();
  };

  getWallet = async () => {
    this.wallet = await api.buildWalletAndWaitForFunds(
      this.testConfig.dappConfig, this.testConfig.seed, this.testConfig.cacheFileName,
    );
    expect(this.wallet).not.toBeNull();
    const state = await Rx.firstValueFrom((this.wallet as any).state());
    expect(state.balances[nativeToken()].valueOf()).toBeGreaterThan(BigInt(0));
    return this.wallet;
  };

  saveWalletCache = async () => {
    if (this.wallet !== undefined) {
      await api.saveState(this.wallet, this.testConfig.cacheFileName);
    }
  };
}

export { api };
