import React from 'react';

const tools = [
    { id: 'filters', label: 'Filters', icon: '🎨', description: 'Apply color effects' },
    { id: 'adjust', label: 'Adjust', icon: '⚙️', description: 'Brightness, Contrast' },
    { id: 'rotate', label: 'Rotate', icon: '↻', description: 'Rotate 90°' },
    { id: 'flip', label: 'Flip', icon: '⇄', description: 'Flip H/V' },
    { id: 'crop', label: 'Crop', icon: '✂️', description: 'Cut and resize' },
    { id: 'resize', label: 'Resize', icon: '📏', description: 'Change dimensions' },
];

const HorizontalToolbar = ({ activeTool, setActiveTool }) => {
    return (
        <div className="w-full bg-surface/50 backdrop-blur-md border-b border-white/10 px-6 py-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                    {tools.map((tool) => {
                        const isActive = activeTool === tool.id;
                        const isComingSoon = tool.description === 'Coming soon';

                        return (
                            <button
                                key={tool.id}
                                onClick={() => {
                                    console.log('🔘 Toolbar button clicked:', tool.id, 'isComingSoon:', isComingSoon);
                                    if (!isComingSoon) {
                                        setActiveTool(isActive ? null : tool.id);
                                        console.log('✅ Active tool set to:', isActive ? null : tool.id);
                                    }
                                }}
                                disabled={isComingSoon}
                                className={`
                  flex-shrink-0 group relative px-5 py-3 rounded-xl font-medium transition-all duration-200
                  ${isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : isComingSoon
                                            ? 'bg-white/5 text-secondary/50 cursor-not-allowed'
                                            : 'bg-white/5 hover:bg-white/10 text-white hover:scale-105'
                                    }
                  active:scale-95
                `}
                                title={tool.description}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{tool.icon}</span>
                                    <span className="text-sm whitespace-nowrap">{tool.label}</span>
                                </div>

                                {/* Active Indicator */}
                                {isActive && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-lg" />
                                )}

                                {/* Coming Soon Badge */}
                                {isComingSoon && (
                                    <div className="absolute -top-2 -right-2 bg-accent px-2 py-0.5 rounded-full text-xs font-bold text-black">
                                        Soon
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HorizontalToolbar;
