import React from 'react';

const AboutPage = () => (
  <div className="container mx-auto p-8">
    <div className="flex flex-col md:flex-row items-center">
      <img src="https://placehold.co/200x200?text=Jane+Doe" alt="Jane Doe" className="rounded-full shadow-lg mb-4 md:mb-0 md:mr-8 w-48 h-48" />
      <div>
        <h1 className="text-3xl font-bold mb-4">About Me</h1>
        <p className="text-gray-600">I am Jane Doe, a passionate and experienced UI/UX designer with a focus on creating intuitive and beautiful digital experiences.</p>
        <ul className="list-disc list-inside mt-4 text-gray-600">
          <li>Skill 1</li>
          <li>Skill 2</li>
          <li>Skill 3</li>
        </ul>
      </div>
    </div>
  </div>
); 

export default AboutPage;