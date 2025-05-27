
import React, { useState } from 'react';
import { Habit } from '../types';
import { IconPlus, IconInformationCircle, IconGift } from '../constants';
import LoadingSpinner from './LoadingSpinner';

interface AddHabitFormProps {
  onAddHabit: (habitData: Pick<Habit, 'name' | 'cue' | 'intention' | 'stackWithHabitId' | 'twoMinuteRule' | 'identityGoal' | 'temptationBundle'>) => void;
  existingHabits: Habit[];
  // isProcessing?: boolean; // Removed
}

const AddHabitForm: React.FC<AddHabitFormProps> = ({ onAddHabit, existingHabits }) => {
  const [name, setName] = useState('');
  const [cue, setCue] = useState('');
  const [intention, setIntention] = useState('');
  const [stackWithHabitId, setStackWithHabitId] = useState<string | undefined>(undefined);
  const [twoMinuteRule, setTwoMinuteRule] = useState('');
  const [identityGoal, setIdentityGoal] = useState('');
  const [temptationBundle, setTemptationBundle] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // if (isProcessing) return; // Removed
    if (!name.trim()) {
      alert("Habit name cannot be empty.");
      return;
    }
    if (!cue.trim()) {
      alert("Habit cue cannot be empty. E.g., 'After my morning coffee'");
      return;
    }
    if (!intention.trim()) {
      alert("Habit intention cannot be empty. E.g., 'I will read one page'");
      return;
    }
    onAddHabit({ name, cue, intention, stackWithHabitId, twoMinuteRule, identityGoal, temptationBundle });
    setName('');
    setCue('');
    setIntention('');
    setStackWithHabitId(undefined);
    setTwoMinuteRule('');
    setIdentityGoal('');
    setTemptationBundle('');
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <div className="my-6 text-center">
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center justify-center mx-auto disabled:opacity-70"
          aria-expanded="false"
          aria-controls="add-habit-form-fields"
          // disabled={isProcessing} // Removed
        >
          <IconPlus className="mr-2" />
          Add New Habit
        </button>
      </div>
    );
  }

  return (
    <div className="my-6 p-6 bg-white rounded-lg shadow-lg" id="add-habit-form-fields">
      <h2 className="text-2xl font-semibold mb-6 text-dark">Define a New Habit</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="habitName" className="block text-sm font-medium text-gray-700 mb-1">
            Habit Name
          </label>
          <input
            type="text"
            id="habitName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Read Every Day"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-colors"
            required
            // disabled={isProcessing} // Removed
          />
          <p className="text-xs text-gray-500 mt-1">What's the habit you want to build?</p>
        </div>
        <div>
          <label htmlFor="habitCue" className="block text-sm font-medium text-gray-700 mb-1">
            Cue (The Trigger)
          </label>
          <input
            type="text"
            id="habitCue"
            value={cue}
            onChange={(e) => setCue(e.target.value)}
            placeholder="e.g., After I finish dinner"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-colors"
            required
            // disabled={isProcessing} // Removed
          />
          <p className="text-xs text-gray-500 mt-1">When and where will this habit occur? Make it obvious.</p>
        </div>
        <div>
          <label htmlFor="habitIntention" className="block text-sm font-medium text-gray-700 mb-1">
            Implementation Intention
          </label>
          <input
            type="text"
            id="habitIntention"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="e.g., I will read 10 pages of a book in my living room"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-colors"
            required
            // disabled={isProcessing} // Removed
          />
          <p className="text-xs text-gray-500 mt-1">"I will [BEHAVIOR] at [TIME] in [LOCATION]". Make it specific.</p>
        </div>

        <hr className="my-4"/>
        <p className="text-sm font-medium text-gray-600">Atomic Habits Enhancements (Optional):</p>

        <div>
          <label htmlFor="habitStacking" className="flex items-center text-sm font-medium text-gray-700 mb-1">
            Habit Stacking
            <IconInformationCircle className="ml-1 text-gray-400" title="Pair this new habit with an existing one. 'After [CURRENT HABIT], I will [THIS NEW HABIT].'"/>
          </label>
          <select
            id="habitStacking"
            value={stackWithHabitId || ''}
            onChange={(e) => setStackWithHabitId(e.target.value || undefined)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-colors bg-white"
            // disabled={isProcessing} // Removed
          >
            <option value="">None - It's a standalone habit</option>
            {existingHabits.map(h => (
              <option key={h.id} value={h.id}>Stack after: {h.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Link this to an established routine.</p>
        </div>

        <div>
          <label htmlFor="twoMinuteRule" className="flex items-center text-sm font-medium text-gray-700 mb-1">
            Two-Minute Rule Version
             <IconInformationCircle className="ml-1 text-gray-400" title="What's a version of this habit that takes less than two minutes to do? e.g., 'Put on my running shoes' for a running habit."/>
          </label>
          <input
            type="text"
            id="twoMinuteRule"
            value={twoMinuteRule}
            onChange={(e) => setTwoMinuteRule(e.target.value)}
            placeholder="e.g., Read one sentence"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-colors"
            // disabled={isProcessing} // Removed
          />
          <p className="text-xs text-gray-500 mt-1">Make it so easy you can't say no.</p>
        </div>

        <div>
          <label htmlFor="identityGoal" className="flex items-center text-sm font-medium text-gray-700 mb-1">
            Identity Goal Supported
             <IconInformationCircle className="ml-1 text-gray-400" title="What kind of person do you become by performing this habit? e.g., 'A healthy person', 'A writer'."/>
          </label>
          <input
            type="text"
            id="identityGoal"
            value={identityGoal}
            onChange={(e) => setIdentityGoal(e.target.value)}
            placeholder="e.g., Become a more mindful person"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-colors"
            // disabled={isProcessing} // Removed
          />
          <p className="text-xs text-gray-500 mt-1">Focus on who you wish to become.</p>
        </div>

        <div>
          <label htmlFor="temptationBundle" className="flex items-center text-sm font-medium text-gray-700 mb-1">
            Temptation Bundle (Your Reward)
            <IconInformationCircle className="ml-1 text-gray-400" title="What enjoyable activity will you do immediately after this habit? 'After I [THIS HABIT], I will [YOUR REWARD].'"/>
          </label>
          <input
            type="text"
            id="temptationBundle"
            value={temptationBundle}
            onChange={(e) => setTemptationBundle(e.target.value)}
            placeholder="e.g., Watch one episode of my favorite show"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition-colors"
            // disabled={isProcessing} // Removed
          />
          <p className="text-xs text-gray-500 mt-1">Make it attractive by pairing it with something you want to do.</p>
        </div>
        
        <div className="flex items-center justify-end space-x-3 pt-2">
           <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-70"
            // disabled={isProcessing} // Removed
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-secondary hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm hover:shadow-md transition-all duration-150 ease-in-out flex items-center disabled:opacity-70"
            // disabled={isProcessing} // Removed
          >
            {/* {isProcessing ? <LoadingSpinner size="w-5 h-5 mr-2" color="border-white" /> : <IconPlus className="mr-2 w-5 h-5" />} */}
            {/* {isProcessing ? 'Adding...' : 'Add Habit'} */}
            <IconPlus className="mr-2 w-5 h-5" />
            Add Habit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHabitForm;
