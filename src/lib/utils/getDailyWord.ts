import { ANSWERS } from "@/lib/words/answers";

const EPOCH = new Date("2025-01-01T00:00:00Z");

export function getDailyWord(date?: Date): string {
  const target = date ?? new Date();
  const utcTarget = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate()
  );
  const utcEpoch = Date.UTC(
    EPOCH.getUTCFullYear(),
    EPOCH.getUTCMonth(),
    EPOCH.getUTCDate()
  );
  const dayIndex = Math.floor((utcTarget - utcEpoch) / 86_400_000);
  return ANSWERS[((dayIndex % ANSWERS.length) + ANSWERS.length) % ANSWERS.length];
}

export function getTodayString(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}
