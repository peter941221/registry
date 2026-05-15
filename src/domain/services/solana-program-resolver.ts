import type { SolanaProgram } from "../entities/solana-program.js";
import type { SolanaProgramRepository } from "../repositories/solana-program-repository.js";
import type { SolanaCluster } from "../value-objects/solana-cluster.js";

export class SolanaProgramResolver {
  constructor(private readonly repo: SolanaProgramRepository) {}

  resolve(key: string): SolanaProgram | undefined {
    return this.repo.getByKey(key);
  }

  resolveByAddress(programId: string, cluster: SolanaCluster): SolanaProgram | undefined {
    return this.repo.getByAddress(programId, cluster);
  }
}
