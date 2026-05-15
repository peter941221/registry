export type SolanaCluster = "mainnet-beta" | "devnet";

export function isSolanaCluster(value: string): value is SolanaCluster {
  return value === "mainnet-beta" || value === "devnet";
}
