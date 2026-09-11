export interface Application {
  id: string;
  full_name: string;
  discord_tag: string;
  age: number;
  fivem_hours: number;
  division: string;
  scenario_answer: string;
  agreed_rules: boolean;
  status: "pending" | "accepted" | "rejected";
  note: string;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  role_granted: boolean;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  username: string;
  avatar?: string | null;
  score: number;
  total: number;
  passed: boolean;
  role_granted: boolean;
  created_at: string;
}

export interface DiscordMember {
  id: string;
  username: string;
  avatar?: string | null;
}

export interface AdminUser {
  email: string;
  role: string;
}
