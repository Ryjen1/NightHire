// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Ryjen1 (NightHire contributors)
// Licensed under the Apache License, Version 2.0

// Re-export the compiled NightHire contract module and all witness helpers.
export * from "./witnesses.js";

import * as NightHireModule from "./managed/nighthire/contract/index.js";

export const contracts = {
  NightHire: NightHireModule,
};

export const NightHire = NightHireModule;
