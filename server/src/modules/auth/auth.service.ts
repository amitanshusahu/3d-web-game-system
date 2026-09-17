import type { loginParams } from "@/types/auth/auth.model";

export async function loginUser(body: loginParams) {

  return {
    success: true,
    message: "User logged in successfully",
    data: body,
  }
}