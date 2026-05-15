import { JsonSolanaProgramRepository } from "../../src/infrastructure/repositories/json-solana-program-repository.js";
import { SolanaProgramResolver } from "../../src/domain/services/solana-program-resolver.js";

describe("SolanaProgramResolver", () => {
  const resolver = new SolanaProgramResolver(new JsonSolanaProgramRepository());

  it("resolves by key", () => {
    const program = resolver.resolve("spl-token");
    expect(program).toBeDefined();
    expect(program?.name).toBe("SPL Token Program");
  });

  it("resolves by address and cluster", () => {
    const program = resolver.resolveByAddress(
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      "mainnet-beta",
    );
    expect(program).toBeDefined();
    expect(program?.key).toBe("spl-token");
  });

  it("returns undefined for unknown keys", () => {
    expect(resolver.resolve("unknown-program")).toBeUndefined();
  });
});
