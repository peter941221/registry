import { z } from "zod";
import {
  chainIdSchema,
  ecosystemSchema,
  httpUrlSchema,
  nonEmptyStringSchema,
  solanaClusterSchema,
} from "./shared.js";

export const chainSchema = z
  .object({
    chainId: chainIdSchema,
    name: nonEmptyStringSchema,
    shortName: nonEmptyStringSchema,
    ecosystem: ecosystemSchema,
    cluster: solanaClusterSchema.optional(),
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
  })
  .superRefine((chain, ctx) => {
    if (chain.ecosystem === "solana" && !chain.cluster) {
      ctx.addIssue({
        code: "custom",
        path: ["cluster"],
        message: 'Solana chains must declare a cluster ("mainnet-beta" or "devnet")',
      });
    }

    if (chain.ecosystem !== "solana" && chain.cluster) {
      ctx.addIssue({
        code: "custom",
        path: ["cluster"],
        message: 'Only Solana chains may declare a "cluster" field',
      });
    }
  });
