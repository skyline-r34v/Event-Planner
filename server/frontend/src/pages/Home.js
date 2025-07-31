import React from 'react';
import Slider from 'react-slick';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

import '../styles/Home.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import Event1 from '../image/Event1.jpg';
import Event2 from '../image/Event2.jpg';

function Home() {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: false,
    arrows: false,
  };

  const { ref: statsRef, inView: statsVisible } = useInView({ triggerOnce: true });

  return (
    <div className="home">
      {/* Hero Slider Section */}
      <div className="hero-slider">
        <Slider {...sliderSettings}>
          <div className="slide">
            <img src={Event1} alt="Event 1" />
          </div>
          <div className="slide">
            <img src={Event2} alt="Event 2" />
          </div>
        </Slider>

        {/* Overlay text */}
        <div className="slider-overlay-text">
          <h1>Welcome User</h1>
          <p>Ready to Plan an Event?</p>
          <div className="hero-buttons">
            <button className="hero-btn" onClick={() => alert('AI chat launching soon...')}>🤖 Chat with Bot</button>
            <button className="hero-btn" onClick={() => window.location.href = "/form"}>📝 Fill Form</button>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <section className="intro">
        <h1>Welcome to EventPlanner</h1>
        <p>Your one-stop solution to organize unforgettable events.</p>
      </section>

      {/* Agentic AI Section */}
      <section className="ai-help">
        <h2>How Our AI Assistant Helps You Plan Better</h2>
        <p>
          Our Agentic AI Chat Assistant simplifies event planning by:
        </p>
        <ul>
          <li>📋 Creating schedules & checklists</li>
          <li>💬 Answering FAQs about pricing, venues & vendors</li>
          <li>🧠 Recommending ideas based on your preferences</li>
          <li>📍 Helping with budget tracking and reminders</li>
        </ul>
      </section>

      {/* Services Section */}
      <section className="services">
        <h2>Our Services</h2>
        <div className="cards">
          {['Birthday', 'Anniversary', 'Wedding', 'Corporate Events', 'Gaming Events', 'Bhandara'].map(
            (event, index) => (
              <div key={index} className="card">
                <img src={`/images/service${index + 1}.jpg`} alt={event} />
                <h3>{event}</h3>
              </div>
            )
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery">
        <h2>Event Gallery</h2>
        <div className="gallery-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <img key={n} src={`/images/gallery${n}.jpg`} alt={`Gallery ${n}`} />
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section className="stats" ref={statsRef}>
        <h2>Our Achievements</h2>
        <ul>
          <li>
            🎉{' '}
            {statsVisible && (
              <CountUp start={0} end={500} duration={2} delay={0.3} />
            )}
            + Events Completed
          </li>
          <li>
            👥{' '}
            {statsVisible && (
              <CountUp start={0} end={200} duration={2} delay={0.3} />
            )}
            + Happy Clients
          </li>
          <li>
            🌍{' '}
            {statsVisible && (
              <CountUp start={0} end={10} duration={2} delay={0.3} />
            )}
            + Cities Covered
          </li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="faq">
        <h2>FAQs</h2>
        <details>
          <summary>What types of events do you organize?</summary>
          <p>We handle weddings, birthdays, corporate events, and more!</p>
        </details>
        <details>
          <summary>How early should I book?</summary>
          <p>We recommend booking at least 4 weeks in advance.</p>
        </details>
        <details>
          <summary>Do you provide catering services?</summary>
          <p>Yes, we have a variety of catering options for all budgets.</p>
        </details>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 EventPlanner. All Rights Reserved.</p>
      </footer>

      {/* Chat Button */}
      <button className="chat-ai-button" onClick={() => alert("Chat assistant launching soon!")}>
        🤖 Chat with AI
      </button>
    </div>
  );
}

export default Home;
