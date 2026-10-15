import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  localAuthorityKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  localRating(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  localCompletedJobs(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  localCredentialId(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  localCredentialSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  localSalaryLower(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  localSalaryUpper(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  localJurisdictionHash(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  register(context: __compactRuntime.CircuitContext<PS>,
           commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  candidateCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitRating(context: __compactRuntime.CircuitContext<PS>,
               candidateCommitment_0: Uint8Array,
               rating_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveMinRating(context: __compactRuntime.CircuitContext<PS>,
                 threshold_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  proveMinJobs(context: __compactRuntime.CircuitContext<PS>, threshold_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  proveRegistered(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  proveCredential(context: __compactRuntime.CircuitContext<PS>,
                  candidateCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveSalaryFits(context: __compactRuntime.CircuitContext<PS>,
                  jobLower_0: bigint,
                  jobUpper_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveJurisdiction(context: __compactRuntime.CircuitContext<PS>,
                    expectedCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  register(context: __compactRuntime.CircuitContext<PS>,
           commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  candidateCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitRating(context: __compactRuntime.CircuitContext<PS>,
               candidateCommitment_0: Uint8Array,
               rating_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveMinRating(context: __compactRuntime.CircuitContext<PS>,
                 threshold_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  proveMinJobs(context: __compactRuntime.CircuitContext<PS>, threshold_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  proveRegistered(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  proveCredential(context: __compactRuntime.CircuitContext<PS>,
                  candidateCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveSalaryFits(context: __compactRuntime.CircuitContext<PS>,
                  jobLower_0: bigint,
                  jobUpper_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveJurisdiction(context: __compactRuntime.CircuitContext<PS>,
                    expectedCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  register(context: __compactRuntime.CircuitContext<PS>,
           commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  candidateCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitRating(context: __compactRuntime.CircuitContext<PS>,
               candidateCommitment_0: Uint8Array,
               rating_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveMinRating(context: __compactRuntime.CircuitContext<PS>,
                 threshold_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  proveMinJobs(context: __compactRuntime.CircuitContext<PS>, threshold_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  proveRegistered(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  proveCredential(context: __compactRuntime.CircuitContext<PS>,
                  candidateCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveSalaryFits(context: __compactRuntime.CircuitContext<PS>,
                  jobLower_0: bigint,
                  jobUpper_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveJurisdiction(context: __compactRuntime.CircuitContext<PS>,
                    expectedCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly authority: Uint8Array;
  readonly candidateCount: bigint;
  readonly totalRatings: bigint;
  readonly ratingSum: bigint;
  readonly completedJobs: bigint;
  readonly sequence: bigint;
  credentialAttestations: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
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
               adminKey_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
