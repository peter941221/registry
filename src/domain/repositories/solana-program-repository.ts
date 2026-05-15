import type { SolanaProgram } from "../entities/solana-program.js";
import type { SolanaCluster } from "../value-objects/solana-cluster.js";

export interface SolanaProgramRepository {
  getAll(): SolanaProgram[];
  getByKey(key: string): SolanaProgram | undefined;
  getByCluster(cluster: SolanaCluster): SolanaProgram[];
  getByAddress(programId: string, cluster: SolanaCluster): SolanaProgram | undefined;
}
