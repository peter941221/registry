export interface SolanaProgramDeployment {
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
