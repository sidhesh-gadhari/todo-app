import React from 'react';
import './LandingPage.css';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="lp-wrapper">
            {/* NAVIGATION BAR */}
            <nav className="lp-navbar">
                <div className="lp-container lp-nav-container">
                    <div className="lp-logo">
                        <span className="lp-logo-icon" />
                        ToDo-App
                    </div>
                    <div className="lp-nav-actions">
                        <a href="#login" className="lp-btn lp-btn-secondary">Login</a>
                        <a href="#signup" className="lp-btn lp-btn-primary">Get Started</a>
                    </div>
                </div>
            </nav>

            {/* SECTION 1: HERO (Updated Single-Column Centered Layout) */}
            <header className="lp-section lp-hero-section">
                <div className="lp-container">
                    <div className="lp-hero-content">
                        <div className="lp-badge">
                            <span className="lp-badge-dot" /> Premium Task Management
                        </div>
                        <h1>ToDo-App</h1>
                        <p>
                            Organize your daily tasks, manage productivity, and optionally sync
                            reminders with Google Calendar.
                        </p>
                        <div className="lp-hero-cta-group">
                            <Link to="/register" className="lp-btn lp-btn-primary">Get Started</Link>
                            <Link to="/login" className="lp-btn lp-btn-secondary">Login</Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* SECTION 2: FEATURES */}
            <section className="lp-section lp-features-section">
                <div className="lp-container">
                    <div className="lp-section-header">
                        <h2>Features Overview</h2>
                        <p>Everything you need to capture, structure, and optimize your daily workflows effortlessly.</p>
                    </div>
                    <div className="lp-features-grid">
                        <FeatureCard
                            icon={<path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />}
                            title="Create Tasks"
                            description="Capture adjustments instantly with custom priority markers, assign clear execution fields, and outline actionable goals."
                        />
                        <FeatureCard
                            icon={<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
                            title="Edit Tasks"
                            description="Dynamically shift descriptions, tags, and workflow state settings with smooth contextual frontend panels."
                        />
                        <FeatureCard
                            icon={<path d="M4 6h16M4 12h16M4 18h7" strokeWidth="2" strokeLinecap="round" />}
                            title="Organize Tasks"
                            description="Group milestones by project scope, contextual tag groupings, or dynamic due-date sorting layers effortlessly."
                        />
                        <FeatureCard
                            icon={<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" />}
                            title="Task Reminders"
                            description="Configure proactive schedule alerts so critical production goals remain visible and metrics stay optimized."
                        />
                        <FeatureCard
                            icon={<path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round" />}
                            title="Google Calendar Integration"
                            description="Synchronize workflow task entries into your calendar interface natively with automated scheduling pipelines."
                        />
                        <FeatureCard
                            icon={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" />}
                            title="Secure Authentication"
                            description="Protect project structures securely through verified hardware channels or verified secure Google OAuth infrastructure."
                        />
                    </div>
                </div>
            </section>

            {/* SECTION 3: HOW IT WORKS */}
            <section className="lp-section lp-workflow-section">
                <div className="lp-container">
                    <div className="lp-section-header">
                        <h2>How It Works</h2>
                        <p>Get up and running with a frictionless environment designed for immediate output acceleration.</p>
                    </div>
                    <div className="lp-steps-grid">
                        <div className="lp-glass-panel lp-step-card">
                            <div className="lp-step-number">1</div>
                            <h3>Create an Account</h3>
                            <p>Authenticate securely using classic login fields or clear one-tap Google OAuth infrastructure.</p>
                        </div>
                        <div className="lp-step-arrow">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <div className="lp-glass-panel lp-step-card">
                            <div className="lp-step-number">2</div>
                            <h3>Manage Tasks</h3>
                            <p>Quickly build out daily items, customize categories, and manipulate modern tracking boards.</p>
                        </div>
                        <div className="lp-step-arrow">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <div className="lp-glass-panel lp-step-card">
                            <div className="lp-step-number">3</div>
                            <h3>Receive Smart Reminders</h3>
                            <p>Automate key scheduling targets using precise timekeeping systems deployed straight to your feed.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: GOOGLE CALENDAR TRANSPARENCY REQUIREMENT */}
            <section className="lp-section lp-calendar-policy-section">
                <div className="lp-container">
                    <div className="lp-glass-panel lp-calendar-panel">
                        <div className="lp-calendar-info">
                            <div className="lp-badge"><span className="lp-badge-dot" style={{ backgroundColor: 'var(--lp-accent-success)', boxShadow: '0 0 8px var(--lp-accent-success)' }} /> OAuth Transparent</div>
                            <h3>Google Calendar Integration</h3>
                            <p>
                                To provide dependable automation options, ToDo-App interfaces directly with the official Google Calendar framework.
                                Our compliance controls are built around the following criteria:
                            </p>
                            <div className="lp-policy-list">
                                <PolicyItem
                                    title="Completely Optional Access"
                                    description="Google Calendar synchronization permissions are non-mandatory. The core task app operates flawlessly without accessing third-party sync states."
                                />
                                <PolicyItem
                                    title="Isolated Scope Operations"
                                    description="Calendar writing scopes are isolated exclusively to tasks you mark for synchronization. The application never alters or tracks third-party data entries."
                                />
                                <PolicyItem
                                    title="No Data Commercialization Protocols"
                                    description="ToDo-App enforces privacy architecture. Your schedules, task details, and credentials are never rented, sold, or shared with analytics companies."
                                />
                            </div>
                        </div>
                        <div className="lp-calendar-visual">
                            <div className="lp-calendar-box">
                                <div className="lp-cal-header">Google Calendar Event</div>
                                <div className="lp-cal-event-card">
                                    <div>✦ Review Architecture Docs</div>
                                    <div className="lp-cal-event-time">1:00 pm - 2:00 pm IST</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: SECURITY */}
            <section className="lp-section lp-security-section">
                <div className="lp-container">
                    <div className="lp-section-header">
                        <h2>Security Ecosystem</h2>
                        <p>Secured with advanced protective architectures designed to keep personal information completely isolated.</p>
                    </div>
                    <div className="lp-security-grid">
                        <SecurityCard text="Secure Authentication" icon={<path d="M12 11c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm9.057-2.67c.394 2.508-.093 5.163-1.467 7.422C17.72 18.847 14.99 20 12 20s-5.72-1.153-7.59-3.248c-1.374-2.26-1.86-4.914-1.467-7.422C3.497 5.82 6.505 3.5 10 3.064V5h4V3.064c3.495.437 6.503 2.757 7.057 6.266z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />} />
                        <SecurityCard text="Google OAuth" icon={<path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8 3h4M12 9v6" strokeWidth="2" strokeLinecap="round" />} />
                        <SecurityCard text="Email Verification" icon={<path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />} />
                        <SecurityCard text="Encrypted Data" icon={<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />} />
                        <SecurityCard text="Privacy Focused" icon={<path d="M9 12l2 2 4-4m5 .5c0 5.747-4.477 10.417-10 10.932C4.477 22.917 0 18.247 0 12.5v-7l10-4 10 4v7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />} />
                    </div>
                </div>
            </section>

            {/* SECTION 6: CALL TO ACTION */}
            <section className="lp-section lp-cta-section">
                <div className="lp-container">
                    <div className="lp-glass-panel lp-cta-panel">
                        <h2>Ready to organize your work?</h2>
                        <p>Deploy a clean, distraction-free environment optimized specifically for tracking priorities instantly.</p>
                        <div className="lp-cta-btn-group">
                            <Link to="/register" className="lp-btn lp-btn-primary">Get Started</Link>
                            <Link to="/login" className="lp-btn lp-btn-secondary">Login</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="lp-footer">
                <div className="lp-container lp-footer-grid">
                    <div className="lp-footer-info">
                        <div className="lp-logo" style={{ marginBottom: '8px' }}>
                            <span className="lp-logo-icon" />
                            ToDo-App
                        </div>
                        <p>© 2026 ToDo-App. All rights reserved.</p>
                    </div>
                    <div className="lp-footer-links-wrapper">
                        <div className="lp-footer-col">
                            <h4>Legal</h4>
                            <ul>
                                <li><Link to="/privacy">Privacy Policy</Link></li>
                                <li><Link to="/terms">Terms of Service</Link></li>
                            </ul>
                        </div>
                        <div className="lp-footer-col">
                            <h4>Product</h4>
                            <ul>
                                <li><a href="mailto:sidheshgadhari45@gmail.com" target="_blank">Contact</a></li>
                                <li><a href="https://github.com/Sidhesh7788/Todo-App" target="_blank">GitHub Repository</a></li>
                            </ul>
                        </div>
                        <div className="lp-footer-col">
                            <h4>Developer</h4>
                            <ul>
                                <li><a href="https://github.com/Sidhesh7788" target="_blank">Developer</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

/* ==========================================================================
   INTERNAL ISOLATED SUB-COMPONENTS
   ========================================================================== */
function FeatureCard({ icon, title, description }) {
    return (
        <div className="lp-glass-panel lp-feature-card">
            <div className="lp-feature-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    {icon}
                </svg>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

function PolicyItem({ title, description }) {
    return (
        <div className="lp-policy-item">
            <div className="lp-policy-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <div className="lp-policy-text">
                <h4>{title}</h4>
                <p>{description}</p>
            </div>
        </div>
    );
}

function SecurityCard({ text, icon }) {
    return (
        <div className="lp-glass-panel lp-security-card">
            <div className="lp-security-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                </svg>
            </div>
            <span>{text}</span>
        </div>
    );
}