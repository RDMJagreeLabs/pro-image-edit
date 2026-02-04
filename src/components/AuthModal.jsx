import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose, type = 'login', onAuthSuccess }) => {
    const [mode, setMode] = useState(type); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="relative w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-2xl font-bold text-white">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-secondary hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleAuth} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-secondary">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white placeholder-secondary/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-secondary">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white placeholder-secondary/50"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className={`w-full py-3 mt-4 rounded-lg bg-primary hover:bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] ${loading ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-surface px-2 text-secondary">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" className="flex items-center justify-center px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium text-secondary hover:text-white">
                            Google
                        </button>
                        <button type="button" className="flex items-center justify-center px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium text-secondary hover:text-white">
                            GitHub
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-4 bg-black/20 text-center text-sm text-secondary">
                    {mode === 'login' ? (
                        <>
                            Don't have an account?{' '}
                            <button onClick={() => { setMode('signup'); setError(''); }} className="text-primary hover:underline font-medium">Sign up</button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button onClick={() => { setMode('login'); setError(''); }} className="text-primary hover:underline font-medium">Log in</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
