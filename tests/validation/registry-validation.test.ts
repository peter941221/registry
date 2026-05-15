import chainsData from "../../data/chains.json" with { type: "json" };
import tokensData from "../../data/tokens.json" with { type: "json" };
import {
  formatValidationIssues,
  validateRegistry,
  validateRegistryData,
} from "../../src/validation/registry-validator.js";

describe("registry validation", () => {
  it("passes for the committed registry data", () => {
    expect(validateRegistry()).toEqual([]);
  });

  it("reports missing required fields", () => {
    const data = cloneRegistryData();
    delete data.chains[0].name;

    const issues = validateRegistryData(data);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: "chains.json",
          path: "[0].name",
          severity: "error",
        }),
      ]),
    );
  });

  it("reports duplicate token symbols case-insensitively", () => {
    const data = cloneRegistryData();
    data.tokens.push({
      ...structuredClone(data.tokens[0]),
      symbol: data.tokens[0].symbol.toLowerCase(),
    });

    const issues = validateRegistryData(data);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: "tokens.json",
          path: "[0].symbol",
        }),
        expect.objectContaining({
          file: "tokens.json",
          path: `[${data.tokens.length - 1}].symbol`,
        }),
      ]),
    );
  });

  it("reports unknown chain references", () => {
    const data = cloneRegistryData();
    data.tokens[0].chains[0].chainId = 999999;

    const issues = validateRegistryData(data);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: "tokens.json",
          path: "[0].chains[0].chainId",
        }),
      ]),
    );
  });

  it("reports invalid ecosystem-specific identifiers", () => {
    const data = cloneRegistryData();
    data.tokens[0].chains[0].address = "not-an-evm-address";

    const issues = validateRegistryData(data);

    expect(formatValidationIssues(issues)).toContain(
      'tokens.json:[0].chains[0].address - Invalid evm token identifier for chainId "1"',
    );
  });
});

function cloneRegistryData() {
  return {
    chains: structuredClone(chainsData),
    tokens: structuredClone(tokensData),
  };
}
