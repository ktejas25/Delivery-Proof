import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        business_name: '',
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'var(--bg-main)',
            padding: '40px 20px'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        background: 'var(--bg-highlight)', 
                        borderRadius: '16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <ShieldCheck size={32} color="var(--primary-mint)" />
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-mint)' }}>Get Started</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Secure your deliveries with enterprise-grade proof.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>BUSINESS NAME</label>
                        <input 
                            name="business_name"
                            type="text" 
                            className="btn" 
                            placeholder="e.g. Acme Deliveries"
                            style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', textAlign: 'left', cursor: 'text' }}
                            value={formData.business_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>FIRST NAME</label>
                            <input 
                                name="first_name"
                                type="text" 
                                className="btn" 
                                placeholder="John"
                                style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', textAlign: 'left', cursor: 'text' }}
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>LAST NAME</label>
                            <input 
                                name="last_name"
                                type="text" 
                                className="btn" 
                                placeholder="Doe"
                                style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', textAlign: 'left', cursor: 'text' }}
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>EMAIL ADDRESS</label>
                        <input 
                            name="email"
                            type="email" 
                            className="btn" 
                            placeholder="admin@business.com"
                            style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', textAlign: 'left', cursor: 'text' }}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>SECURE PASSWORD</label>
                        <input 
                            name="password"
                            type="password" 
                            className="btn" 
                            placeholder="••••••••"
                            style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', textAlign: 'left', cursor: 'text' }}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{ 
                            padding: '12px', 
                            background: '#FFF1F0', 
                            border: '1px solid #FFA39E', 
                            borderRadius: '8px', 
                            color: '#CF1322', 
                            fontSize: '14px', 
                            marginBottom: '24px' 
                        }}>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : (
                            <>
                                Create Enterprise Account <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                    
                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary-mint)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
