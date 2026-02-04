import React from 'react';

const TabControl = ({ activeTab, setActiveTab, tabs }) => {
    return (
        <div className="w-full bg-surface/30 backdrop-blur-sm border-b border-white/5 px-6">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
              relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
              ${activeTab === tab.id ? 'text-white' : 'text-secondary hover:text-white'}
            `}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-fade-in" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TabControl;
