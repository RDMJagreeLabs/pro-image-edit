import React, { useState } from 'react';
import { createStripeCheckout } from '../services/stripe';
import { createLemonSqueezyCheckout } from '../services/lemonsqueezy';

const PaymentModal = ({ isOpen, onClose, selectedPlan }) => {
    const [paymentProvider, setPaymentProvider] = useState('stripe');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !selectedPlan) return null;

    const handlePayment = async () => {
        setProcessing(true);
        setError(null);

        try {
            if (paymentProvider === 'stripe') {
                await createStripeCheckout(selectedPlan);
            } else {
                await createLemonSqueezyCheckout(selectedPlan);
            }
            // Redirect happens in the service, so this code may not run
            // But keep it for error handling
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message || 'Payment failed. Please try again or contact support.');
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="relative w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Complete Payment</h2>
                        <p className="text-sm text-secondary mt-1">
                            {selectedPlan.name} Plan - {selectedPlan.price}{selectedPlan.period}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-secondary hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Payment Provider Selection */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-3">Choose Payment Provider</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setPaymentProvider('stripe')}
                                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${paymentProvider === 'stripe'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-white/10 hover:border-white/20 bg-white/5'
                                    }
                `}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className="text-2xl">💳</div>
                                    <span className="font-semibold">Stripe</span>
                                    <span className="text-xs text-secondary">Cards, Wallets</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setPaymentProvider('lemonsqueezy')}
                                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${paymentProvider === 'lemonsqueezy'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-white/10 hover:border-white/20 bg-white/5'
                                    }
                `}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className="text-2xl">🍋</div>
                                    <span className="font-semibold">Lemon Squeezy</span>
                                    <span className="text-xs text-secondary">Multi-currency</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Plan Summary */}
                    <div className="p-4 bg-black/20 rounded-lg border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-secondary">Plan</span>
                            <span className="font-semibold">{selectedPlan.name}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-secondary">Billing</span>
                            <span className="font-semibold">{selectedPlan.period || 'One-time'}</span>
                        </div>
                        <div className="h-px bg-white/10 my-3"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Total</span>
                            <span className="text-2xl font-bold text-primary">{selectedPlan.price}</span>
                        </div>
                    </div>

                    {/* Provider Info */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                        <div className="flex gap-2">
                            <div className="text-primary mt-0.5">ℹ️</div>
                            <div className="text-secondary">
                                {paymentProvider === 'stripe'
                                    ? 'Stripe processes payments securely with bank-level encryption. Your card details are never stored on our servers.'
                                    : 'Lemon Squeezy handles payments in multiple currencies with automatic tax calculation. Perfect for international customers.'
                                }
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm animate-fade-in">
                            <div className="flex gap-2">
                                <div className="text-red-400 mt-0.5">⚠️</div>
                                <div className="text-red-300">{error}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-black/20 border-t border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors font-medium"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={processing}
                        className="flex-1 py-3 rounded-lg bg-primary hover:bg-blue-600 transition-colors font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processing...
                            </span>
                        ) : (
                            `Pay with ${paymentProvider === 'stripe' ? 'Stripe' : 'Lemon Squeezy'}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
