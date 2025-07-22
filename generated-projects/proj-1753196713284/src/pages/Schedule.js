import React from 'react';

const schedule = [
  { time: "9:00 AM", title: "Opening Keynote", speaker: "Dr. Anya Petrova" },
  { time: "10:00 AM", title: "AI and the Future of Work", speaker: "Mr. Ben Carter" },
  { time: "11:00 AM", title: "Designing for Inclusivity", speaker: "Ms. Chloe Davis" },
  { time: "1:00 PM", title: "Lunch Break" },
  { time: "2:00 PM", title: "Cybersecurity in the Cloud", speaker: "David Lee" },
  { time: "3:00 PM", title: "Panel Discussion: The Metaverse", speaker: "All Speakers" },
];

function Schedule() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Daily Schedule</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {schedule.map((item, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg">
            <p className="text-lg font-medium mb-1">{item.time}</p>
            <p className="text-xl font-bold mb-1">{item.title}</p>
            {item.speaker && <p className="text-gray-400">{item.speaker}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Schedule;