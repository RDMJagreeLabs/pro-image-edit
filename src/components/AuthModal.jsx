import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose, type = 'login', onAuthSuccess }) => {
    const [mode, setMode] = useState(type); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
        const body = mode === 'login'
            ? { identifier: email, password }
            : { email, username, password };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            if (mode === 'login') {
                localStorage.setItem('proimageedit_token', data.token);
                if (onAuthSuccess) onAuthSuccess(data.user);
                onClose();
            } else {
                // After signup, switch to login mode
                alert('Account created! Please sign in.');
                setMode('login');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const socialLogin = async (provider) => {
        setError('');
        setLoading(true);

        try {
            // In a real app, this would be the callback after OAuth redirect.
            // For this test, we simulate a successful OAuth response with a dummy email.
            const response = await fetch('/api/auth/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: `social_${provider.toLowerCase()}_test@example.com`,
                    provider: provider.toLowerCase()
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Social authentication failed');
            }

            localStorage.setItem('proimageedit_token', data.token);
            if (onAuthSuccess) onAuthSuccess(data.user);
            onClose();
            alert(`Successfully signed in with ${provider}!`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div
                className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-white/5">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            {mode === 'login' ? 'Welcome Back' : 'Get Started'}
                        </h2>
                        <p className="text-secondary text-sm mt-1">
                            {mode === 'login' ? 'Enter your details to access your account' : 'Join our community of creators today'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full hover:bg-white/10 text-secondary hover:text-white transition-all hover:rotate-90"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8">
                    {/* Social Logic - Moved to top for modern look */}
                    <div className="space-y-3 mb-8">
                        <button
                            type="button"
                            onClick={() => socialLogin('Google')}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-medium text-white group"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => socialLogin('Apple')}
                                className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-medium text-white group"
                            >
                                <svg className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path d="M17.05 20.28c-.96.95-2.04 1.43-3.08 1.43-1.12 0-2.06-.39-3.03-1.43-1.02-1.08-1.91-1.61-3.11-1.61s-2.09.53-3.11 1.61c-1.09 1.15-2.03 1.54-3.15 1.54s-2.12-.49-3.08-1.43C-.54 18.25-1 16.48-1 14.5c0-4.04 2.68-6.19 5.3-6.19 1.34 0 2.51.52 3.2 1.25.61.64 1.2 1.25 2.5 1.25s1.89-.61 2.5-1.25c.69-.73 1.86-1.25 3.2-1.25 2.62 0 5.3 2.15 5.3 6.19 0 1.98-.46 3.75-1.45 4.73l-1.5 1.5zM12 7.07c-.03-2.05 1.66-3.79 3.71-3.82.04 2.22-1.85 3.98-3.71 3.82z" />
                                </svg>
                                Apple
                            </button>
                            <button
                                type="button"
                                onClick={() => socialLogin('Facebook')}
                                className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-medium text-white group"
                            >
                                <svg className="w-5 h-5 fill-[#1877F2] group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                            </button>
                        </div>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                            <span className="bg-[#121212] px-4 text-secondary/60">Or use your email</span>
                        </div>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        {error && (
                            <div className="p-4 text-sm bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl animate-shake flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-secondary uppercase tracking-wider ml-1">
                                {mode === 'login' ? 'Email or Username' : 'Email Address'}
                            </label>
                            <input
                                type={mode === 'login' ? 'text' : 'email'}
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={mode === 'login' ? "Username or email" : "name@company.com"}
                                className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-white placeholder-secondary/30"
                            />
                        </div>

                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-secondary uppercase tracking-wider ml-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="cool_editor_123"
                                    className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-white placeholder-secondary/30"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Password</label>
                                {mode === 'login' && (
                                    <button type="button" className="text-xs text-primary hover:underline font-medium">Forgot password?</button>
                                )}
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-white placeholder-secondary/30"
                            />
                        </div>

                        <button
                            disabled={loading}
                            className={`w-full py-4 mt-4 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading && (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center text-sm">
                    <p className="text-secondary">
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                            className="text-primary hover:text-blue-400 font-bold transition-colors ml-1"
                        >
                            {mode === 'login' ? 'Create one for free' : 'Sign in instead'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
