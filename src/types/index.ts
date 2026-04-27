export type LetterState = "correct" | "present" | "absent" | "empty" | "typing";

export type GameStatus = "playing" | "won" | "lost";

export type ChallengeStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired";

export interface GuessResult {
  letter: string;
  state: LetterState;
}

export interface EvaluatedGuess {
  word: string;
  result: GuessResult[];
}

export interface GameSession {
  id: string;
  player_token: string;
  player_email: string | null;
  challenge_id: string | null;
  game_date: string;
  guesses: string[];
  status: GameStatus;
  created_at: string;
  completed_at: string | null;
}

export interface Challenge {
  id: string;
  invite_token: string;
  creator_email: string;
  opponent_email: string;
  status: ChallengeStatus;
  creator_session_id: string | null;
  opponent_session_id: string | null;
  game_date: string;
  created_at: string;
  expires_at: string;
}

export interface GameState {
  sessionId: string | null;
  guesses: EvaluatedGuess[];
  currentGuess: string;
  status: GameStatus;
  challenge: ChallengeState | null;
  error: string | null;
}

export interface ChallengeState {
  id: string;
  status: ChallengeStatus;
  creatorEmail: string;
  opponentEmail: string;
  isCreator: boolean;
}

export type KeyState = Record<string, LetterState>;
