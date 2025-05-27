
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-white p-6 shadow-md">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Atomic Habit Builder</h1>
        <p className="text-sm opacity-90">Turn small actions into lifelong habits.</p>
      </div>
    </header>
  );
};

export default Header;
