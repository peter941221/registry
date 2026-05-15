import chainsData from "../../data/chains.json" with { type: "json" };
import solanaProgramsData from "../../data/solana-programs.json" with { type: "json" };
import tokensData from "../../data/tokens.json" with { type: "json" };
import { validateRegistryData } from "../../src/validation/registry-validator.js";

describe("Solana program validation", () => {
  it("reports duplicate program keys case-insensitively", () => {
    const data = cloneRegistryData();
    data.solanaPrograms.push({
      ...structuredClone(data.solanaPrograms[0]),
      key: data.solanaPrograms[0].key.toUpperCase(),
    });

    const issues = validateRegistryData(data);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: "solana-programs.json",
          path: "[0].key",
        }),
        expect.objectContaining({
          file: "solana-programs.json",
          path: `[${data.solanaPrograms.length - 1}].key`,
        }),
      ]),
    );
  });

  it("rejects non-Solana chain references", () => {
    const data = cloneRegistryData();
    data.solanaPrograms[0].deployments[0].chainId = 1;

    const issues = validateRegistryData(data);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: "solana-programs.json",
          path: "[0].deployments[0].chainId",
        }),
      ]),
    );
  });

  it("rejects invalid program IDs", () => {
    const data = cloneRegistryData();
    data.solanaPrograms[0].deployments[0].programId = "invalid-program-id";

    const issues = validateRegistryData(data);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: "solana-programs.json",
          path: "[0].deployments[0].programId",
        }),
      ]),
    );
  });

  it("rejects cluster and chainId mismatches", () => {
    const data = cloneRegistryData();
    data.solanaPrograms[0].deployments[0].chainId = 103;

    const issues = validateRegistryData(data);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: "solana-programs.json",
          path: "[0].deployments[0].cluster",
          message: 'ChainId "103" maps to cluster "devnet", not "mainnet-beta"',
        }),
      ]),
    );
  });

  it("rejects Solana chains whose cluster cannot be inferred from chain metadata", () => {
    const data = cloneRegistryData();
    const devnetChainIndex = data.chains.findIndex((chain) => chain.chainId === 103);

    data.chains[devnetChainIndex] = {
      ...data.chains[devnetChainIndex],
      name: "Solana Unknown",
      shortName: "sol-unknown",
      rpcUrls: ["https://api.custom-solana.example"],
      blockExplorers: ["https://explorer.custom-solana.example"],
      faucets: [],
    };

    const issues = validateRegistryData(data);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: "solana-programs.json",
          path: "[0].deployments[1].chainId",
          message: 'Unable to infer Solana cluster for chainId "103" from chains.json',
        }),
      ]),
    );
  });

  it("reports duplicate deployments for every conflicting entry", () => {
    const data = cloneRegistryData();
    data.solanaPrograms.push({
      ...structuredClone(data.solanaPrograms[0]),
      key: "system-program-copy",
    });

    const issues = validateRegistryData(data);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: "solana-programs.json",
          path: "[0].deployments[0].programId",
        }),
        expect.objectContaining({
          file: "solana-programs.json",
          path: "[0].deployments[1].programId",
        }),
        expect.objectContaining({
          file: "solana-programs.json",
          path: `[${data.solanaPrograms.length - 1}].deployments[0].programId`,
        }),
        expect.objectContaining({
          file: "solana-programs.json",
          path: `[${data.solanaPrograms.length - 1}].deployments[1].programId`,
        }),
      ]),
    );
  });
});

function cloneRegistryData() {
  return {
    chains: structuredClone(chainsData),
    solanaPrograms: structuredClone(solanaProgramsData),
    tokens: structuredClone(tokensData),
  };
}
