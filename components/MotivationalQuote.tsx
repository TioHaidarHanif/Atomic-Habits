
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { IconRefresh } from '../constants';

interface MotivationalQuoteProps {
  quote: string | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({ quote, isLoading, error, onRefresh }) => {
  return (
    <div className="bg-slate-100 p-4 my-6 rounded-lg shadow text-center min-h-[100px] flex flex-col justify-center items-center">
      {isLoading && <LoadingSpinner />}
      {!isLoading && error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && quote && (
        <blockquote className="text-gray-700 italic text-lg">
          "{quote}"
        </blockquote>
      )}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="mt-3 text-sm text-primary hover:text-blue-700 disabled:opacity-50 flex items-center gap-1"
        aria-label="Refresh motivational quote"
      >
        <IconRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin-slow' : ''}`} />
        New Quote
      </button>
    </div>
  );
};

export default MotivationalQuote;
