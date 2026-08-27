import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  localRating(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
}

export type ImpureCircuits<PS> = {
  register(context: __compactRuntime.CircuitContext<PS>,
           commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveRegistered(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  submitRating(context: __compactRuntime.CircuitContext<PS>, rating_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveMinRating(context: __compactRuntime.CircuitContext<PS>,
                 threshold_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
}

export type ProvableCircuits<PS> = {
  register(context: __compactRuntime.CircuitContext<PS>,
           commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveRegistered(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  submitRating(context: __compactRuntime.CircuitContext<PS>, rating_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  proveMinJobs(threshold_0: bigint): bigint;
  publicKey(sk_0: Uint8Array, seq_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  register(context: __compactRuntime.CircuitContext<PS>,
           commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveRegistered(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  submitRating(context: __compactRuntime.CircuitContext<PS>, rating_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveMinRating(context: __compactRuntime.CircuitContext<PS>,
                 threshold_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  proveMinJobs(context: __compactRuntime.CircuitContext<PS>, threshold_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  publicKey(context: __compactRuntime.CircuitContext<PS>,
            sk_0: Uint8Array,
            seq_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  readonly authority: Uint8Array;
  readonly candidateCount: bigint;
  readonly totalRatings: bigint;
  readonly ratingSum: bigint;
  readonly completedJobs: bigint;
  readonly sequence: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               adminSk_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
