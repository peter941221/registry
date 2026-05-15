import { describe, it, expect } from "vitest";
import {
  getAllChains,
  getChain,
  getChainsByEcosystem,
  getAllTokens,
  getToken,
  getTokensByChain,
} from "../../src/index.js";

describe("Public API", () => {
  it("getAllChains returns non-empty array", () => {
    expect(getAllChains().length).toBeGreaterThan(0);
  });
  it("getChain returns Ethereum for chainId 1", () => {
    const chain = getChain(1);
    expect(chain).toBeDefined();
    expect(chain?.name).toBe("Ethereum");
  });
  it("getChainsByEcosystem filters correctly", () => {
    const evmChains = getChainsByEcosystem("evm");
    expect(evmChains.length).toBeGreaterThan(0);
    evmChains.forEach((c) => expect(c.ecosystem).toBe("evm"));
  });
  it("getAllTokens returns non-empty array", () => {
    expect(getAllTokens().length).toBeGreaterThan(0);
  });
  it("getToken returns USDC", () => {
    const token = getToken("USDC");
    expect(token).toBeDefined();
    expect(token?.symbol).toBe("USDC");
  });
  it("getTokensByChain filters correctly", () => {
    const tokens = getTokensByChain(1);
    tokens.forEach((t) => expect(t.chains.some((c) => c.chainId === 1)).toBe(true));
  });
});
