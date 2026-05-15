import solanaProgramsData from "../../../data/solana-programs.json" with { type: "json" };
import type { SolanaProgram } from "../../domain/entities/solana-program.js";
import type { SolanaProgramRepository } from "../../domain/repositories/solana-program-repository.js";
import type { SolanaCluster } from "../../domain/value-objects/solana-cluster.js";

export class JsonSolanaProgramRepository implements SolanaProgramRepository {
  private readonly solanaPrograms: SolanaProgram[] = solanaProgramsData as SolanaProgram[];

  private readonly byKey = new Map<string, SolanaProgram>(
    this.solanaPrograms.map((program) => [program.key.toLowerCase(), program]),
  );

  getAll(): SolanaProgram[] {
    return this.solanaPrograms;
  }

  getByKey(key: string): SolanaProgram | undefined {
    return this.byKey.get(key.toLowerCase());
  }

  getByCluster(cluster: SolanaCluster): SolanaProgram[] {
    return this.solanaPrograms
      .map((program) => ({
        ...program,
        deployments: program.deployments.filter((deployment) => deployment.cluster === cluster),
      }))
      .filter((program) => program.deployments.length > 0);
  }

  getByAddress(programId: string, cluster: SolanaCluster): SolanaProgram | undefined {
    return this.solanaPrograms.find((program) =>
      program.deployments.some(
        (deployment) => deployment.cluster === cluster && deployment.programId === programId,
      ),
    );
  }
}
