// Domain types (public)
import type { Chain } from "./domain/entities/chain.js";
export type { Chain };
export type { SolanaProgram, SolanaProgramDeployment } from "./domain/entities/solana-program.js";
export type { Token } from "./domain/entities/token.js";
export type { ChainRepository } from "./domain/repositories/chain-repository.js";
export type { SolanaProgramRepository } from "./domain/repositories/solana-program-repository.js";
export type { TokenRepository } from "./domain/repositories/token-repository.js";
export type { ChainFilter } from "./application/list-chains.js";
export type { SolanaProgramFilter } from "./application/list-solana-programs.js";
export type { TokenFilter } from "./application/list-tokens.js";

// Value objects
export { ChainId } from "./domain/value-objects/chain-id.js";
export { Address } from "./domain/value-objects/address.js";
export { getNetworkType } from "./domain/value-objects/network-type.js";
export type { NetworkType } from "./domain/value-objects/network-type.js";
export { isSolanaCluster } from "./domain/value-objects/solana-cluster.js";
export type { SolanaCluster } from "./domain/value-objects/solana-cluster.js";

// Infrastructure (default implementations)
import { JsonChainRepository } from "./infrastructure/repositories/json-chain-repository.js";
import { JsonSolanaProgramRepository } from "./infrastructure/repositories/json-solana-program-repository.js";
import { JsonTokenRepository } from "./infrastructure/repositories/json-token-repository.js";

const chainRepo = new JsonChainRepository();
const solanaProgramRepo = new JsonSolanaProgramRepository();
const tokenRepo = new JsonTokenRepository();

import { getChain as _getChain } from "./application/get-chain.js";
import { getSolanaProgram as _getSolanaProgram } from "./application/get-solana-program.js";
import { listChains as _listChains } from "./application/list-chains.js";
import { listSolanaPrograms as _listSolanaPrograms } from "./application/list-solana-programs.js";
import { getToken as _getToken } from "./application/get-token.js";
import { listTokens as _listTokens } from "./application/list-tokens.js";

export function getAllChains() {
  return _listChains(chainRepo);
}
export function getChain(chainId: number) {
  return _getChain(chainRepo, chainId);
}
export function getChainsByEcosystem(ecosystem: Chain["ecosystem"]) {
  return _listChains(chainRepo, { ecosystem });
}
export function getAllSolanaPrograms() {
  return _listSolanaPrograms(solanaProgramRepo);
}
export function getSolanaProgram(key: string) {
  return _getSolanaProgram(solanaProgramRepo, key);
}
export function getSolanaProgramsByCluster(
  cluster: import("./domain/value-objects/solana-cluster.js").SolanaCluster,
) {
  return _listSolanaPrograms(solanaProgramRepo, { cluster });
}
export function getSolanaProgramByAddress(
  programId: string,
  cluster: import("./domain/value-objects/solana-cluster.js").SolanaCluster,
) {
  return solanaProgramRepo.getByAddress(programId, cluster);
}
export function getAllTokens() {
  return _listTokens(tokenRepo);
}
export function getToken(symbol: string) {
  return _getToken(tokenRepo, symbol);
}
export function getTokensByChain(chainId: number) {
  return _listTokens(tokenRepo, { chainId });
}
