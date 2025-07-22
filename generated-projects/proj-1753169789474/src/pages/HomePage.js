import React from 'react';

const HomePage = () => (
  <div className="container mx-auto p-8">
    <section className="bg-gray-100 p-8 rounded-lg shadow-md mb-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Jane Doe</h1>
      <h2 className="text-2xl text-gray-600">UI/UX Designer</h2>
    </section>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Project Thumbnails (Replace with actual projects) */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white p-4 rounded-lg shadow-md">
          <img src={`https://placehold.co/600x400?text=Project ${i}`} alt={`Project ${i}`} className="rounded-lg mb-2" />
          <h3 className="text-lg font-medium text-gray-800">Project {i}</h3>
        </div>
      ))}
    </div>
  </div>
); 

export default HomePage;