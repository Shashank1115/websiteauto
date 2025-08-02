import React from 'react';

function Contact() {
  return (
    <div className="p-4">
      <div className="p-8 rounded-lg shadow-lg bg-tuscan-cream">
        <h2 className="text-2xl font-bold text-tuscan-red mb-4">Contact Us</h2>
        <p className="text-gray-800 mb-4">123 Main Street, Florence, Italy</p>
        <div className="mb-4">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2968.992107426694!2d11.25587841543727!3d43.76956567911973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1327405410218f0d%3A0x945670160425b377!2sFlorence%2C+Italy!5e0!3m2!1sen!2sus!4v1686884751030!5m2!1sen!2sus" width="600" height="450" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <form className="text-gray-800">
          <input type="text" placeholder="Your Name" className="w-full mb-4 p-2 border border-gray-300 rounded" />
          <input type="email" placeholder="Your Email" className="w-full mb-4 p-2 border border-gray-300 rounded" />
          <textarea placeholder="Your Message" className="w-full mb-4 p-2 border border-gray-300 rounded" rows="4"></textarea>
          <button className="bg-tuscan-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Contact;