import { z } from "zod";
import type { Chain } from "../../domain/entities/chain.js";
import { Address } from "../../domain/value-objects/address.js";
import { ChainId } from "../../domain/value-objects/chain-id.js";

const MOVE_TYPE_IDENTIFIER_REGEX =
  /^0x[0-9a-fA-F]+::[A-Za-z_][A-Za-z0-9_]*::[A-Za-z_][A-Za-z0-9_]*$/;

const BITCOIN_ADDRESS_REGEX = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{20,}$/;

export const nonEmptyStringSchema = z.string().min(1);

export const chainIdSchema = z
  .number()
  .int()
  .refine(
    (value) => {
      try {
        ChainId.create(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid chain ID" },
  );

export const ecosystemSchema = z.enum([
  "evm",
  "solana",
  "bitcoin",
  "sui",
  "aptos",
] satisfies Chain["ecosystem"][]);

export const solanaClusterSchema = z.enum(["mainnet-beta", "devnet"]);

export const httpUrlSchema = z.url({
  protocol: /^https?$/,
  hostname: z.regexes.domain,
});

export const optionalUrlOrEmptySchema = z.union([z.literal(""), httpUrlSchema]);

export function isValidIdentifierForEcosystem(
  ecosystem: Chain["ecosystem"],
  value: string,
): boolean {
  switch (ecosystem) {
    case "evm":
      return tryMatchAddressType(value, "evm");
    case "solana":
      return tryMatchAddressType(value, "solana");
    case "sui":
    case "aptos":
      return MOVE_TYPE_IDENTIFIER_REGEX.test(value);
    case "bitcoin":
      return BITCOIN_ADDRESS_REGEX.test(value);
    default:
      return false;
  }
}

function tryMatchAddressType(value: string, expectedType: "evm" | "solana") {
  try {
    return Address.create(value).type === expectedType;
  } catch {
    return false;
  }
}
