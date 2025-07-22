import React from 'react';

function Home() {
  return (
    <div className="p-8">
      <section className="bg-blue-700 text-white py-20">
        <h1 className="text-5xl font-bold text-center mb-4">Future Forward</h1>
        <p className="text-3xl text-center">October 26-27, 2024</p>
      </section>
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-4">About the Event</h2>
        <p>Future Forward is a cutting-edge technology conference bringing together industry leaders, visionaries, and experts to explore the future of innovation.</p>
        <ul>
          <li>Networking opportunities with industry leaders</li>
          <li>In-depth sessions on emerging technologies</li>
          <li>Inspiring keynotes and presentations</li>
        </ul>
      </section>
      <section className="py-8">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Register Now
        </button>
      </section>
    </div>
  );
}

export default Home;