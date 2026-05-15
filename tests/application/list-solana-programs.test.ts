import {
  getAllSolanaPrograms,
  getSolanaProgram,
  getSolanaProgramByAddress,
  getSolanaProgramsByCluster,
} from "../../src/index.js";

describe("Solana program public API", () => {
  it("getAllSolanaPrograms returns non-empty array", () => {
    expect(getAllSolanaPrograms().length).toBeGreaterThan(0);
  });

  it("getSolanaProgram resolves by stable key", () => {
    const program = getSolanaProgram("spl-token");
    expect(program).toBeDefined();
    expect(program?.name).toBe("SPL Token Program");
  });

  it("getSolanaProgramsByCluster filters by cluster", () => {
    const devnetPrograms = getSolanaProgramsByCluster("devnet");
    expect(devnetPrograms.length).toBeGreaterThan(0);
    devnetPrograms.forEach((program) =>
      expect(program.deployments.some((deployment) => deployment.cluster === "devnet")).toBe(true),
    );
  });

  it("getSolanaProgramByAddress reverse-looks up a deployment", () => {
    const program = getSolanaProgramByAddress(
      "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
      "mainnet-beta",
    );
    expect(program).toBeDefined();
    expect(program?.key).toBe("raydium-amm-v4");
  });

  it("getSolanaProgramByAddress returns undefined for unknown deployments", () => {
    expect(
      getSolanaProgramByAddress("11111111111111111111111111111112", "mainnet-beta"),
    ).toBeUndefined();
  });
});
