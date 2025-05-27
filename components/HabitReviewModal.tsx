
import React, { useState, useEffect } from 'react';
import { HabitWithStreak } from '../types';
import Modal from './Modal';
// Removed: import LoadingSpinner from './LoadingSpinner'; // No longer needed for AI advice loading
import { IconPencil, IconBolt, IconUserCircle, IconLink, IconGift } from '../constants';

interface HabitReviewModalProps {
  habit: HabitWithStreak;
  isOpen: boolean;
  onClose: () => void;
  onSaveReview: (habitId: string, notes: string) => void;
  // aiAdvice: string | null; // Removed
  // isLoadingAIAdvice: boolean; // Removed
  // errorAIAdvice: string | null; // Removed
}

const HabitReviewModal: React.FC<HabitReviewModalProps> = ({
  habit,
  isOpen,
  onClose,
  onSaveReview,
  // aiAdvice, // Removed
  // isLoadingAIAdvice, // Removed
  // errorAIAdvice, // Removed
}) => {
  const [reviewNotes, setReviewNotes] = useState(habit.reviewNotes || '');

  useEffect(() => {
    if (isOpen) {
      setReviewNotes(habit.reviewNotes || '');
    }
  }, [isOpen, habit.reviewNotes]);

  const handleSave = () => {
    onSaveReview(habit.id, reviewNotes);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reviewing: ${habit.name}`}>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700">Current Status:</h4>
          <p className="text-sm text-gray-600">
            🔥 {habit.currentStreak} Day{habit.currentStreak !== 1 ? 's' : ''} Streak
            {habit.isCompletedToday && <span className="text-green-600 ml-2">(Completed Today)</span>}
          </p>
          {habit.lastReviewDate && (
             <p className="text-xs text-gray-500">Last reviewed: {new Date(habit.lastReviewDate).toLocaleDateString()}</p>
          )}
        </div>

        {(habit.stackedWithHabitName || habit.twoMinuteRule || habit.identityGoal || habit.temptationBundle) && (
           <div>
            <h4 className="font-semibold text-gray-700 text-sm mb-1">Setup Details:</h4>
            {habit.stackedWithHabitName && (
                <p className="text-xs text-indigo-600 mb-1 flex items-center">
                <IconLink className="mr-1 w-3 h-3 flex-shrink-0" />
                Stacked after: {habit.stackedWithHabitName}
                </p>
            )}
            {habit.twoMinuteRule && (
                <p className="text-xs text-teal-600 mb-1 flex items-center">
                <IconBolt className="mr-1 w-3 h-3 text-yellow-500 flex-shrink-0" />
                2-Min Rule: {habit.twoMinuteRule}
                </p>
            )}
            {habit.identityGoal && (
                <p className="text-xs text-purple-600 mb-1 flex items-center">
                <IconUserCircle className="mr-1 w-3 h-3 flex-shrink-0" />
                Identity: {habit.identityGoal}
                </p>
            )}
            {habit.temptationBundle && (
                <p className="text-xs text-pink-600 mb-1 flex items-center">
                  <IconGift className="mr-1 w-3 h-3 flex-shrink-0" />
                  Reward: {habit.temptationBundle}
                </p>
            )}
          </div>
        )}

        {/* Removed AI Reflection & Advice section
        <div>
          <h4 className="font-semibold text-gray-700">AI Reflection & Advice:</h4>
          {isLoadingAIAdvice && (
            <div className="flex items-center text-gray-600">
              <LoadingSpinner size="w-5 h-5" />
              <span className="ml-2">Fetching AI insights...</span>
            </div>
          )}
          {errorAIAdvice && <p className="text-red-500 text-sm">{errorAIAdvice}</p>}
          {aiAdvice && !isLoadingAIAdvice && (
            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md whitespace-pre-line">{aiAdvice}</p>
          )}
        </div>
        */}

        <div>
          <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-1">
            Your Reflection Notes <IconPencil className="inline w-4 h-4 mb-0.5" />
          </label>
          <textarea
            id="reviewNotes"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
            placeholder="What's working? What's challenging? Any adjustments needed?"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-secondary hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-md transition-colors flex items-center"
          >
            Save Review
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default HabitReviewModal;