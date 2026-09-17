import { validateInput } from "@/lib/inputValidation";
import { Router, type Request, type Response } from "express";
const router = Router();

router.post(
  "/login",
  validateInput(),
  async (req: Request, res: Response): Promise<Response> => {

  }
)