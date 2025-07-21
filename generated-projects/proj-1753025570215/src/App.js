import React from 'react';
import './App.css';

function App() {
  const studentData = {
    program: "B TECH IN COMPUTER AND COMMUNICATION ENGINEERING",
    registrationNo: 229303430,
    name: "SHASHANK PANDEY",
    semester: "III",
    gpa: 9.00,
    creditEarned: 25,
    totalCredit: 25,
  };

  const courseData = [
    { sno: 1, courseCode: "CC2101", courseName: "DIGITAL DESIGN AND COMPUTER ARCHITECTURE", academicSession: "JUL-NOV 2023", credits: 4, grade: "A+" },
    { sno: 2, courseCode: "CC2102", courseName: "DATA COMMUNICATIONS", academicSession: "JUL-NOV 2023", credits: 4, grade: "A+" },
    { sno: 3, courseCode: "CC2103", courseName: "DATA STRUCTURES AND ALGORITHMS", academicSession: "JUL-NOV 2023", credits: 4, grade: "A" },
    { sno: 4, courseCode: "CC2104", courseName: "OBJECT ORIENTED PROGRAMMING", academicSession: "JUL-NOV 2023", credits: 4, grade: "C" },
    { sno: 5, courseCode: "CC2130", courseName: "DATA COMMUNICATIONS Lab", academicSession: "JUL-NOV 2023", credits: 1, grade: "A+" },
  ];

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <img src="https://placehold.co/60x60" alt="University Logo" />
          <h3>Manipal University</h3>
        </div>
        <ul>
          <li className="active">Home</li>
          <li>Academics</li>
          <li>Examination</li>
        </ul>
      </div>
      <div className="main-content">
        <div className="header">
          <input type="search" placeholder="Search..." />
        </div>
        <div className="student-details">
          <div>Program/Branch: {studentData.program}</div>
          <div>Registration No.: {studentData.registrationNo}</div>
          <div>Name: {studentData.name}</div>
          <div>Semester/Year: {studentData.semester}</div>
          <div>GPA: {studentData.gpa}</div>
          <div>Credit Earned: {studentData.creditEarned}</div>
          <div>Total Credit: {studentData.totalCredit}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Academic Session</th>
              <th>Credits</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {courseData.map((course) => (
              <tr key={course.sno}>
                <td>{course.sno}</td>
                <td>{course.courseCode}</td>
                <td>{course.courseName}</td>
                <td>{course.academicSession}</td>
                <td>{course.credits}</td>
                <td>{course.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
