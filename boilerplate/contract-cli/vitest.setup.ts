// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Ryjen1 (NightHire contributors)
// Licensed under the Apache License, Version 2.0

import protobuf from 'protobufjs';
import Long from 'long';

protobuf.util.Long = Long;
protobuf.configure();
