import React from 'react';

const Privacy = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#f1f5f9', backgroundColor: '#06050a', fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>
      <h1 style={{ color: '#10b981', marginBottom: '20px' }}>Privacy Policy</h1>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>Last updated: July 14, 2026</p>

      <h2 style={{ color: '#e2e8f0', marginTop: '30px', marginBottom: '15px' }}>1. Information We Collect</h2>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        When you use ToDo-App, we collect basic profile information (like your name and email address) when you sign in using Google OAuth.
        We also request access to your Google Calendar to create task reminders.
      </p>

      <h2 style={{ color: '#e2e8f0', marginTop: '30px', marginBottom: '15px' }}>2. How We Use Your Information</h2>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        Your Google Calendar data is strictly used to schedule reminders for the tasks you create within the app. We do not sell or share this data with third parties.
      </p>

      <h2 style={{ color: '#e2e8f0', marginTop: '30px', marginBottom: '15px' }}>3. Data Storage</h2>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        We store your task data securely in our database. We do not store your Google Calendar events other than those specifically created by ToDo-App as reminders.
      </p>

      <h2 style={{ color: '#e2e8f0', marginTop: '30px', marginBottom: '15px' }}>4. Contact Us</h2>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        If you have any questions about this Privacy Policy, please contact us on todo1.app@gmail.com.
      </p>
    </div>
  );
};

export default Privacy;
