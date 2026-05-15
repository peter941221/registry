import chainsData from "../../data/chains.json" with { type: "json" };
import solanaProgramsData from "../../data/solana-programs.json" with { type: "json" };
import tokensData from "../../data/tokens.json" with { type: "json" };
import type { Chain } from "../domain/entities/chain.js";
import type { SolanaProgram } from "../domain/entities/solana-program.js";
import type { Token } from "../domain/entities/token.js";
import { ZodError, type ZodIssue } from "zod";
import { chainSchema } from "./schemas/chain-schema.js";
import { isValidIdentifierForEcosystem, nonEmptyStringSchema } from "./schemas/shared.js";
import { solanaProgramSchema } from "./schemas/solana-program-schema.js";
import { tokenSchema } from "./schemas/token-schema.js";

export interface ValidationIssue {
  file: "chains.json" | "solana-programs.json" | "tokens.json";
  path: string;
  message: string;
  severity: "error";
}

export interface RegistryDataInput {
  chains: unknown;
  solanaPrograms: unknown;
  tokens: unknown;
}

export function validateRegistry() {
  return validateRegistryData({
    chains: chainsData,
    solanaPrograms: solanaProgramsData,
    tokens: tokensData,
  });
}

export function validateRegistryData(data: RegistryDataInput) {
  const issues: ValidationIssue[] = [];
  const parsedChains = parseFile("chains.json", data.chains, chainSchema, issues);
  const parsedSolanaPrograms = parseFile(
    "solana-programs.json",
    data.solanaPrograms,
    solanaProgramSchema,
    issues,
  );
  const parsedTokens = parseFile("tokens.json", data.tokens, tokenSchema, issues);

  if (!parsedChains || !parsedSolanaPrograms || !parsedTokens) {
    return issues;
  }

  validateChainUniqueness(parsedChains, issues);
  validateSolanaProgramUniqueness(parsedSolanaPrograms, issues);
  validateSolanaProgramDeployments(parsedChains, parsedSolanaPrograms, issues);
  validateTokenUniqueness(parsedTokens, issues);
  validateTokenChainReferences(parsedChains, parsedTokens, issues);

  return issues;
}

export function formatValidationIssues(issues: ValidationIssue[]) {
  return issues.map((issue) => `${issue.file}:${issue.path} - ${issue.message}`).join("\n");
}

function parseFile<T>(
  file: ValidationIssue["file"],
  payload: unknown,
  itemSchema: {
    array(): {
      safeParse(
        input: unknown,
      ): { success: true; data: T[] } | { success: false; error: ZodError<T[]> };
    };
  },
  issues: ValidationIssue[],
) {
  const result = itemSchema.array().safeParse(payload);
  if (!result.success) {
    issues.push(...toValidationIssues(file, result.error.issues));
    return null;
  }
  return result.data;
}

function validateChainUniqueness(chains: Chain[], issues: ValidationIssue[]) {
  addDuplicateIssues({
    file: "chains.json",
    entries: chains,
    keySelector: (chain) => String(chain.chainId),
    pathSelector: (index) => `[${index}].chainId`,
    messageSelector: (value) => `Duplicate chainId "${value}"`,
    issues,
  });
  addDuplicateIssues({
    file: "chains.json",
    entries: chains,
    keySelector: (chain) => chain.shortName,
    pathSelector: (index) => `[${index}].shortName`,
    messageSelector: (value) => `Duplicate shortName "${value}"`,
    issues,
    normalize: (value) => value.toLowerCase(),
  });
}

function validateTokenUniqueness(tokens: Token[], issues: ValidationIssue[]) {
  addDuplicateIssues({
    file: "tokens.json",
    entries: tokens,
    keySelector: (token) => token.symbol,
    pathSelector: (index) => `[${index}].symbol`,
    messageSelector: (value) => `Duplicate symbol "${value}"`,
    issues,
    normalize: (value) => value.toUpperCase(),
  });
}

function validateSolanaProgramUniqueness(
  solanaPrograms: SolanaProgram[],
  issues: ValidationIssue[],
) {
  addDuplicateIssues({
    file: "solana-programs.json",
    entries: solanaPrograms,
    keySelector: (program) => program.key,
    pathSelector: (index) => `[${index}].key`,
    messageSelector: (value) => `Duplicate program key "${value}"`,
    issues,
    normalize: (value) => value.toLowerCase(),
  });
}

