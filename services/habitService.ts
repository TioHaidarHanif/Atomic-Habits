import { Habit } from '../types';

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
};

export const calculateCurrentStreak = (completions: Record<string, boolean>, todayString: string): number => {
  let streak = 0;
  let currentDate = new Date(todayString);

  // Ensure completions is an object before trying to access properties on it
  if (typeof completions !== 'object' || completions === null) {
    return 0; 
  }

  while (completions[currentDate.toISOString().split('T')[0]]) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  return streak;
};

export const calculateCompletionRate = (completions: Record<string, boolean>, days: number): number => {
  if (days <= 0) return 0;
  
  // Ensure completions is an object
  if (typeof completions !== 'object' || completions === null) {
    return 0;
  }

  const today = new Date();
  let completedCount = 0;
  for (let i = 0; i < days; i++) {
    const dateToCheck = new Date(today);
    dateToCheck.setDate(today.getDate() - i);
    const dateString = dateToCheck.toISOString().split('T')[0];
    if (completions[dateString]) {
      completedCount++;
    }
  }
  return (completedCount / days) * 100;
};