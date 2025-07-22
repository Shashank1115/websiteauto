import React from 'react';

const speakers = [
  {
    name: "Dr. Anya Petrova",
    title: "AI Research Scientist",
    bio: "Dr. Petrova is a leading expert in artificial intelligence, with a focus on machine learning and deep learning.  She has published extensively in top academic journals.",
    image: "https://placehold.co/300x200?text=Speaker"
  },
  {
    name: "Mr. Ben Carter",
    title: "Software Architect",
    bio: "Ben is a highly experienced software architect specializing in cloud-native applications and microservices.  He is a sought-after speaker at various conferences.",
    image: "https://placehold.co/300x200?text=Speaker"
  },
  {
    name: "Ms. Chloe Davis",
    title: "UX Designer",
    bio: "Chloe has a decade of experience designing intuitive and user-friendly interfaces.  She is passionate about creating accessible and inclusive digital experiences.",
    image: "https://placehold.co/300x200?text=Speaker"
  },
  {
    name: "David Lee",
    title: "Cybersecurity Expert",
    bio: "David Lee is a renowned cybersecurity expert focusing on the latest threats and advancements in cyber defense strategies and penetration testing.",
    image: "https://placehold.co/300x200?text=Speaker"
  }
];

function Speakers() {
  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {speakers.map((speaker, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-6">
          <img src={speaker.image} alt={speaker.name} className="rounded-lg mb-4" />
          <h3 className="text-xl font-bold mb-2">{speaker.name}</h3>
          <p className="text-gray-400 mb-2">{speaker.title}</p>
          <p>{speaker.bio}</p>
        </div>
      ))}
    </div>
  );
}

export default Speakers;