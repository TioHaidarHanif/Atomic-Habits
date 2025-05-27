
import React from 'react';
import { HabitWithStreak } from '../types';
import { IconTrash, IconCheck, IconSquare, IconPencil, IconLink, IconBolt, IconUserCircle, IconGift } from '../constants'; // IconLightBulb removed

interface HabitItemProps {
  habit: HabitWithStreak;
  onToggleComplete: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  // onGetAdvice: (habit: HabitWithStreak) => void; // Removed
  onOpenReviewModal: (habit: HabitWithStreak) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, onToggleComplete, onDelete, onOpenReviewModal }) => {
  return (
    <div className={`p-5 mb-4 rounded-xl shadow-lg transition-all duration-300 ease-in-out ${habit.isCompletedToday ? 'bg-green-50 border-l-4 border-secondary' : 'bg-white border-l-4 border-gray-200 hover:shadow-xl'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-grow pr-4">
          <h3 className="text-xl font-semibold text-dark mb-1">{habit.name}</h3>
          <p className="text-sm text-gray-600 mb-1"><strong className="font-medium">Cue:</strong> {habit.cue}</p>
          <p className="text-sm text-gray-600 mb-3"><strong className="font-medium">Intention:</strong> {habit.intention}</p>
          
          {habit.stackedWithHabitName && (
            <p className="text-xs text-indigo-600 mb-2 flex items-center">
              <IconLink className="mr-1 w-3 h-3" />
              Stacked after: {habit.stackedWithHabitName}
            </p>
          )}
          {habit.twoMinuteRule && (
            <p className="text-xs text-teal-600 mb-2 flex items-center">
              <IconBolt className="mr-1 w-3 h-3 text-yellow-500" />
              2-Min Rule: {habit.twoMinuteRule}
            </p>
          )}
          {habit.identityGoal && (
            <p className="text-xs text-purple-600 mb-2 flex items-center">
              <IconUserCircle className="mr-1 w-3 h-3" />
              Identity: {habit.identityGoal}
            </p>
          )}
           {habit.temptationBundle && (
            <p className="text-xs text-pink-600 mb-3 flex items-center">
              <IconGift className="mr-1 w-3 h-3" />
              Reward: {habit.temptationBundle}
            </p>
          )}

          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <span 
              className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${habit.currentStreak > 0 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              🔥 {habit.currentStreak} Day{habit.currentStreak !== 1 ? 's' : ''} Streak
            </span>
            {/* Removed Tip button
             <button
              onClick={() => onGetAdvice(habit)}
              className="text-xs sm:text-sm text-primary hover:text-blue-700 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
              title="Get AI Advice for starting this habit"
            >
              <IconLightBulb className="w-4 h-4" />
              Tip
            </button> 
            */}
            <button
              onClick={() => onOpenReviewModal(habit)}
              className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 transition-colors border border-gray-300 px-2 py-0.5 rounded-md hover:bg-gray-50 disabled:opacity-50"
              title="Review Habit"
            >
              <IconPencil className="w-4 h-4" />
              Review
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2 ml-2 flex-shrink-0">
          <button
            onClick={() => onToggleComplete(habit.id)}
            title={habit.isCompletedToday ? "Mark as Incomplete for Today" : "Mark as Complete for Today"}
            aria-pressed={habit.isCompletedToday}
            className={`p-2 rounded-full transition-colors disabled:opacity-50 ${habit.isCompletedToday ? 'text-secondary hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
          >
            {habit.isCompletedToday ? <IconCheck className="w-7 h-7" /> : <IconSquare className="w-7 h-7" />}
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 disabled:opacity-50"
            title="Delete Habit"
            aria-label={`Delete habit ${habit.name}`}
          >
            <IconTrash />
          </button>
        </div>
      </div>
       {habit.lastReviewDate && (
        <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
            Last reviewed: {new Date(habit.lastReviewDate).toLocaleDateString()}
            {habit.reviewNotes && <span className="italic"> - Notes: "{habit.reviewNotes.substring(0,50)}{habit.reviewNotes.length > 50 ? '...' : ''}"</span>}
        </p>
      )}
    </div>
  );
};

export default HabitItem;