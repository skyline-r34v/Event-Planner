import React from 'react';
import '../styles/About.css'; // Make sure to create this CSS file
import AboutImg from '../image/About1.jpg'; // Replace with your actual image path

function About() {
  return (
    <div className="about-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h1>Why EventPlanner?</h1>
          <p>
            At EventPlanner, we blend technology with creativity to make your event stress-free and unforgettable.
            Our platform stands out with a user-friendly interface, real-time planning tools, AI-driven suggestions,
            and a network of verified vendors that you can trust.
          </p>
        </div>
        <div className="hero-image">
          <img src={AboutImg} alt="Event planning concept" />
        </div>
      </section>

      {/* Assistance Section */}
      <section className="assist-section">
        <h2>How Can We Assist You?</h2>
        <ul>
          <li>🎯 Help you define event goals and themes</li>
          <li>📅 Create detailed checklists & timelines</li>
          <li>💡 Provide AI-based suggestions & reminders</li>
          <li>🤝 Connect you with the best local vendors</li>
          <li>📊 Assist with budget planning & tracking</li>
          <li>📍 Venue discovery and guest coordination</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <p>&copy; 2025 EventPlanner. Built with passion for every celebration.</p>
      </footer>

    </div>
  );
}

export default About;
