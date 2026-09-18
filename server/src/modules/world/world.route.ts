import { Router } from "express";
import { requireAuth } from "@/lib/auth/authMiddleware";
import { validateBody } from "@/lib/inputValidation";
import { generateWorldSchema } from "@/sharedTypes/dream/dream.model";
import { generateWorldController } from "./world.controller";

const router = Router();

router.use(requireAuth);
router.post("/world", validateBody(generateWorldSchema), generateWorldController);

export default router;
