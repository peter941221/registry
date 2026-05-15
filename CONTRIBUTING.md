# Contributing to @w3-kit/registry

Thanks for your interest in contributing to the w3-kit chain and token registry!

## How to contribute

1. Fork the repo
2. Create a branch (`git checkout -b my-change`)
3. Make your changes
4. Run validation: `npm run validate`
5. Run tests: `npm test`
6. Run build: `npm run build`
7. Commit and push
8. Open a pull request

## What to contribute

- **Add chains** — add new chains to `data/chains.json`
- **Add tokens** — add new tokens to `data/tokens.json`
- **Add Solana programs** — add new entries to `data/solana-programs.json`
- **Add protocol ABIs** — add ABIs for DeFi protocols
- **Improve domain logic** — better validation, new resolvers
- **Fix bugs** — check [open issues](https://github.com/w3-kit/registry/issues)

## Architecture

This repo uses Domain-Driven Design (DDD):

- `src/domain/` — pure business logic, zero external deps
- `src/application/` — use cases (thin orchestration)
- `src/infrastructure/` — concrete implementations (JSON readers)

**Import rules:** domain imports nothing, application uses domain, infrastructure implements domain interfaces.

## Local development

```bash
git clone https://github.com/YOUR_USERNAME/registry.git
cd registry
npm install
npm run validate
npm run build
npm test
```

### Run all CI checks locally

```bash
npm run typecheck && npm run lint && npm run format:check && npm run validate && npm run build && npm test
```

## Adding a chain

Add an entry to `data/chains.json`:

```json
{
  "chainId": 1,
  "name": "Ethereum",
  "shortName": "eth",
  "ecosystem": "evm",
  "nativeCurrency": { "name": "Ether", "symbol": "ETH", "decimals": 18 },
  "rpcUrls": ["https://eth.llamarpc.com"],
  "blockExplorers": ["https://etherscan.io"],
  "faucets": [],
  "testnet": false,
  "learn": ""
}
```

Before opening a PR, run `npm run validate` to ensure the new entry matches the registry schema and does not duplicate an existing identifier.

## Adding a token

Add an entry to `data/tokens.json`:

```json
{
  "symbol": "USDC",
  "name": "USD Coin",
  "decimals": 6,
  "chains": [{ "chainId": 1, "address": "0xa0b8...4c68" }],
  "logoUrl": "",
  "learn": ""
}
```

Each token `chainId` must reference an existing chain entry. Token identifiers are validated against the referenced chain ecosystem:

- `evm` uses `0x...` 40-byte addresses
- `solana` uses base58 mint addresses
- `sui` / `aptos` accept Move-style type identifiers such as `0x2::sui::SUI`

## Adding a Solana program

Add an entry to `data/solana-programs.json`:

```json
{
  "key": "spl-token",
  "name": "SPL Token Program",
  "ecosystem": "solana",
  "deployments": [
    {
      "chainId": 101,
      "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    }
  ],
  "learn": ""
}
```

Use one semantic program per entry, then list per-chain deployments under `deployments[]`. Each deployment must reference a Solana chain entry and use a valid base58 program ID.
