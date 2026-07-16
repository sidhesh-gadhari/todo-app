import React, { useState } from 'react';
import { FiMail, FiLock } from 'react-icons/fi';
import { BiShow, BiHide } from 'react-icons/bi';
import './Auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const nav = useNavigate();
    const { Login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Login");
        if (email.trim() === "" || pass.trim() === "") {
            toast.dismiss();
            return toast.error("Both Fields Are Required!");
        }
        const data = { email: email.trim(), password: pass.trim() };
        setLoading(true);
        Login(data)
            .then(() => {
                toast.dismiss();
                toast.success("Logged In Successfully! ✅");
                setEmail("");
                setPass("");
                nav('/dashboard');
            })
            .catch(() => { })
            .finally(() => { setLoading(false) });
    }

    return (
        <div className="auth-container">
            <div className="glass-card">
                <h2>Welcome Back</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-wrapper">
                        <FiMail className="input-icon" />
                        <input
                            value={email}
                            type="email"
                            placeholder="Email Address"
                            name="email"
                            required
                            onChange={(e) => { setEmail(e.target.value) }}
                        />
                    </div>

                    <div className="input-wrapper">
                        <FiLock className="input-icon" />
                        <input
                            value={pass}
                            type={showPass ? "text" : "password"}
                            placeholder="Password"
                            name="password"
                            required
                            onChange={(e) => { setPass(e.target.value) }}
                            style={{ paddingRight: '3rem' }}
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPass(!showPass)}
                            aria-label={showPass ? "Hide password" : "Show password"}
                        >
                            {showPass ? <BiShow /> : <BiHide />}
                        </button>
                    </div>

                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="oauth-separator">
                        <span>OR</span>
                    </div>

                    <a href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1'}/todo/auth/google`} className="google-btn-dark">
                        <div className="google-icon-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.5 24.5c0-1.57-.15-3.09-.43-4.5H24v9h12.75c-.55 2.87-2.17 5.31-4.61 6.94l7.16 5.56C43.48 37.54 46.5 31.67 46.5 24.5z" />
                                <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.16-5.56c-2 .13-4.51 1.12-8.73 1.12-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                        </div>
                        <span>Sign in with Google</span>
                    </a>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
                </p>
            </div>

            <footer className="auth-footer-links">
                <Link to="/privacy">Privacy Policy</Link>
                <span>•</span>
                <Link to="/terms">Terms of Service</Link>
                <span>•</span>
                <a href="mailto:todo1.app@gmail.com">Contact</a>
            </footer>
        </div>
    );
};

export default Login;