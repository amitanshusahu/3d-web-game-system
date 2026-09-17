import { Router } from "express";
import authRoutes from "@/modules/auth/auth.route";

const mainRouter = Router();

mainRouter.use("/auth", authRoutes);

export default mainRouter;
