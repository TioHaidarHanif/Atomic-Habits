
import React from 'react';
import { HabitWithStreak } from '../types';
import HabitItem from './HabitItem';

interface HabitListProps {
  habits: HabitWithStreak[];
  onToggleComplete: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  // onGetAdvice: (habit: HabitWithStreak) => void; // Removed
  onOpenReviewModal: (habit: HabitWithStreak) => void;
}

const HabitList: React.FC<HabitListProps> = ({ habits, onToggleComplete, onDelete, onOpenReviewModal }) => {
  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <HabitItem
          key={habit.id}
          habit={habit}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          // onGetAdvice={onGetAdvice} // Removed
          onOpenReviewModal={onOpenReviewModal}
        />
      ))}
    </div>
  );
};

export default HabitList;