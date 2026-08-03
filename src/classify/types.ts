export type TaskType =
  | 'bugfix'
  | 'refactor'
  | 'feature'
  | 'doc'
  | 'explore'
  | 'open';

export interface Classification {
  type: TaskType;
  confidence: number;
}
