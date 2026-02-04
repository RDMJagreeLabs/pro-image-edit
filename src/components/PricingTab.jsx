import React from 'react';

const pricingPlans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for casual users',
        features: [
            'Basic image editing',
            'Filters & adjustments',
            'Rotate & flip',
            'Download images',
            'Community support'
        ],
        cta: 'Get Started',
        highlighted: false
    },
    {
        name: 'Pro',
        price: '$9.99',
        period: '/month',
        description: 'For professionals and power users',
        features: [
            'Everything in Free',
            'Batch processing',
            'Advanced filters',
            'No watermarks',
            'Priority support',
            'Cloud storage (10GB)',
            'Custom export options'
        ],
        cta: 'Start Free Trial',
        highlighted: true
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For teams and organizations',
        features: [
            'Everything in Pro',
            'Unlimited cloud storage',
            'Team collaboration',
            'API access',
            'Custom integrations',
            'Dedicated account manager',
            'SLA guarantee'
        ],
        cta: 'Contact Sales',
        highlighted: false
    }
];

const PricingTab = ({ onSelectPlan }) => {
    return (
        <div className="w-full h-full overflow-y-auto bg-gradient-to-b from-background to-black/50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in">
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Choose Your Plan
                    </h2>
                    <p className="text-secondary text-lg">
                        Unlock the full potential of ProImageEdit
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {pricingPlans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className={`
                relative p-8 rounded-2xl border transition-all duration-300 hover:scale-105 animate-slide-up
                ${plan.highlighted
                                    ? 'bg-gradient-to-br from-primary/20 to-accent/20 border-primary shadow-2xl shadow-primary/20'
                                    : 'bg-surface/30 border-white/10 hover:border-white/20'
                                }
              `}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-xs font-bold">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-secondary text-sm">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold">{plan.price}</span>
                                    <span className="text-secondary">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-white/90">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => onSelectPlan(plan)}
                                className={`
                  w-full py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95
                  ${plan.highlighted
                                        ? 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/30'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                    }
                `}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
                    <div className="max-w-3xl mx-auto space-y-4 text-left">
                        {[
                            {
                                q: 'Can I switch plans later?',
                                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
                            },
                            {
                                q: 'What payment methods do you accept?',
                                a: 'We accept all major credit cards via Stripe and Lemon Squeezy. Both providers offer secure, encrypted payments.'
                            },
                            {
                                q: 'Is there a free trial?',
                                a: 'Yes! Pro plans come with a 14-day free trial. No credit card required.'
                            }
                        ].map((faq, i) => (
                            <div key={i} className="p-6 bg-surface/20 border border-white/5 rounded-lg">
                                <h4 className="font-semibold mb-2">{faq.q}</h4>
                                <p className="text-secondary text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingTab;
