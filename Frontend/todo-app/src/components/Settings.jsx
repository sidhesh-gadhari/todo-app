import React, { useState } from 'react';
import { IoArrowBack, IoColorPaletteOutline, IoInformationCircleOutline, IoLogOutOutline, IoCalendarOutline } from 'react-icons/io5';
import { FaUserCircle } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { AiOutlineUserDelete } from "react-icons/ai";
import './Settings.css';
import { useAuth } from './AuthContext';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const { user, Logout, theme, toggleTheme, api, deleteUser } = useAuth();
    const [linking, setLinking] = useState(false);

    useEffect(() => {
        document.body.className = theme === 'light' ? 'light-mode' : '';
    }, [theme]);

    // Google Calendar linking workflow for local accounts
    const handleConnectCalendar = () => {
        setLinking(true);
        toast.loading("Redirecting to Google Secure Login...");
        // Hit the backend passport route directly to open the overlay consent window
        window.location.href = "http://localhost:3000/api/v1/todo/auth/google";
    };

    // Evaluates if the current session has active live sync keys
    const isCalendarSynced = user?.googleCredentials?.access_token || user?.accountType === 'google';

    return (
        <div className={`settings-page-wrapper ${theme === 'light' ? 'light-mode' : ''}`}>
            {/* Header */}
            <div className="settings-header">
                <Link to="/dashboard" className="back-button">
                    <IoArrowBack size={24} />
                </Link>
                <h2>Settings</h2>
            </div>

            {/* Profile Banner */}
            <div className="profile-banner-card">
                <div className="profile-avatar">
                    <FaUserCircle size={50} color="#fff" />
                </div>
                <div className="profile-details">
                    <h3 className="profile-name">{user.name ? user.name : user.email?.split('@')[0]}</h3>
                    <p className="profile-email">{user.email}</p>
                    <span className="profile-status">
                        {user?.accountType === 'google' ? 'Google Auth Account' : 'Standard Local Account'}
                    </span>
                </div>
            </div>

            {/* Appearance Section */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-icon-box purple-bg">
                        <IoColorPaletteOutline size={20} color="#fff" />
                    </div>
                    <h3>Appearance</h3>
                </div>
                <div className="settings-row">
                    <div className="settings-row-info">
                        <h4>Dark Mode</h4>
                        <p>Switch between light and dark themes</p>
                    </div>
                    <div className="toggle-switch">
                        <input onChange={toggleTheme} type="checkbox" id="dark-mode-toggle" checked={theme === 'dark'} />
                        <label htmlFor="dark-mode-toggle"></label>
                    </div>
                </div>
            </div>

            {/* NEW SECTION: Google Calendar Sync Management Card */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-icon-box blue-bg" style={{ backgroundColor: '#2563eb' }}>
                        <IoCalendarOutline size={20} color="#fff" />
                    </div>
                    <h3>Cloud Integration</h3>
                </div>
                <div className="settings-row">
                    <div className="settings-row-info">
                        <h4>Google Calendar Sync</h4>
                        <p>Automatically push tasks to your calendar for reminders on your device.</p>
                    </div>

                    {/* Dynamic state switches */}
                    <div className="sync-action-container">
                        {isCalendarSynced ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="sync-pulse-dot" style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                                <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>Connected</span>
                            </div>
                        ) : (
                            <button
                                className="google-sync-connect-btn"
                                disabled={linking}
                                onClick={handleConnectCalendar}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 14px',
                                    backgroundColor: '#1e1b2e',
                                    border: '1px solid #383351',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '500'
                                }}
                            >
                                <FcGoogle size={18} />
                                {linking ? "Connecting..." : "Link Sync"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-icon-box orange-bg">
                        <IoInformationCircleOutline size={20} color="#fff" />
                    </div>
                    <h3>About</h3>
                </div>
                <div className="settings-row split">
                    <span>Version</span>
                    <span className="settings-value">1.0.0</span>
                </div>
                <div className="settings-row split">
                    <span>Built with</span>
                    <span className="settings-value">MERN STACK</span>
                </div>
                <div className="settings-row split border-none">
                    <span>Last updated</span>
                    <span className="settings-value">Jun 2026</span>
                </div>
            </div>

            <button onClick={Logout} className="sign-out-btn">
                <IoLogOutOutline size={20} /> Log Out
            </button>
            <div className="danger-zone">
                <div className="danger-zone">
                    <h3>Deleting Your Account and All Tasks</h3>
                    <p>This Action Is Irreversible. Your All Tasks Will Be Deleted Too.</p>
                </div>
                <button onClick={deleteUser} className="user-delete-btn">
                    <AiOutlineUserDelete size={20} /> Delete Your Account
                </button>
            </div>
            <div className="footer">
                &copy; SIDHESH GADHARI || Contact On Email For Feedbacks and Improvements:- sidheshgadhari45@gmail.com
            </div>
        </div>
    );
};

export default Settings;