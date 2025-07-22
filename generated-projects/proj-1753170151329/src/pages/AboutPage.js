import React from 'react';

const AboutPage = () => {
  return (
    <div className="container mx-auto p-8">
      <section className="bg-gray-100 p-8 rounded-lg shadow-md">
        <img src="https://placehold.co/300x300" alt="Jane Doe" className="rounded-full w-48 h-48 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">About Me</h2>
        <p className="text-gray-600 text-center">I am a passionate UI/UX designer with 5+ years of experience creating beautiful and user-friendly interfaces.  I'm dedicated to solving design problems creatively and collaboratively.</p>
        <ul className="list-disc list-inside mt-4 text-gray-600 text-center">
          <li>React</li>
          <li>Tailwind CSS</li>
          <li>Figma</li>
          <li>Adobe XD</li>
        </ul>
      </section>
    </div>
  );
};

export default AboutPage;