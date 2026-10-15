// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Ryjen1 (NightHire contributors)
// Licensed under the Apache License, Version 2.0

import { contracts } from '@midnight-ntwrk/contract';
import type { ImpureCircuitId, MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';

const getContractModule = () => {
  const names = Object.keys(contracts);
  if (names.length === 0) throw new Error('No contract found in @midnight-ntwrk/contract');
  return (contracts as any)[names[0]];
};

const contractModule = getContractModule();

export type NightHirePrivateState =
  | { readonly role: 'authority'; readonly state: { readonly adminKey: Uint8Array } }
  | { readonly role: 'candidate'; readonly state: any };

export type NightHireCircuits = ImpureCircuitId<typeof contractModule.Contract>;
export const NightHirePrivateStateId = 'nighthirePrivateState';
export type NightHireProviders = MidnightProviders<NightHireCircuits, typeof NightHirePrivateStateId, NightHirePrivateState>;
export type NightHireContract = typeof contractModule.Contract;
export type DeployedNightHireContract = DeployedContract<NightHireContract> | FoundContract<NightHireContract>;
