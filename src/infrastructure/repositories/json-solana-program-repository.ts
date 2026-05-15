import chainsData from "../../../data/chains.json" with { type: "json" };
import solanaProgramsData from "../../../data/solana-programs.json" with { type: "json" };
import type { Chain } from "../../domain/entities/chain.js";
import type { SolanaProgram } from "../../domain/entities/solana-program.js";
import type { SolanaProgramRepository } from "../../domain/repositories/solana-program-repository.js";
import type { SolanaCluster } from "../../domain/value-objects/solana-cluster.js";

export class JsonSolanaProgramRepository implements SolanaProgramRepository {
  private readonly chains: Chain[] = chainsData as Chain[];
  private readonly solanaPrograms: SolanaProgram[] = solanaProgramsData as SolanaProgram[];

  private readonly byKey = new Map<string, SolanaProgram>(
    this.solanaPrograms.map((program) => [program.key.toLowerCase(), program]),
  );

  private readonly chainIdsByCluster = buildChainIdsByCluster(this.chains);

  getAll(): SolanaProgram[] {
    return this.solanaPrograms;
  }

  getByKey(key: string): SolanaProgram | undefined {
    return this.byKey.get(key.toLowerCase());
  }

  getByCluster(cluster: SolanaCluster): SolanaProgram[] {
    const chainIds = this.chainIdsByCluster.get(cluster) ?? new Set<number>();
    return this.solanaPrograms.filter((program) =>
      program.deployments.some((deployment) => chainIds.has(deployment.chainId)),
    );
  }

  getByAddress(programId: string, cluster: SolanaCluster): SolanaProgram | undefined {
    const chainIds = this.chainIdsByCluster.get(cluster) ?? new Set<number>();
    return this.solanaPrograms.find((program) =>
      program.deployments.some(
        (deployment) => chainIds.has(deployment.chainId) && deployment.programId === programId,
      ),
    );
  }
}

function buildChainIdsByCluster(chains: Chain[]) {
  const chainIdsByCluster = new Map<SolanaCluster, Set<number>>([
    ["mainnet-beta", new Set<number>()],
    ["devnet", new Set<number>()],
  ]);

  chains.forEach((chain) => {
    const cluster = chain.ecosystem === "solana" ? chain.cluster : undefined;
    if (!cluster) {
      return;
    }

    chainIdsByCluster.get(cluster)?.add(chain.chainId);
  });

  return chainIdsByCluster;
}
