export interface ClarifyingQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export interface AskResult {
  questions: ClarifyingQuestion[];
  answers?: Record<string, string>;
}
