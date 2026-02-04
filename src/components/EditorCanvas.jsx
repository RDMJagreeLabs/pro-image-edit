import React, { useEffect } from 'react';

const EditorCanvas = ({ activeTool, forwardedRef }) => {
    // Expose canvas ref to parent immediately on mount
    useEffect(() => {
        if (forwardedRef && forwardedRef.current) {
            // Initialize canvas with placeholder
            const canvas = forwardedRef.current;
            const ctx = canvas.getContext('2d');

            // Draw a placeholder gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#3b82f6');
            gradient.addColorStop(1, '#22d3ee');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = 'bold 24px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Your Image Will Appear Here', canvas.width / 2, canvas.height / 2);

            ctx.font = '16px Inter';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText('Upload using the button above', canvas.width / 2, canvas.height / 2 + 30);
        }
    }, [forwardedRef]);

    return (
        <div className="relative shadow-2xl rounded-sm ring-1 ring-white/10 mx-auto flex items-center justify-center bg-[#1a1a1a] w-fit">
            <canvas
                ref={forwardedRef}
                className="block object-contain max-w-full max-h-[60vh]"
                style={{
                    width: 'auto',
                    height: 'auto'
                }}
            />

            {activeTool && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 backdrop-blur rounded-full text-xs font-medium border border-white/10 animate-fade-in pointer-events-none">
                    Mode: {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
                </div>
            )}
        </div>
    );
};

export default EditorCanvas;
