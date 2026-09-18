import { Router } from "express";
import authRoutes from "@/modules/auth/auth.route";
import dreamRoutes from "@/modules/dream/dream.route";
import worldRoutes from "@/modules/world/world.route";

const mainRouter = Router();

mainRouter.use("/auth", authRoutes);
mainRouter.use("/dreams", dreamRoutes);
mainRouter.use("/generate", worldRoutes);

export default mainRouter;
