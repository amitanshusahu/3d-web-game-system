import { validateInput } from "@/lib/inputValidation";
import { loginSchema } from "@/types/auth/auth.model";
import { Router, type Request, type Response } from "express";
import { loginUser } from "./auth.service";


export async function loginController(req: Request, res: Response): Promise<Response> {
  try {
    const data = await validateInput(loginSchema);
    const result = await loginUser(data);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Invalid input" });
  }
}