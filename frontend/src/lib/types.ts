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
  token?: string;
}

export interface AdminUser {
  email: string;
  role: string;
}
