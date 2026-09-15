import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function getStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;
    return score;
}
const strengthLabel = [null, 'Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];
const strengthColor = [null, '#dc2626', '#ea580c', '#d97706', '#2563eb', '#16a34a'];

export default function AuthPage({ onSuccess }) {
    const { login, register, loading } = useAuth();
    const [tab, setTab] = useState('login');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ nombre: '', email: '', password: '', confirm: '' });

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(''); };

    const strength = getStrength(form.password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (tab === 'register') {
            if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return; }
            if (strength < 4) { setError('La contraseña es demasiado débil'); return; }
            const res = await register(form.nombre, form.email, form.password);
            if (res.success) onSuccess(res.user);
            else setError(res.error);
        } else {
            const res = await login(form.email, form.password);
            if (res.success) onSuccess(res.user);
            else setError(res.error);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: 56, height: 56, margin: '0 auto 1rem',
                        borderRadius: 16,
                        background: 'linear-gradient(135deg,#d97706,#ea580c)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <User size={28} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>F.E.S. Construcción</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        {tab === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta gratis'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="auth-tabs" role="tablist">
                    {[['login', 'Ingresar'], ['register', 'Registrarse']].map(([key, label]) => (
                        <button
                            key={key}
                            role="tab"
                            aria-selected={tab === key}
                            className={`auth-tab${tab === key ? ' active' : ''}`}
                            onClick={() => { setTab(key); setError(''); }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Social Buttons (UI only) */}
                <div>
                    {[
                        { name: 'Google', emoji: '🔵', label: 'Continuar con Google' },
                        { name: 'Facebook', emoji: '🔷', label: 'Continuar con Facebook' },
                    ].map(s => (
                        <button key={s.name} className="social-btn" onClick={() => setError('Próximamente: login con ' + s.name)} id={`social-${s.name.toLowerCase()}`}>
                            <span style={{ fontSize: '1.1rem' }}>{s.emoji}</span>
                            {s.label}
                            <span className="badge badge-gray" style={{ marginLeft: 'auto' }}>Próximamente</span>
                        </button>
                    ))}
                </div>

                <div className="social-divider">o continúa con email</div>

                {/* Error */}
                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: '#fee2e2', color: '#b91c1c',
                        borderRadius: 8, padding: '10px 14px',
                        fontSize: '0.875rem', marginBottom: '1rem'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
                    {tab === 'register' && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="auth-nombre">Nombre completo</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    id="auth-nombre" type="text" className="form-input" style={{ paddingLeft: '2.5rem' }}
                                    placeholder="Tu nombre completo" required value={form.nombre}
                                    onChange={e => set('nombre', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="auth-email">Correo electrónico</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                id="auth-email" type="email" className="form-input" style={{ paddingLeft: '2.5rem' }}
                                placeholder="tu@email.com" required value={form.email}
                                onChange={e => set('email', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="auth-password">Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                id="auth-password" type={showPwd ? 'text' : 'password'} className="form-input"
                                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                placeholder="········" required value={form.password}
                                onChange={e => set('password', e.target.value)}
                            />
                            <button type="button" onClick={() => setShowPwd(p => !p)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                                aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {tab === 'register' && form.password && (
                            <div className="password-strength">
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4, color: strengthColor[strength] }}>
                                    <span>Seguridad: {strengthLabel[strength]}</span>
                                    <span>{strength}/5</span>
                                </div>
                                <div className="strength-bar">
                                    <div className="strength-fill" style={{ width: `${(strength / 5) * 100}%`, background: strengthColor[strength] }} />
                                </div>
                                <p className="form-hint" style={{ marginTop: 4 }}>Mínimo 8 caracteres, mayúscula, número y símbolo (@$!%*?&)</p>
                            </div>
                        )}
                    </div>

                    {tab === 'register' && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="auth-confirm">Confirmar contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    id="auth-confirm" type={showPwd ? 'text' : 'password'} className={`form-input${form.confirm && form.confirm !== form.password ? ' error' : ''}`}
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="Repite tu contraseña" value={form.confirm}
                                    onChange={e => set('confirm', e.target.value)}
                                />
                            </div>
                            {form.confirm && form.confirm !== form.password && (
                                <p className="form-error">Las contraseñas no coinciden</p>
                            )}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="auth-submit">
                        {loading ? <><span className="spinner spinner-sm" /> Procesando...</> : tab === 'login' ? 'Ingresar' : 'Crear Cuenta'}
                    </button>
                </form>

                {tab === 'login' && (
                    <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        ¿Olvidaste tu contraseña?{' '}
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600 }}
                            onClick={() => setError('Recuperación de contraseña: funcionalidad próximamente disponible')}>
                            Recuperar
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}
