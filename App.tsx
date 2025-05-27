import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Habit, HabitWithStreak } from './types';
import { 
  getTodayDateString, 
  calculateCurrentStreak,
} from './services/habitService'; 
import { sqliteService } from './services/sqliteService'; 

import Header from './components/Header';
import AddHabitForm from './components/AddHabitForm';
import HabitList from './components/HabitList';
import LoadingSpinner from './components/LoadingSpinner';
import HabitReviewModal from './components/HabitReviewModal';
import { IconCloudArrowUp, IconWarning, IconCloudArrowDown, IconUpload, IconInformationCircle } from './constants'; // Added IconInformationCircle

const App: React.FC = () => {
  const [habits, setHabits] = useState<HabitWithStreak[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  const [selectedHabitForReview, setSelectedHabitForReview] = useState<HabitWithStreak | null>(null);
  
  const today = getTodayDateString();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showTemporaryStatus = (message: string, duration: number = 3000) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(null), duration);
  };

  const mapHabitsToHabitsWithStreak = useCallback((loadedHabits: Habit[]): HabitWithStreak[] => {
    return loadedHabits.map(habit => {
      let stackedWithHabitName: string | undefined = undefined;
      if (habit.stackWithHabitId) {
        const parentHabit = loadedHabits.find(h => h.id === habit.stackWithHabitId);
        if (parentHabit) {
          stackedWithHabitName = parentHabit.name;
        }
      }
      return {
        ...habit,
        completions: habit.completions || {}, 
        currentStreak: calculateCurrentStreak(habit.completions || {}, today),
        isCompletedToday: !!(habit.completions && habit.completions[today]),
        stackedWithHabitName: stackedWithHabitName || habit.stackedWithHabitName, 
      };
    }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [today]);

  const loadAppData = useCallback(async (isInitialLoad = true) => {
    if(isInitialLoad) setIsLoadingData(true);
    setDbError(null);
    try {
      await sqliteService.initializeDatabase();
      const loadedHabits = await sqliteService.getHabits();
      setHabits(mapHabitsToHabitsWithStreak(loadedHabits));
      if(!isInitialLoad) showTemporaryStatus("Data reloaded successfully.", 2000);
    } catch (error) {
      console.error("Failed to load app data:", error);
      setDbError("Could not load or initialize the habit database. Your data might not be saved. Try refreshing or importing a database.");
      setHabits([]); 
    } finally {
      if(isInitialLoad) setIsLoadingData(false);
    }
  }, [mapHabitsToHabitsWithStreak]);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  const handleAddHabit = async (newHabitData: Pick<Habit, 'name' | 'cue' | 'intention' | 'stackWithHabitId' | 'twoMinuteRule' | 'identityGoal' | 'temptationBundle'>) => {
    try {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        ...newHabitData,
        createdAt: new Date().toISOString(),
        completions: {},
      };
      
      await sqliteService.addHabit(newHabit);
      const updatedHabitsFromDB = await sqliteService.getHabits();
      setHabits(mapHabitsToHabitsWithStreak(updatedHabitsFromDB));
      showTemporaryStatus(`Habit "${newHabit.name}" added successfully!`, 2000);
    } catch (err) {
      console.error("Error adding habit:", err); 
      setDbError("Failed to add habit. Please try again.");
    }
  };
  
  const handleToggleHabitCompletion = async (habitId: string) => {
    const habitToUpdate = habits.find(h => h.id === habitId); 
    if (!habitToUpdate) return;

    const newCompletions = { ...(habitToUpdate.completions || {}) };
    if (newCompletions[today]) {
      delete newCompletions[today];
    } else {
      newCompletions[today] = true;
    }
    const { currentStreak, isCompletedToday, ...coreHabitToSave } = {
      ...habitToUpdate,
      completions: newCompletions,
    };

    try {
      await sqliteService.updateHabit(coreHabitToSave);
      const updatedHabitsFromDB = await sqliteService.getHabits();
      setHabits(mapHabitsToHabitsWithStreak(updatedHabitsFromDB));
    } catch (err) {
      console.error("Error toggling habit completion:", err);
      setDbError("Failed to update habit completion. Please try again.");
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    const habitToDelete = habits.find(h => h.id === habitId);
    if (window.confirm(`Are you sure you want to delete the habit "${habitToDelete?.name}"? This action cannot be undone.`)) {
      try {
        await sqliteService.deleteHabit(habitId);
        const updatedHabitsFromDB = await sqliteService.getHabits();
        setHabits(mapHabitsToHabitsWithStreak(updatedHabitsFromDB));
        showTemporaryStatus(`Habit "${habitToDelete?.name}" deleted.`, 2000);
      } catch (err) {
        console.error("Error deleting habit:", err);
        setDbError("Failed to delete habit. Please try again.");
      }
    }
  };
  
  const handleOpenReviewModal = (habit: HabitWithStreak) => {
    setSelectedHabitForReview(habit);
  };

  const handleCloseReviewModal = () => {
    setSelectedHabitForReview(null);
  };

  const handleSaveReview = async (habitId: string, notes: string) => {
    const habitToUpdate = habits.find(h => h.id === habitId); 
    if (!habitToUpdate) return;

    const reviewDate = new Date().toISOString();
    const { currentStreak, isCompletedToday, ...coreHabitToSave } = {
        ...habitToUpdate, 
        reviewNotes: notes,
        lastReviewDate: reviewDate
    };

    try {
        await sqliteService.updateHabit(coreHabitToSave);
        const updatedHabitsFromDB = await sqliteService.getHabits();
        setHabits(mapHabitsToHabitsWithStreak(updatedHabitsFromDB));
        handleCloseReviewModal(); 
        showTemporaryStatus("Habit review saved.", 2000);
    } catch (err) {
        console.error("Error saving review:", err);
        setDbError("Failed to save habit review. Please try again.");
    }
  };

  const handleExportDatabase = async () => {
    try {
      const binaryArray = await sqliteService.getDatabaseBinary();
      if (binaryArray) {
        const blob = new Blob([binaryArray], { type: 'application/x-sqlite3' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];
        link.download = `atomic_habits_backup_${date}.db`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        showTemporaryStatus("Database exported successfully!", 2000);
      } else {
        setDbError("Could not export database. It might not be initialized.");
      }
    } catch (error) {
      console.error("Error exporting database:", error);
      setDbError("An error occurred during database export.");
    }
  };

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.db')) {
        setDbError("Invalid file type. Please select a .db file.");
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const binary = e.target?.result;
        if (binary instanceof ArrayBuffer) {
          await sqliteService.replaceDatabaseWithBinary(new Uint8Array(binary));
          await loadAppData(false); // Reload data after import
          showTemporaryStatus("Database imported successfully!", 2000);
          setDbError(null); // Clear previous errors on successful import
        } else {
          throw new Error("Failed to read file as ArrayBuffer.");
        }
      } catch (error) {
        console.error("Error importing database:", error);
        setDbError("Failed to import database. The file might be corrupted or not a valid habit database.");
      } finally {
        // Reset file input to allow importing the same file again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
        setDbError("Error reading the selected file.");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  };
  
  const coreHabitsForForm = habits.map(({ currentStreak, isCompletedToday, stackedWithHabitName, ...coreHabit }) => coreHabit);

  return (
    <div className="min-h-screen bg-light">
      <Header />
      <main className="container mx-auto p-4 md:p-6 max-w-3xl">
        
        {dbError && (
          <div className="my-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-3" role="alert">
            <IconWarning className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <strong className="font-bold">Database Error:</strong>
              <span className="block sm:inline ml-1">{dbError}</span>
            </div>
          </div>
        )}
        {statusMessage && (
          <div className="my-4 p-3 bg-blue-100 border border-blue-300 text-blue-700 rounded-md flex items-center gap-3" role="status">
             <IconInformationCircle className="w-5 h-5 text-blue-600 flex-shrink-0" title="Status message" />
            <span>{statusMessage}</span>
          </div>
        )}

        <AddHabitForm 
            onAddHabit={handleAddHabit} 
            existingHabits={coreHabitsForForm} 
        />

        <section aria-labelledby="habits-heading" className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 id="habits-heading" className="text-2xl font-semibold text-dark">
              Your Habits
            </h2>
            {isLoadingData && <LoadingSpinner size="w-6 h-6" />}
          </div>

          {isLoadingData && (
            <div className="text-center py-10">
              <LoadingSpinner size="w-12 h-12 mx-auto" />
              <p className="text-gray-600 mt-3">Loading your habits from the database...</p>
               <IconCloudArrowUp className="w-16 h-16 text-primary mx-auto mt-4 opacity-50" />
            </div>
          )}
          {!isLoadingData && !dbError && (
            <HabitList
              habits={habits}
              onToggleComplete={handleToggleHabitCompletion}
              onDelete={handleDeleteHabit}
              onOpenReviewModal={handleOpenReviewModal}
            />
          )}
           {!isLoadingData && !dbError && habits.length === 0 && (
             <div className="text-center py-10">
                <img 
                  src="https://picsum.photos/seed/plantgrowth/300/200" 
                  alt="Illustration of a small plant growing, symbolizing new beginnings." 
                  className="mx-auto mb-4 rounded-lg opacity-75 shadow-sm" 
                />
                <p className="text-gray-600 text-lg">No habits defined yet.</p>
                <p className="text-gray-500">Use the "Add New Habit" button to get started on your journey!</p>
              </div>
           )}
            {!isLoadingData && dbError && habits.length === 0 && (
                 <div className="text-center py-10 bg-yellow-50 p-6 rounded-lg shadow">
                    <IconWarning className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <p className="text-yellow-700 text-lg font-semibold">Could not load habits.</p>
                    <p className="text-yellow-600">There was an issue with the local database. Please try refreshing the page or importing a backup.</p>
                  </div>
            )}
        </section>

        <section aria-labelledby="data-management-heading" className="mt-10 pt-6 border-t border-gray-200">
            <h2 id="data-management-heading" className="text-xl font-semibold text-dark mb-4">
              Data Management
            </h2>
            <div className="p-4 bg-white rounded-lg shadow space-y-3 md:space-y-0 md:flex md:items-center md:space-x-4">
                <button
                    onClick={handleExportDatabase}
                    className="w-full md:w-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                    <IconCloudArrowDown className="w-5 h-5 mr-2" />
                    Export Database (.db)
                </button>
                <div>
                    <label
                        htmlFor="import-db-file"
                        className="w-full md:w-auto cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                        <IconUpload className="w-5 h-5 mr-2" />
                        Import Database (.db)
                    </label>
                    <input
                        type="file"
                        id="import-db-file"
                        accept=".db"
                        onChange={handleImportDatabase}
                        className="hidden"
                        ref={fileInputRef}
                    />
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
                You can export your habit data as a standard SQLite (.db) file for backup or use on other devices/apps.
                Importing a .db file will replace your current data in this browser.
            </p>
        </section>


        {selectedHabitForReview && (
          <HabitReviewModal
            habit={selectedHabitForReview}
            isOpen={!!selectedHabitForReview}
            onClose={handleCloseReviewModal}
            onSaveReview={handleSaveReview}
          />
        )}
      </main>
      <footer className="text-center py-8 text-gray-500 text-sm border-t border-gray-200 mt-12">
        <p>&copy; {new Date().getFullYear()} Atomic Habit Builder. Inspired by James Clear.</p>
        <p>Habit data is stored locally in your browser's SQLite database (backed by localStorage).</p>
        <p>Use Export/Import options for manual file backups.</p>
        <p>Small changes, remarkable results.</p>
      </footer>
    </div>
  );
};

export default App;