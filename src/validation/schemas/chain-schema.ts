import { z } from "zod";
import { chainIdSchema, ecosystemSchema, httpUrlSchema, nonEmptyStringSchema } from "./shared.js";

export const chainSchema = z.object({
  chainId: chainIdSchema,
  name: nonEmptyStringSchema,
  shortName: nonEmptyStringSchema,
  ecosystem: ecosystemSchema,
  nativeCurrency: z.object({
    name: nonEmptyStringSchema,
    symbol: nonEmptyStringSchema,
    decimals: z.number().int().nonnegative(),
  }),
  rpcUrls: z.array(httpUrlSchema),
  blockExplorers: z.array(httpUrlSchema),
  faucets: z.array(httpUrlSchema),
  testnet: z.boolean(),
  learn: z.string(),
});
