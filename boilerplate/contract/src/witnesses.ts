import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WitnessContext } from '@midnight-ntwrk/compact-runtime';

// Get __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the folder inside ./managed if exists
const managedPath = path.join(__dirname, 'managed');
let Ledger: any = {};
if (fs.existsSync(managedPath)) {
  const folders = fs.readdirSync(managedPath).filter(f =>
    fs.statSync(path.join(managedPath, f)).isDirectory()
  );
  if (folders.length > 0) {
    const imported = await import(`./managed/${folders[0]}/contract/index.cjs`);
    Ledger = imported.Ledger;
  }
}

export type NightHirePrivateState = {
  readonly secretKey: Uint8Array;
  readonly rating?: number;
  readonly credentials?: string[];
};

export type CounterPrivateState = NightHirePrivateState;

export const createNightHirePrivateState = (
  secretKey: Uint8Array,
  rating: number = 5,
  credentials: string[] = []
): NightHirePrivateState => ({
  secretKey,
  rating,
  credentials,
});

export const createCounterPrivateState = createNightHirePrivateState;

export const witnesses = {
  localSecretKey: ({ privateState }: WitnessContext<typeof Ledger, NightHirePrivateState>): [NightHirePrivateState, Uint8Array] => {
    return [privateState, privateState.secretKey];
  },
  localRating: ({ privateState }: WitnessContext<typeof Ledger, NightHirePrivateState>): [NightHirePrivateState, bigint] => {
    return [privateState, BigInt(privateState.rating ?? 5)];
  },
};