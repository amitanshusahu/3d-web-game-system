import { Router } from "express";
import { requireAuth } from "@/lib/auth/authMiddleware";
import { validateBody } from "@/lib/inputValidation";
import { createDreamSchema } from "@/sharedTypes/dream/dream.model";
import { createDreamController, getDreamController, listDreamsController } from "./dream.controller";

const router = Router();

router.use(requireAuth);
router.post("/", validateBody(createDreamSchema), createDreamController);
router.get("/", listDreamsController);
router.get("/:id", getDreamController);

export default router;
