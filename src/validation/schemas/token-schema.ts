import { z } from "zod";
import { chainIdSchema, nonEmptyStringSchema, optionalUrlOrEmptySchema } from "./shared.js";

export const tokenChainEntrySchema = z.object({
  chainId: chainIdSchema,
  address: nonEmptyStringSchema,
});

export const tokenSchema = z.object({
  symbol: nonEmptyStringSchema,
  name: nonEmptyStringSchema,
  decimals: z.number().int().nonnegative(),
  chains: z.array(tokenChainEntrySchema).min(1),
  logoUrl: optionalUrlOrEmptySchema,
  learn: z.string(),
});
