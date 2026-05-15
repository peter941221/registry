import { z } from "zod";
import { chainIdSchema, nonEmptyStringSchema, solanaClusterSchema } from "./shared.js";

export const solanaProgramDeploymentSchema = z.object({
  cluster: solanaClusterSchema,
  chainId: chainIdSchema,
  programId: nonEmptyStringSchema,
});

export const solanaProgramSchema = z.object({
  key: nonEmptyStringSchema,
  name: nonEmptyStringSchema,
  ecosystem: z.literal("solana"),
  deployments: z.array(solanaProgramDeploymentSchema).min(1),
  learn: z.string(),
});
