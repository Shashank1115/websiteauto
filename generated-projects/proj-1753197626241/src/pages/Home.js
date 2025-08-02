import React from 'react';

function Home() {
  return (
    <div className="p-4">
      <div className="bg-tuscan-cream p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-tuscan-red mb-4">The Tuscan Table</h1>
        <p className="text-lg text-gray-800 mb-8">
          Welcome to The Tuscan Table, where the warmth of Italy meets the freshest ingredients.
          Experience authentic Italian cuisine in an elegant and rustic setting.
        </p>
        <button className="bg-tuscan-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Book a Table
        </button>
      </div>
    </div>
  );
}

export default Home;