// ThreeStepForm.jsx
import React, { useState } from 'react';
import '../styles/Form.css';

function ThreeStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
    eventType: '',
    eventDate: '',
    eventName: '',
    eventDescription: '',
    budget: '',
    attendees: '',
    location: '',
    foodType: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    alert('Form Submitted Successfully!');
  };

  return (
    <div className="step-form-wrapper">
      <div className="step-form-container">
        <h2>Event Planning Form - Step {step}</h2>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step">
              <label htmlFor="name">Name:</label>
              <input name="name" value={formData.name} onChange={handleChange} required />

              <label htmlFor="number">Phone Number:</label>
              <input name="number" value={formData.number} onChange={handleChange} required />

              <label htmlFor="email">Email:</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <label htmlFor="eventType">Event Type:</label>
              <input name="eventType" value={formData.eventType} onChange={handleChange} required />

              <label htmlFor="eventDate">Event Date:</label>
              <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required />

              <label htmlFor="eventName">Event Name:</label>
              <input name="eventName" value={formData.eventName} onChange={handleChange} required />

              <label htmlFor="eventDescription">Event Description:</label>
              <textarea name="eventDescription" value={formData.eventDescription} onChange={handleChange} required />
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <label htmlFor="budget">Budget (in ₹):</label>
              <input name="budget" value={formData.budget} onChange={handleChange} required />

              <label htmlFor="attendees">Number of People:</label>
              <input name="attendees" value={formData.attendees} onChange={handleChange} required />

              <label htmlFor="location">Preferred Location:</label>
              <input name="location" value={formData.location} onChange={handleChange} required />

              <label htmlFor="foodType">Preferred Food Type:</label>
              <input name="foodType" value={formData.foodType} onChange={handleChange} required />
            </div>
          )}

          <div className="step-navigation">
            {step > 1 && <button type="button" onClick={prevStep}>Back</button>}
            {step < 3 && <button type="button" onClick={nextStep}>Next</button>}
            {step === 3 && <button type="submit">Submit</button>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ThreeStepForm;
