import React, { useState } from 'react';

const EmptyState = ({ onUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            onUpload(file);
        }
    };

    const loadAndCropSample = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], filename, { type: 'image/png' });
            onUpload(file);
        } catch (err) {
            console.error("Error loading sample:", err);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-8 animate-fade-in">
            <div className="text-center max-w-2xl w-full">
                {/* Main upload area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        relative rounded-3xl border-2 border-dashed transition-all duration-300 ease-out
                        ${isDragging
                            ? 'border-primary bg-primary/5 scale-[1.02]'
                            : 'border-white/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30'
                        }
                        backdrop-blur-xl p-8
                    `}
                >
                    {/* Icon with gradient */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/20 transform hover:scale-105 transition-transform duration-300">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl font-semibold mb-2 text-white tracking-tight">
                        {isDragging ? 'Drop to upload' : 'Choose an image'}
                    </h2>
                    <p className="text-base text-white/60 mb-6 font-light">
                        {isDragging ? 'Release to start editing' : 'or drag and drop it here'}
                    </p>

                    {/* Upload Button */}
                    <label className="inline-block cursor-pointer group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onUpload(file);
                            }}
                            className="hidden"
                        />
                        <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-sm cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 inline-flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Browse Files
                        </div>
                    </label>

                    {/* Sample Image Option */}
                    <div className="mt-5">
                        <p className="text-xs text-white/40 mb-2">Or try with a sample</p>
                        <button
                            onClick={() => loadAndCropSample('/sample-image.png', 'sample-image.png')}
                            className="group relative overflow-hidden rounded-xl border-2 border-white/10 hover:border-white/30 transition-all hover:scale-105 active:scale-95"
                        >
                            <img
                                src="/sample-image.png"
                                alt="Sample landscape"
                                className="w-24 h-16 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Try this image</span>
                            </div>
                        </button>
                    </div>

                    {/* Subtle divider */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-xs text-white/40 font-light mb-3">
                            Supported formats
                        </p>
                        <div className="flex items-center justify-center gap-4 text-[10px] text-white/60">
                            <span className="px-2 py-1 rounded-full bg-white/5">JPG</span>
                            <span className="px-2 py-1 rounded-full bg-white/5">PNG</span>
                            <span className="px-2 py-1 rounded-full bg-white/5">GIF</span>
                            <span className="px-2 py-1 rounded-full bg-white/5">WebP</span>
                        </div>
                    </div>
                </div>

                {/* Feature highlights - minimal */}
                <div className="mt-6 grid grid-cols-3 gap-6 text-center">
                    {[
                        { icon: '✨', text: 'Professional filters' },
                        { icon: '⚡', text: 'Instant results' },
                        { icon: '🎨', text: 'Easy to use' }
                    ].map((feature, i) => (
                        <div key={i} className="group">
                            <div className="text-2xl mb-1 transform group-hover:scale-110 transition-transform duration-200">
                                {feature.icon}
                            </div>
                            <p className="text-xs text-white/60 font-light">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmptyState;
