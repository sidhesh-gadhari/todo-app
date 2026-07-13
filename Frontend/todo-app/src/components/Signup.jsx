import React, { useEffect, useState } from 'react';
import { FiMail, FiLock } from 'react-icons/fi';
import { BiShow, BiHide } from 'react-icons/bi';
import './Auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const Signup = () => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [cnfrm, setCnfrm] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showCnfrm, setShowCnfrm] = useState(false);
    const [agreement, setAgreement] = useState(false);

    const [validations, setValidations] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasUniqueChar: false // 🌟 Core State Key Name
    });

    const nav = useNavigate();
    const { Signup } = useAuth();

    useEffect(() => {
        setValidations({
            minLength: pass.length >= 6 && pass.length <= 15,
            hasUpperCase: /[A-Z]/.test(pass),
            hasLowerCase: /[a-z]/.test(pass),
            hasNumber: /\d/.test(pass),
            hasUniqueChar: /[@$!%*?&#_]/.test(pass) // 🌟 RegEx with # included
        });
    }, [pass]);

    const isPasswordValid = Object.values(validations).every(Boolean);

    const getConfirmBorderClass = () => {
        if (!cnfrm) return "input-wrapper";

        const isMatchingSoFar = pass.slice(0, cnfrm.length) === cnfrm;
        if (!isMatchingSoFar) return "input-wrapper border-red";
        if (pass === cnfrm) return "input-wrapper border-green";
        return "input-wrapper border-typing";
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim() === "" || pass.trim() === "" || cnfrm.trim() === "") {
            toast.dismiss();
            return toast.error("All Fields Are Required!");
        }
        if (!isPasswordValid) {
            toast.dismiss();
            return toast.error("Please satisfy all password complexity criteria!");
        }
        else if (pass.trim() !== cnfrm.trim()) {
            toast.dismiss();
            return toast.error("Password Mismatch!");
        }

        const data = { email: email.trim(), password: pass.trim() };
        setLoading(true);
        Signup(data)
            .then(() => {
                toast.dismiss();
                toast.success("Signup Successful! Please check your email to verify your account. 📧", { duration: 6000 });
                setEmail("");
                setPass("");
                setCnfrm("");
                nav('/login');
            })
            .catch(() => { })
            .finally(() => { setLoading(false) });
    }

    return (
        <div className="auth-container">
            <div className="glass-card">
                <h2>Create Account</h2>
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

                    <div className={getConfirmBorderClass()}>
                        <FiLock className="input-icon" />
                        <input
                            value={cnfrm}
                            type={showCnfrm ? "text" : "password"}
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            required
                            onChange={(e) => { setCnfrm(e.target.value) }}
                            style={{ paddingRight: '3rem' }}
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowCnfrm(!showCnfrm)}
                            aria-label={showCnfrm ? "Hide confirm password" : "Show confirm password"}
                        >
                            {showCnfrm ? <BiShow /> : <BiHide />}
                        </button>
                    </div>

                    {pass && (
                        <div className="password-checklist-box">
                            <p className={validations.minLength ? "text-green" : "text-red"}>
                                {validations.minLength ? "✓" : "✕"} Between 6 and 15 characters
                            </p>
                            <p className={validations.hasUpperCase ? "text-green" : "text-red"}>
                                {validations.hasUpperCase ? "✓" : "✕"} At least one uppercase letter (A-Z)
                            </p>
                            <p className={validations.hasLowerCase ? "text-green" : "text-red"}>
                                {validations.hasLowerCase ? "✓" : "✕"} At least one lowercase letter (a-z)
                            </p>
                            <p className={validations.hasNumber ? "text-green" : "text-red"}>
                                {validations.hasNumber ? "✓" : "✕"} At least one number (0-9)
                            </p>
                            {/* ✅ FIXED: changed from hasSpecialChar to validations.hasUniqueChar */}
                            <p className={validations.hasUniqueChar ? "text-green" : "text-red"}>
                                {validations.hasUniqueChar ? "✓" : "✕"} At least one special symbol (@, $, !, %, *, ?, &, #)
                            </p>
                        </div>
                    )}

                    <input checked={agreement} type="checkbox" name="terms" id="terms" onChange={(e) => setAgreement(e.target.checked)} />
                    <label htmlFor="terms">I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></label>

                    <button disabled={!agreement || loading} type="submit" className="auth-btn">
                        {loading ? 'Sending...' : 'Sign Up'}
                    </button>
                    <div className="oauth-separator">
                        <span>OR</span>
                    </div>

                    <a href={agreement ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1'}/todo/auth/google` : '#'} className={`google-btn-dark ${!agreement ? "disabled-google-btn" : ""}`} onClick={(e) => {
                        if (!agreement) {
                            e.preventDefault();
                            toast.error("Please accept the Terms & Privacy Policy first.");
                        }
                    }}>
                        <div className="google-icon-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.5 24.5c0-1.57-.15-3.09-.43-4.5H24v9h12.75c-.55 2.87-2.17 5.31-4.61 6.94l7.16 5.56C43.48 37.54 46.5 31.67 46.5 24.5z" />
                                <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.16-5.56c-2 .13-4.51 1.12-8.73 1.12-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                        </div>
                        <span className="google-btn-text">Continue with Google</span>
                    </a>
                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link" style={{ cursor: 'pointer' }}>Login</Link>
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

export default Signup;