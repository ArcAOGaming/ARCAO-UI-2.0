import { connect, createDataItemSigner } from "@permaweb/aoconnect";

// Default URLs
const DEFAULT_CONFIG = {
  CU_URL: "https://ur-cu.randao.net",
  GATEWAY_URL: "https://arweave.net",
};


// Allow for environment variable overrides
export const AO_CONFIG = {
  // MU_URL: process.env.REACT_APP_MU_URL || DEFAULT_CONFIG.MU_URL,
  CU_URL: 'https://cu.ao-testnet.xyz',
   MU_URL:'https://mu.ao-testnet.xyz',
  MODE: "legacy" as const
};

// Create a single connection instance
const connection = connect(AO_CONFIG);

// Export individual methods
export const {
  result,
  results,
  message,
  spawn,
  monitor,
  unmonitor,
  dryrun,
} = connection;

// Export createDataItemSigner
export { createDataItemSigner };

// Export the full connection if needed
export default connection;
