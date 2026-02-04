import { useState, useRef, useEffect } from 'react';
import EditorCanvas from './components/EditorCanvas';
import EmptyState from './components/EmptyState';
import HorizontalToolbar from './components/HorizontalToolbar';
import { imageProcessor } from './utils/imageProcessor';
import AuthModal from './components/AuthModal';
import TabControl from './components/TabControl';
import PricingTab from './components/PricingTab';
import PaymentModal from './components/PaymentModal';

function App() {
  const [hasImage, setHasImage] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [user, setUser] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [imageData, setImageData] = useState(null); // Store image data for tab switching
  const [history, setHistory] = useState([]); // Undo/redo history
  const [historyIndex, setHistoryIndex] = useState(-1); // Current position in history
  const canvasRef = useRef(null);

  const tabs = [
    { id: 'editor', label: 'Photo Editor' },
    { id: 'compress', label: 'Compress' },
    { id: 'resize', label: 'Resize' },
    { id: 'convert', label: 'Convert' },
    { id: 'pricing', label: 'Pricing' },
  ];

  const openAuth = (type) => {
    setAuthType(type);
    setIsAuthModalOpen(true);
  };

  // Restore image when returning to editor tab
  useEffect(() => {
    if (activeTab === 'editor' && hasImage && imageData && canvasRef.current) {
      console.log('🔄 Restoring image after tab switch');
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        console.log('✅ Image restored');
      };
      img.src = imageData;
    }
  }, [activeTab, hasImage, imageData]);

  // Load image from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('proimageedit_image');
    const savedHistory = localStorage.getItem('proimageedit_history');
    const savedIndex = localStorage.getItem('proimageedit_index');

    if (savedData && canvasRef.current) {
      console.log('💾 Loading saved image from localStorage');
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        setImageData(savedData);
        setHasImage(true);

        // Restore history if available
        if (savedHistory && savedIndex) {
          setHistory(JSON.parse(savedHistory));
          setHistoryIndex(parseInt(savedIndex));
        } else {
          setHistory([savedData]);
          setHistoryIndex(0);
        }

        console.log('✅ Image loaded from localStorage');
      };
      img.src = savedData;
    }
  }, []);

  // Save to localStorage whenever imageData changes
  useEffect(() => {
    if (imageData && hasImage) {
      try {
        // Always try to save the current image first
        localStorage.setItem('proimageedit_image', imageData);

        // Then try to save history, but don't crash if it fails (likely due to size)
        try {
          localStorage.setItem('proimageedit_history', JSON.stringify(history));
          localStorage.setItem('proimageedit_index', historyIndex.toString());
        } catch (historyError) {
          console.warn('⚠️ History too large for localStorage, skipping persistence of undo stack');
          // Clear history from storage to avoid stale/corrupt data
          localStorage.removeItem('proimageedit_history');
          localStorage.removeItem('proimageedit_index');
        }

        console.log('💾 Saved to localStorage');
      } catch (error) {
        console.error('❌ Failed to save to localStorage (quota exceeded):', error);
        // If even the single image is too big, likely need to clear standard storage
      }
    }
  }, [imageData, hasImage, history, historyIndex]);

  const handleFileUpload = (file) => {
    if (!file) return;

    console.log('🔵 Upload started:', file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('🔵 File read complete');
      const img = new Image();
      img.onload = () => {
        console.log('🔵 Image loaded:', img.width, 'x', img.height);
        const canvas = canvasRef.current;
        if (!canvas) {
          console.error('❌ Canvas ref is null!');
          return;
        }

        // Use full image dimensions
        const width = img.width;
        const height = img.height;

        console.log('🔵 Drawing to canvas at size:', width, 'x', height);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Store the image data for tab switching
        setImageData(e.target.result);
        setHasImage(true);

        // Initialize history with first image
        const initialState = canvas.toDataURL('image/png');
        setHistory([initialState]);
        setHistoryIndex(0);

        console.log('✅ Image uploaded successfully! hasImage:', true);
      };
      img.onerror = (err) => {
        console.error('❌ Image load error:', err);
      };
      img.src = e.target.result;
    };
    reader.onerror = (err) => {
      console.error('❌ FileReader error:', err);
    };
    reader.readAsDataURL(file);
  };

  const saveToHistory = (canvas) => {
    try {
      if (!canvas) return;
      const newState = canvas.toDataURL('image/png');
      // Safety check: ensure history is an array
      const safeHistory = Array.isArray(history) ? history : [];
      const newHistory = safeHistory.slice(0, historyIndex + 1);
      newHistory.push(newState);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setImageData(newState);
    } catch (error) {
      console.error('❌ Error saving to history:', error);
    }
  };

  const undo = () => {
    try {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const canvas = canvasRef.current;
        if (canvas && history[newIndex]) {
          const img = new Image();
          img.onload = () => {
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            setImageData(history[newIndex]);
          };
          img.src = history[newIndex];
        }
        console.log('↶ Undo applied, index:', newIndex);
      }
    } catch (error) {
      console.error('❌ Error executing undo:', error);
    }
  };

  const redo = () => {
    try {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        const canvas = canvasRef.current;
        if (canvas && history[newIndex]) {
          const img = new Image();
          img.onload = () => {
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            setImageData(history[newIndex]);
          };
          img.src = history[newIndex];
        }
        console.log('↷ Redo applied, index:', newIndex);
      }
    } catch (error) {
      console.error('❌ Error executing redo:', error);
    }
  };

  const applyFilter = (filterType) => {
    try {
      console.log('🎨 Applying filter:', filterType);
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('❌ Canvas not found for filter');
        return;
      }
      const ctx = canvas.getContext('2d');
      if (imageProcessor[filterType]) {
        imageProcessor[filterType](ctx, canvas.width, canvas.height);
        // Save to history and imageData
        saveToHistory(canvas);
        console.log('✅ Filter applied:', filterType);
      } else {
        console.error('❌ Filter not found:', filterType);
      }
    } catch (error) {
      console.error('❌ Error applying filter:', error);
      alert('Failed to apply filter. Please try again or try a different image.');
    }
  };

  const applyTransform = (type) => {
    try {
      console.log('🔄 Applying transform:', type);
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('❌ Canvas not found for transform');
        return;
      }

      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      if (type === 'rotate-clock') {
        tempCanvas.width = height;
        tempCanvas.height = width;
        tempCtx.translate(height, 0);
        tempCtx.rotate(90 * Math.PI / 180);
        tempCtx.drawImage(canvas, 0, 0);
      } else if (type === 'flip-h') {
        tempCanvas.width = width;
        tempCanvas.height = height;
        tempCtx.translate(width, 0);
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(canvas, 0, 0);
      } else if (type === 'flip-v') {
        tempCanvas.width = width;
        tempCanvas.height = height;
        tempCtx.translate(0, height);
        tempCtx.scale(1, -1);
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = tempCanvas.width;
      canvas.height = tempCanvas.height;
      const newCtx = canvas.getContext('2d');
      newCtx.drawImage(tempCanvas, 0, 0);

      // Save to history and imageData
      saveToHistory(canvas);
      console.log('✅ Transform applied and saved');
    } catch (error) {
      console.error('❌ Error applying transform:', error);
      alert('Failed to apply transform.');
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleClear = () => {
    console.log('🗑️ Clearing image');
    setHasImage(false);
    setImageData(null);
    setActiveTool(null);
    setHistory([]);
    setHistoryIndex(-1);
    // Clear localStorage
    localStorage.removeItem('proimageedit_image');
    localStorage.removeItem('proimageedit_history');
    localStorage.removeItem('proimageedit_index');
    // Clear the canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    console.log('✅ Image cleared');
  };

  const renderToolPanel = () => {
    if (!activeTool) return null;

    console.log('🔧 Tool panel opened:', activeTool);

    // Filters panel - floating buttons on left side
    if (activeTool === 'filters') {
      return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
          <button
            onClick={() => applyFilter('grayscale')}
            className="group relative w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-white/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-xl"
            title="Grayscale"
          >
            <div className="w-8 h-8 rounded-full bg-gray-400"></div>
            <span className="absolute left-20 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Grayscale</span>
          </button>
          <button
            onClick={() => applyFilter('sepia')}
            className="group relative w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-white/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-xl"
            title="Sepia"
          >
            <div className="w-8 h-8 rounded-full bg-amber-700"></div>
            <span className="absolute left-20 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Sepia</span>
          </button>
          <button
            onClick={() => applyFilter('invert')}
            className="group relative w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-white/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-xl"
            title="Invert"
          >
            <div className="w-8 h-8 rounded-full bg-white border-2 border-black"></div>
            <span className="absolute left-20 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Invert</span>
          </button>
        </div>
      );
    }

    // Adjustments panel - floating buttons on left side
    if (activeTool === 'adjust') {
      return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
          <button
            onClick={() => applyFilter('brightness')}
            className="group relative w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-white/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-xl"
            title="Brightness"
          >
            <span className="text-2xl">☀️</span>
            <span className="absolute left-20 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Brightness</span>
          </button>
          <button
            onClick={() => applyFilter('contrast')}
            className="group relative w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-white/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-xl"
            title="Contrast"
          >
            <span className="text-2xl">◐</span>
            <span className="absolute left-20 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Contrast</span>
          </button>
        </div>
      );
    }

    // Rotate panel - floating buttons on left side
    if (activeTool === 'rotate') {
      return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
          <button
            onClick={() => applyTransform('rotate-clock')}
            className="group relative w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-white/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-xl"
            title="Rotate 90°"
          >
            <span className="text-2xl">↻</span>
            <span className="absolute left-20 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Rotate 90°</span>
          </button>
          <button
            onClick={() => applyTransform('flip-h')}
            className="group relative w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-white/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-xl"
            title="Flip Horizontal"
          >
            <span className="text-2xl">⇄</span>
            <span className="absolute left-20 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Flip H</span>
          </button>
          <button
            onClick={() => applyTransform('flip-v')}
            className="group relative w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-white/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-xl"
            title="Flip Vertical"
          >
            <span className="text-2xl">⇅</span>
            <span className="absolute left-20 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Flip V</span>
          </button>
        </div>
      );
    }

    // Flip panel - floating buttons on left side
    if (activeTool === 'flip') {
      return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
          <button
            onClick={() => applyTransform('flip-h')}
            className="group relative w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-white/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-xl"
            title="Flip Horizontal"
          >
            <span className="text-2xl">⇄</span>
            <span className="absolute left-20 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Flip H</span>
          </button>
          <button
            onClick={() => applyTransform('flip-v')}
            className="group relative w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-white/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-xl"
            title="Flip Vertical"
          >
            <span className="text-2xl">⇅</span>
            <span className="absolute left-20 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Flip V</span>
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-screen bg-background text-white overflow-hidden">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} type={authType} />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedPlan={selectedPlan}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface/30 backdrop-blur-md z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleClear} title="Return to Home">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform duration-200 shadow-lg">
              P
            </div>
            <h1 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">ProImageEdit</h1>
          </div>

          {/* Tabs integrated into header */}
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-secondary hover:text-white hover:bg-white/5'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {!user && (
            <>
              <button
                onClick={() => openAuth('login')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-secondary hover:text-white transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => openAuth('signup')}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
              >
                Sign up
              </button>
            </>
          )}
          {hasImage && (
            <>
              <button
                className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm font-medium hover:scale-105 active:scale-95"
                onClick={handleClear}
              >
                Clear
              </button>
              <button
                className="px-4 py-2.5 rounded-lg border border-primary/50 text-primary hover:bg-primary/10 transition-all text-sm font-semibold hover:scale-105 active:scale-95"
                onClick={() => {
                  try {
                    localStorage.setItem('proimageedit_image', imageData);
                    localStorage.setItem('proimageedit_history', JSON.stringify(history));
                    localStorage.setItem('proimageedit_index', historyIndex.toString());
                    alert('✅ Project saved successfully!');
                  } catch (e) {
                    console.error('Save failed:', e);
                    alert('⚠️ could not save full project (quota exceeded), but current image is safe!');
                  }
                }}
              >
                Save
              </button>
              <button
                className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 transition-all text-sm font-semibold shadow-lg shadow-primary/30 hover:scale-105 active:scale-95"
                onClick={handleDownload}
              >
                Download
              </button>
            </>
          )}
        </div>
      </header >

      {/* Main Content */}
      {
        activeTab === 'pricing' ? (
          <PricingTab onSelectPlan={(plan) => {
            if (plan.name === 'Free') {
              alert('🎉 You\'re already on the Free plan! No payment needed.');
            } else if (plan.name === 'Enterprise') {
              alert('📧 Our sales team will contact you shortly!\n\n(This is a demo)');
            } else {
              setSelectedPlan(plan);
              setIsPaymentModalOpen(true);
            }
          }} />
        ) : activeTab === 'editor' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar - only show when has image */}
            {hasImage && <HorizontalToolbar activeTool={activeTool} setActiveTool={setActiveTool} />}

            {/* Canvas Area - always rendered so ref is available */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-black/20 to-black/40 relative">
              <EditorCanvas activeTool={activeTool} forwardedRef={canvasRef} />

              {/* Undo/Redo Circular Buttons - MS Office style */}
              {hasImage && (
                <div className="absolute top-6 left-6 flex gap-2 z-50">
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className={`w-12 h-12 rounded-full backdrop-blur-md border transition-all shadow-xl flex items-center justify-center
                    ${historyIndex <= 0
                        ? 'bg-black/20 border-white/10 text-white/30 cursor-not-allowed'
                        : 'bg-black/40 border-white/20 hover:bg-black/60 hover:border-white/40 hover:scale-110 active:scale-95 text-white'
                      }`}
                    title="Undo (Ctrl+Z)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className={`w-12 h-12 rounded-full backdrop-blur-md border transition-all shadow-xl flex items-center justify-center
                    ${historyIndex >= history.length - 1
                        ? 'bg-black/20 border-white/10 text-white/30 cursor-not-allowed'
                        : 'bg-black/40 border-white/20 hover:bg-black/60 hover:border-white/40 hover:scale-110 active:scale-95 text-white'
                      }`}
                    title="Redo (Ctrl+Y)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                    </svg>
                  </button>
                </div>
              )}

              {renderToolPanel()}

              {/* Empty State Overlay - shown when no image */}
              {!hasImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-sm overflow-auto py-8">
                  <EmptyState onUpload={handleFileUpload} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-black/50 animate-fade-in">
            <div className="text-center p-8 border border-white/10 rounded-2xl bg-surface/50 shadow-2xl backdrop-blur-md">
              <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
              <p className="text-secondary">The {tabs.find(t => t.id === activeTab)?.label} module is under construction.</p>
              <button onClick={() => setActiveTab('editor')} className="mt-6 px-6 py-2 bg-primary rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">Return to Editor</button>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default App;
