import React from 'react';

const HomePage = () => {
  return (
    <div className="container mx-auto p-8">
      <section className="bg-gray-100 p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Jane Doe</h1>
        <h2 className="text-2xl font-medium text-gray-600 mb-8">UI/UX Designer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project Thumbnails (replace with actual projects) */}
          <div className="bg-gray-200 p-4 rounded-lg shadow-sm">
            <img src="https://placehold.co/600x400" alt="Project 1" className="w-full h-auto" />
          </div>
          <div className="bg-gray-200 p-4 rounded-lg shadow-sm">
            <img src="https://placehold.co/600x400" alt="Project 2" className="w-full h-auto" />
          </div>
          <div className="bg-gray-200 p-4 rounded-lg shadow-sm">
            <img src="https://placehold.co/600x400" alt="Project 3" className="w-full h-auto" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;