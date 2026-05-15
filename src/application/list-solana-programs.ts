import type { SolanaProgram } from "../domain/entities/solana-program.js";
import type { SolanaProgramRepository } from "../domain/repositories/solana-program-repository.js";
import type { SolanaCluster } from "../domain/value-objects/solana-cluster.js";

export interface SolanaProgramFilter {
  cluster?: SolanaCluster;
}

export function listSolanaPrograms(
  repo: SolanaProgramRepository,
  filter?: SolanaProgramFilter,
): SolanaProgram[] {
  if (filter?.cluster) {
    return repo.getByCluster(filter.cluster);
  }

  return repo.getAll();
}
