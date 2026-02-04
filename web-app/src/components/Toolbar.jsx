import React from 'react';

const tools = [
    { id: 'crop', icon: '✂️', label: 'Crop' },
    { id: 'rotate', icon: 'Cw', label: 'Rotate' }, // Using text as placeholder icon
    { id: 'filter', icon: '🎨', label: 'Filters' },
    { id: 'adjust', icon: '⚙️', label: 'Adjust' },
    { id: 'resize', icon: '📐', label: 'Resize' },
];

const Toolbar = ({ activeTool, setActiveTool }) => {
    return (
        <aside className="w-20 flex flex-col items-center py-6 gap-2 border-r border-white/5 bg-surface/30 backdrop-blur-sm z-10">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`
            w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200
            ${activeTool === tool.id
                            ? 'bg-primary text-white shadow-lg shadow-blue-500/25 scale-105'
                            : 'text-secondary hover:bg-white/5 hover:text-white'}
          `}
                    title={tool.label}
                >
                    <span className="text-xl">{tool.icon}</span>
                </button>
            ))}
        </aside>
    );
};

export default Toolbar;
