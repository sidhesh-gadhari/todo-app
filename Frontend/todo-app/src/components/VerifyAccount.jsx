import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

const VerifyAccount = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('Verifying your account...');

    const hasFetched = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. No token found.');
            return;
        }

        if (hasFetched.current) return;
        hasFetched.current = true;

        const verifyToken = async () => {
            try {
                // Hit the new backend route we created!
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1'}/todo/verify-account?token=${token}`);
                setStatus('success');
                setMessage(res.data.message || 'Account verified successfully!');
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link might be expired or invalid.');
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="auth-container">
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>

                {status === 'loading' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <FiLoader className="loading-spinner" style={{ fontSize: '4rem', color: '#007bff', animation: 'spin 2s linear infinite' }} />
                        <style>
                            {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
                        </style>
                        <h2>Verifying...</h2>
                        <p style={{ color: 'var(--text-color)', opacity: 0.8 }}>{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <FiCheckCircle style={{ fontSize: '4rem', color: '#28a745' }} />
                        <h2 style={{ color: '#28a745' }}>Verified!</h2>
                        <p style={{ color: 'var(--text-color)', opacity: 0.8 }}>{message}</p>
                        <Link to="/login" className="auth-btn" style={{ marginTop: '1rem', textDecoration: 'none', display: 'inline-block' }}>
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <FiXCircle style={{ fontSize: '4rem', color: '#dc3545' }} />
                        <h2 style={{ color: '#dc3545' }}>Verification Failed</h2>
                        <p style={{ color: 'var(--text-color)', opacity: 0.8 }}>{message}</p>
                        <Link to="/login" className="auth-btn" style={{ marginTop: '1rem', textDecoration: 'none', display: 'inline-block', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                            Back to Login
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
};

export default VerifyAccount;