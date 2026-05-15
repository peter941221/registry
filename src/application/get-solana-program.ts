import type { SolanaProgram } from "../domain/entities/solana-program.js";
import type { SolanaProgramRepository } from "../domain/repositories/solana-program-repository.js";

export function getSolanaProgram(
  repo: SolanaProgramRepository,
  key: string,
): SolanaProgram | undefined {
  return repo.getByKey(key);
}
