import { randomBytes } from "crypto";

export function generateToken(bytes = 24): string {
  return randomBytes(bytes).toString("hex");
}

export function generatePlayerToken(): string {
  return crypto.randomUUID();
}
