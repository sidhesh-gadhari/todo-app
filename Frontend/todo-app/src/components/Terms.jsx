import React from 'react';
const Terms = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#f1f5f9', backgroundColor: '#06050a', fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>
      <h1 style={{ color: '#10b981', marginBottom: '20px' }}>Terms of Service</h1>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>Last updated: July 14, 2026</p>

      <h2 style={{ color: '#e2e8f0', marginTop: '30px', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        By accessing and using Taskly-App, you accept and agree to be bound by the terms and provision of this agreement.
      </p>
      <h2 style={{ color: '#e2e8f0', marginTop: '30px', marginBottom: '15px' }}>2. Description of Service</h2>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        Taskly-App provides users with a task management system. We integrate with Google Calendar to optionally set reminders for your tasks.
      </p>
      <h2 style={{ color: '#e2e8f0', marginTop: '30px', marginBottom: '15px' }}>3. Google Calendar Integration</h2>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        Our application uses Google OAuth to access your Google Calendar. This permission is strictly used to create reminders for tasks you create. We are not responsible for any modifications to your calendar that are not initiated by our application.
      </p>
      <h2 style={{ color: '#e2e8f0', marginTop: '30px', marginBottom: '15px' }}>4. User Conduct</h2>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the service.
      </p>
    </div>
  );
};
export default Terms;