function validateSolanaProgramDeployments(
  chains: Chain[],
  solanaPrograms: SolanaProgram[],
  issues: ValidationIssue[],
) {
  const chainsById = new Map<number, Chain>(chains.map((chain) => [chain.chainId, chain]));
  const deploymentEntries: Array<{
    programIndex: number;
    deploymentIndex: number;
    deploymentKey: string;
  }> = [];

  solanaPrograms.forEach((program, programIndex) => {
    const seenProgramChainIds = new Set<number>();

    program.deployments.forEach((deployment, deploymentIndex) => {
      deploymentEntries.push({
        programIndex,
        deploymentIndex,
        deploymentKey: deployment.programId,
      });

      const chain = chainsById.get(deployment.chainId);
      if (!chain) {
        issues.push(
          createIssue(
            "solana-programs.json",
            `[${programIndex}].deployments[${deploymentIndex}].chainId`,
            `Unknown chainId "${deployment.chainId}" for program "${program.key}"`,
          ),
        );
        return;
      }

      if (chain.ecosystem !== "solana") {
        issues.push(
          createIssue(
            "solana-programs.json",
            `[${programIndex}].deployments[${deploymentIndex}].chainId`,
            `Program deployment must reference a Solana chain, received ecosystem "${chain.ecosystem}"`,
          ),
        );
      }

      if (seenProgramChainIds.has(deployment.chainId)) {
        issues.push(
          createIssue(
            "solana-programs.json",
            `[${programIndex}].deployments[${deploymentIndex}].chainId`,
            `Duplicate deployment chainId "${deployment.chainId}" in program "${program.key}"`,
          ),
        );
      } else {
        seenProgramChainIds.add(deployment.chainId);
      }

      if (!isValidIdentifierForEcosystem("solana", deployment.programId)) {
        issues.push(
          createIssue(
            "solana-programs.json",
            `[${programIndex}].deployments[${deploymentIndex}].programId`,
            `Invalid Solana program ID for chainId "${deployment.chainId}"`,
          ),
        );
      }
    });
  });

  addDuplicateIssues({
    file: "solana-programs.json",
    entries: deploymentEntries,
    keySelector: (entry) => {
      const deployment = solanaPrograms[entry.programIndex].deployments[entry.deploymentIndex];
      return `${deployment.chainId}:${entry.deploymentKey}`;
    },
    pathSelector: (entryIndex) =>
      `[${deploymentEntries[entryIndex].programIndex}].deployments[${deploymentEntries[entryIndex].deploymentIndex}].programId`,
    messageSelector: (value) => `Duplicate deployment "${value}" across Solana programs`,
    issues,
  });
}

function validateTokenChainReferences(chains: Chain[], tokens: Token[], issues: ValidationIssue[]) {
  const chainsById = new Map<number, Chain>(chains.map((chain) => [chain.chainId, chain]));

  tokens.forEach((token, tokenIndex) => {
    const seenChainIds = new Set<number>();

    token.chains.forEach((entry, chainIndex) => {
      const chain = chainsById.get(entry.chainId);
      if (!chain) {
        issues.push(
          createIssue(
            "tokens.json",
            `[${tokenIndex}].chains[${chainIndex}].chainId`,
            `Unknown chainId "${entry.chainId}" for token "${token.symbol}"`,
          ),
        );
        return;
      }

      if (seenChainIds.has(entry.chainId)) {
        issues.push(
          createIssue(
            "tokens.json",
            `[${tokenIndex}].chains[${chainIndex}].chainId`,
            `Duplicate chainId "${entry.chainId}" in token "${token.symbol}"`,
          ),
        );
      }
      seenChainIds.add(entry.chainId);

      if (!isValidIdentifierForEcosystem(chain.ecosystem, entry.address)) {
        issues.push(
          createIssue(
            "tokens.json",
            `[${tokenIndex}].chains[${chainIndex}].address`,
            `Invalid ${chain.ecosystem} token identifier for chainId "${chain.chainId}"`,
          ),
        );
      }
    });
  });
}

function addDuplicateIssues<T>({
  file,
  entries,
  keySelector,
  pathSelector,
  messageSelector,
  issues,
  normalize = (value) => value,
}: {
  file: ValidationIssue["file"];
  entries: T[];
  keySelector: (entry: T) => string;
  pathSelector: (index: number) => string;
  messageSelector: (value: string) => string;
  issues: ValidationIssue[];
  normalize?: (value: string) => string;
}) {
  const indexesByKey = new Map<string, number[]>();

  entries.forEach((entry, index) => {
    const rawValue = keySelector(entry);
    if (!nonEmptyStringSchema.safeParse(rawValue).success) {
      return;
    }

    const normalized = normalize(rawValue);
    const indexes = indexesByKey.get(normalized) ?? [];
    indexes.push(index);
    indexesByKey.set(normalized, indexes);
  });

  indexesByKey.forEach((indexes) => {
    if (indexes.length < 2) {
      return;
    }

    indexes.forEach((index) => {
      const value = keySelector(entries[index]);
      issues.push(createIssue(file, pathSelector(index), messageSelector(value)));
    });
  });
}

function toValidationIssues(file: ValidationIssue["file"], zodIssues: ZodIssue[]) {
  return zodIssues.map((issue) => createIssue(file, formatPath(issue.path), issue.message));
}

function formatPath(path: readonly (string | number | symbol)[]) {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") {
      return `${current}[${segment}]`;
    }

    if (typeof segment === "symbol") {
      return current;
    }

    return current ? `${current}.${segment}` : segment;
  }, "");
}

function createIssue(
  file: ValidationIssue["file"],
  path: string,
  message: string,
): ValidationIssue {
  return {
    file,
    path,
    message,
    severity: "error",
  };
}
