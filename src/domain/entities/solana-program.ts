import type { SolanaCluster } from "../value-objects/solana-cluster.js";

export interface SolanaProgramDeployment {
  cluster: SolanaCluster;
  chainId: number;
  programId: string;
}

export interface SolanaProgram {
  key: string;
  name: string;
  ecosystem: "solana";
  deployments: SolanaProgramDeployment[];
  learn: string;
}
