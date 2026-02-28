import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const { login, token } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (token) navigate('/dashboard');
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'var(--bg-main)' 
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '24px', textAlign: 'center', color: 'var(--primary-mint)' }}>Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Email</label>
                        <input 
                            type="email" 
                            className="btn" 
                            style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', textAlign: 'left', cursor: 'text' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Password</label>
                        <input 
                            type="password" 
                            className="btn" 
                            style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', textAlign: 'left', cursor: 'text' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p style={{ color: 'red', fontSize: '12px', marginBottom: '16px' }}>{error}</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign In</button>
                    
                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
                        New to DeliveryProof? <Link to="/register" style={{ color: 'var(--primary-mint)', fontWeight: 600, textDecoration: 'none' }}>Create Account</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
