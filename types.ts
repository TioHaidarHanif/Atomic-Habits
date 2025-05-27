
export interface Habit {
  id: string;
  name: string;
  cue: string;
  intention: string; // e.g., "I will [BEHAVIOR] at [TIME] in [LOCATION]"
  createdAt: string; // ISO Date string
  completions: Record<string, boolean>; // Key: "YYYY-MM-DD", Value: true if completed
  stackWithHabitId?: string; // ID of an existing habit this new one is stacked after
  stackedWithHabitName?: string; // Display name of the habit it's stacked with (denormalized for UI)
  twoMinuteRule?: string; // A very small version of the habit
  identityGoal?: string; // Short description of the identity this habit supports
  temptationBundle?: string; // An enjoyable activity to do after completing the habit
  lastReviewDate?: string; // ISO Date string
  reviewNotes?: string; // User notes from review
}

// This interface is used in the App state, after calculating the streak
export interface HabitWithStreak extends Habit {
  currentStreak: number;
  isCompletedToday: boolean;
}

export enum ModelType {
  TEXT = 'gemini-2.5-flash-preview-04-17',
}