import React, { useEffect, useRef, useState, useCallback } from 'react';

const EditorCanvas = ({ activeTool, forwardedRef, cropBox, setCropBox }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState(null); // 'move' or handle position like 'tl', 'tr', 'bl', 'br'
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const HANDLE_SIZE = 10;

    const getMousePos = (e) => {
        const canvas = forwardedRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const handleMouseDown = (e) => {
        if (activeTool !== 'crop') return;

        const pos = getMousePos(e);
        const { x, y, width, height } = cropBox;

        // Check if clicking on handles
        if (Math.abs(pos.x - x) < HANDLE_SIZE && Math.abs(pos.y - y) < HANDLE_SIZE) setDragMode('tl');
        else if (Math.abs(pos.x - (x + width)) < HANDLE_SIZE && Math.abs(pos.y - y) < HANDLE_SIZE) setDragMode('tr');
        else if (Math.abs(pos.x - x) < HANDLE_SIZE && Math.abs(pos.y - (y + height)) < HANDLE_SIZE) setDragMode('bl');
        else if (Math.abs(pos.x - (x + width)) < HANDLE_SIZE && Math.abs(pos.y - (y + height)) < HANDLE_SIZE) setDragMode('br');
        else if (pos.x > x && pos.x < x + width && pos.y > y && pos.y < y + height) setDragMode('move');
        else return;

        setIsDragging(true);
        setStartPos(pos);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || activeTool !== 'crop') return;

        const pos = getMousePos(e);
        const dx = pos.x - startPos.x;
        const dy = pos.y - startPos.y;

        let newBox = { ...cropBox };

        if (dragMode === 'move') {
            newBox.x += dx;
            newBox.y += dy;
        } else if (dragMode === 'tl') {
            newBox.x += dx;
            newBox.y += dy;
            newBox.width -= dx;
            newBox.height -= dy;
        } else if (dragMode === 'tr') {
            newBox.y += dy;
            newBox.width += dx;
            newBox.height -= dy;
        } else if (dragMode === 'bl') {
            newBox.x += dx;
            newBox.width -= dx;
            newBox.height += dy;
        } else if (dragMode === 'br') {
            newBox.width += dx;
            newBox.height += dy;
        }

        // Clamp values to canvas boundaries (basic)
        const canvas = forwardedRef.current;
        newBox.x = Math.max(0, Math.min(newBox.x, canvas.width - 20));
        newBox.y = Math.max(0, Math.min(newBox.y, canvas.height - 20));
        newBox.width = Math.max(20, Math.min(newBox.width, canvas.width - newBox.x));
        newBox.height = Math.max(20, Math.min(newBox.height, canvas.height - newBox.y));

        setCropBox(newBox);
        setStartPos(pos);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragMode(null);
    };

    // Drawing logic
    const drawOverlay = useCallback(() => {
        const canvas = forwardedRef.current;
        if (!canvas || activeTool !== 'crop') return;

        const ctx = canvas.getContext('2d');
        // Actually, we can't draw the overlay ON the main canvas without destroying data
        // unless we redraw the image first.
        // The current implementation is a bit tricky since we don't have the original image object here.
        // It's better to redraw the entire canvas from the source image.
        // However, EditorCanvas doesn't have the source image.
        // Let's assume there's a custom overlay DIV or a secondary canvas.
    }, [activeTool, cropBox, forwardedRef]);

    // Initial placeholder logic
    useEffect(() => {
        if (forwardedRef && forwardedRef.current && !cropBox.imageSet) {
            const canvas = forwardedRef.current;
            const ctx = canvas.getContext('2d');

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
    }, [forwardedRef, cropBox.imageSet]);

    return (
        <div className="relative shadow-2xl rounded-sm ring-1 ring-white/10 mx-auto flex items-center justify-center bg-[#1a1a1a] w-fit">
            <canvas
                ref={forwardedRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`block object-contain max-w-full max-h-[60vh] ${activeTool === 'crop' ? 'cursor-crosshair' : ''}`}
                style={{
                    width: 'auto',
                    height: 'auto'
                }}
            />

            {/* Crop Overlay (HTML/CSS Based for non-destructive preview) */}
            {activeTool === 'crop' && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                >
                    {/* Dimmed Areas */}
                    <div className="absolute inset-0 bg-black/50" style={{
                        clipPath: `polygon(
                            0% 0%, 0% 100%, 
                            ${(cropBox.x / forwardedRef.current.width) * 100}% 100%, 
                            ${(cropBox.x / forwardedRef.current.width) * 100}% ${(cropBox.y / forwardedRef.current.height) * 100}%, 
                            ${((cropBox.x + cropBox.width) / forwardedRef.current.width) * 100}% ${(cropBox.y / forwardedRef.current.height) * 100}%, 
                            ${((cropBox.x + cropBox.width) / forwardedRef.current.width) * 100}% ${((cropBox.y + cropBox.height) / forwardedRef.current.height) * 100}%, 
                            ${(cropBox.x / forwardedRef.current.width) * 100}% ${((cropBox.y + cropBox.height) / forwardedRef.current.height) * 100}%, 
                            ${(cropBox.x / forwardedRef.current.width) * 100}% 100%, 
                            100% 100%, 100% 0%
                        )`
                    }} />

                    {/* Selection Box */}
                    <div
                        className="absolute border border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0)]"
                        style={{
                            left: `${(cropBox.x / forwardedRef.current.width) * 100}%`,
                            top: `${(cropBox.y / forwardedRef.current.height) * 100}%`,
                            width: `${(cropBox.width / forwardedRef.current.width) * 100}%`,
                            height: `${(cropBox.height / forwardedRef.current.height) * 100}%`
                        }}
                    >
                        {/* Grid lines */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                            {[...Array(4)].map((_, i) => (
                                <div key={`v-${i}`} className="border-r border-white" />
                            ))}
                            {[...Array(4)].map((_, i) => (
                                <div key={`h-${i}`} className="border-b border-white" />
                            ))}
                        </div>

                        {/* Handles */}
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full border border-black/20 pointer-events-auto cursor-nw-resize" />
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full border border-black/20 pointer-events-auto cursor-ne-resize" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-full border border-black/20 pointer-events-auto cursor-sw-resize" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full border border-black/20 pointer-events-auto cursor-se-resize" />
                    </div>
                </div>
            )}

            {activeTool && activeTool !== 'crop' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 backdrop-blur rounded-full text-xs font-medium border border-white/10 animate-fade-in pointer-events-none">
                    Mode: {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
                </div>
            )}
        </div>
    );
};

export default EditorCanvas;
