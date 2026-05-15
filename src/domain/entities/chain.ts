import type { SolanaCluster } from "../value-objects/solana-cluster.js";

export interface Chain {
  chainId: number;
  name: string;
  shortName: string;
  ecosystem: "evm" | "solana" | "bitcoin" | "sui" | "aptos";
  cluster?: SolanaCluster;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorers: string[];
  faucets: string[];
  testnet: boolean;
  learn: string;
}
