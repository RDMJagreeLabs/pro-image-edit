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
  const [pendingDownload, setPendingDownload] = useState(false);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 200, height: 200, imageSet: false });
  const [resizeParams, setResizeParams] = useState({ width: 0, height: 0, lockAspectRatio: true, originalRatio: 1 });
  const [compressParams, setCompressParams] = useState({ quality: 80, format: 'image/jpeg', showComparison: false });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [bulkFiles, setBulkFiles] = useState([]);
  const canvasRef = useRef(null);

  const tabs = [
    { id: 'editor', label: 'Photo Editor' },
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

  // Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('proimageedit_token');
      if (!token) return;

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('proimageedit_token');
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    };

    checkSession();
  }, []);

  // Resume pending download after auth
  useEffect(() => {
    if (user && pendingDownload) {
      console.log('🚀 Resuming pending download...');
      handleDownload();
      setPendingDownload(false);
    }
  }, [user, pendingDownload]);

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

  // Handle generation of compression preview with a small debounce to keep UI snappy
  useEffect(() => {
    if (activeTool === 'compress' && compressParams.showComparison) {
      const timer = setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          try {
            const url = canvas.toDataURL(compressParams.format, compressParams.quality / 100);
            setPreviewUrl(url);
          } catch (err) {
            console.error('❌ Error generating preview:', err);
          }
        }
      }, 50); // 50ms debounce
      return () => clearTimeout(timer);
    } else {
      setPreviewUrl(null);
    }
  }, [activeTool, compressParams.quality, compressParams.format, compressParams.showComparison]);

  const handleFileUpload = (input) => {
    if (!input) return;

    // Handle multiple files
    if (Array.isArray(input)) {
      console.log('📦 Bulk upload detected:', input.length, 'files');
      setBulkFiles(input);
      // Automatically load the first one for the editor
      handleFileUpload(input[0]);
      return;
    }

    const file = input;
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

        // Initialize crop box to 80% of image size
        setCropBox({
          x: width * 0.1,
          y: height * 0.1,
          width: width * 0.8,
          height: height * 0.8,
          imageSet: true
        });

        // Initialize resize params
        setResizeParams({
          width: width,
          height: height,
          lockAspectRatio: true,
          originalRatio: width / height
        });

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

  const executeCrop = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { x, y, width, height } = cropBox;
      const ctx = canvas.getContext('2d');
      const croppedData = imageProcessor.crop(ctx, x, y, width, height);

      // Resize canvas to new dimensions
      canvas.width = width;
      canvas.height = height;
      const newCtx = canvas.getContext('2d');
      newCtx.putImageData(croppedData, 0, 0);

      saveToHistory(canvas);
      setActiveTool(null);
      console.log('✅ Crop executed and saved');
    } catch (error) {
      console.error('❌ Error executing crop:', error);
      alert('Failed to crop image.');
    }
  };

  const executeResize = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { width, height } = resizeParams;
      const ctx = canvas.getContext('2d');

      // Create a temporary canvas to hold the original image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);

      // Resize original canvas
      canvas.width = width;
      canvas.height = height;
      const newCtx = canvas.getContext('2d');

      // Draw from temp canvas to scaled canvas
      newCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, width, height);

      saveToHistory(canvas);
      setActiveTool(null);
      console.log('✅ Resize executed and saved');
    } catch (error) {
      console.error('❌ Error executing resize:', error);
      alert('Failed to resize image.');
    }
  };

  const handleResizeParamChange = (field, value) => {
    const newVal = parseInt(value) || 0;
    setResizeParams(prev => {
      const updated = { ...prev, [field]: newVal };
      if (prev.lockAspectRatio) {
        if (field === 'width') {
          updated.height = Math.round(newVal / prev.originalRatio);
        } else if (field === 'height') {
          updated.width = Math.round(newVal * prev.originalRatio);
        }
      }
      return updated;
    });
  };

  const executeCompress = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const mimeType = compressParams.format;
      const quality = compressParams.quality / 100;

      console.log(`🗜️ Applying compression: ${mimeType} @ ${quality * 100}%`);

      // Draw the compressed result back onto the canvas
      const dataUrl = canvas.toDataURL(mimeType, quality);
      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        // If we are changing formats (e.g. to JPEG), we might want to fill background with white 
        // if the original had transparency, but let's keep it simple for now.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveToHistory(canvas);
        setActiveTool(null);
        console.log('✅ Compression applied to canvas and saved to history');
      };
      img.src = dataUrl;
    } catch (error) {
      console.error('❌ Error applying compression:', error);
      alert('Failed to apply compression.');
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

  const handleDownload = async () => {
    console.log('📥 Download requested, user:', user ? user.email : 'guest');

    // Trigger auth if not logged in - check this BEFORE canvas
    if (!user) {
      console.log('🔒 Auth required for download and save');
      setPendingDownload(true);
      openAuth('signup');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('⚠️ Canvas not found - switching to editor tab');
      setActiveTab('editor');
      setPendingDownload(true);
      return;
    }

    // Trigger download
    const mimeType = activeTool === 'compress' ? compressParams.format : 'image/png';
    const quality = activeTool === 'compress' ? compressParams.quality / 100 : 1;
    const dataUrl = canvas.toDataURL(mimeType, quality);

    // Auto-save to Vercel Blob
    console.log(`💾 Auto-saving to Vercel Blob (${mimeType} @ ${quality})...`);
    try {
      const token = localStorage.getItem('proimageedit_token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          filename: `edited-image-${Date.now()}.${mimeType.split('/')[1]}`,
          contentType: mimeType,
          dataUrl
        })
      });

      if (response.ok) {
        const blob = await response.json();
        console.log('✅ Image auto-saved to:', blob.url);
      } else {
        console.error('❌ Auto-save failed');
      }
    } catch (err) {
      console.error('❌ Auto-save error:', err);
    }

    const link = document.createElement('a');
    link.download = `edited-image.${mimeType.split('/')[1]}`;
    link.href = dataUrl;
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

    // Crop panel - floating buttons on left side
    if (activeTool === 'crop') {
      const setAspectRatio = (ratio) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const newBox = { ...cropBox };
        if (ratio === '1:1') {
          const size = Math.min(newBox.width, newBox.height);
          newBox.width = size;
          newBox.height = size;
        } else if (ratio === '4:3') {
          newBox.height = newBox.width * (3 / 4);
        } else if (ratio === '16:9') {
          newBox.height = newBox.width * (9 / 16);
        }

        // Ensure within bounds after ratio adjustment
        if (newBox.y + newBox.height > canvas.height) {
          newBox.height = canvas.height - newBox.y;
          if (ratio === '4:3') newBox.width = newBox.height * (4 / 3);
          else if (ratio === '16:9') newBox.width = newBox.height * (16 / 9);
        }

        setCropBox(newBox);
      };

      return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
          <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-wider text-secondary font-bold text-center mb-1">Ratio</span>
            <button onClick={() => setAspectRatio('1:1')} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium">1:1</button>
            <button onClick={() => setAspectRatio('4:3')} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium">4:3</button>
            <button onClick={() => setAspectRatio('16:9')} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium">16:9</button>
            <button onClick={() => setCropBox({ ...cropBox, width: canvasRef.current.width * 0.8, height: canvasRef.current.height * 0.8 })} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium">Free</button>
          </div>

          <button
            onClick={executeCrop}
            className="w-16 h-16 rounded-full bg-primary border border-white/20 hover:bg-blue-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-xl shadow-primary/40"
            title="Apply Crop"
          >
            <span className="text-2xl">✓</span>
          </button>
          <button
            onClick={() => setActiveTool(null)}
            className="w-16 h-16 rounded-full bg-red-500/80 border border-white/20 hover:bg-red-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center shadow-xl shadow-red-500/20"
            title="Cancel"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>
      );
    }

    // Resize panel - floating buttons on left side
    if (activeTool === 'resize') {
      const scaleBy = (percent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const factor = percent / 100;
        setResizeParams(prev => ({
          ...prev,
          width: Math.round(canvas.width * factor),
          height: Math.round(canvas.height * factor)
        }));
      };

      const setPreset = (w, h) => {
        setResizeParams(prev => ({
          ...prev,
          width: w,
          height: h
        }));
      };

      return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
          <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col gap-4 w-56 shadow-2xl">
            <span className="text-[10px] uppercase tracking-wider text-secondary font-bold text-center">Dimensions</span>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-secondary mb-1 block">Width</label>
                  <input
                    type="number"
                    value={resizeParams.width}
                    onChange={(e) => handleResizeParamChange('width', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setResizeParams(prev => ({ ...prev, lockAspectRatio: !prev.lockAspectRatio }))}
                    className={`p-1.5 rounded-lg transition-colors ${resizeParams.lockAspectRatio ? 'text-primary bg-primary/10' : 'text-secondary hover:bg-white/5'}`}
                    title="Lock Aspect Ratio"
                  >
                    {resizeParams.lockAspectRatio ? '🔒' : '🔓'}
                  </button>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-secondary mb-1 block">Height</label>
                  <input
                    type="number"
                    value={resizeParams.height}
                    onChange={(e) => handleResizeParamChange('height', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[25, 50, 75, 100, 200].map(p => (
                <button
                  key={p}
                  onClick={() => scaleBy(p)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-medium transition-colors"
                >
                  {p}%
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-secondary/50 block font-medium">Presets</span>
              <div className="grid grid-cols-1 gap-1.5">
                <button onClick={() => setPreset(1920, 1080)} className="text-left px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[10px] flex justify-between">
                  <span>Full HD</span> <span className="text-secondary">1920×1080</span>
                </button>
                <button onClick={() => setPreset(1080, 1080)} className="text-left px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[10px] flex justify-between">
                  <span>Instagram</span> <span className="text-secondary">1080×1080</span>
                </button>
                <button onClick={() => setPreset(3508, 2480)} className="text-left px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[10px] flex justify-between">
                  <span>A4 @ 300dpi</span> <span className="text-secondary">3508×2480</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={executeResize}
              className="flex-1 h-14 rounded-2xl bg-primary border border-white/20 hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-xl shadow-primary/40"
              title="Apply Resize"
            >
              <span className="text-xl">✓</span>
            </button>
            <button
              onClick={() => setActiveTool(null)}
              className="w-14 h-14 rounded-2xl bg-red-500/80 border border-white/20 hover:bg-red-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-xl shadow-red-500/20"
              title="Cancel"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
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

    // Compression panel - floating buttons on left side
    if (activeTool === 'compress') {
      return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
          <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col gap-4 w-56 shadow-2xl">
            <span className="text-[10px] uppercase tracking-wider text-secondary font-bold text-center">Settings</span>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-secondary mb-2 block flex justify-between">
                  <span>Quality</span>
                  <span className="text-primary">{compressParams.quality}%</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={compressParams.quality}
                  onChange={(e) => setCompressParams(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                  className="w-full accent-primary bg-white/10 rounded-lg h-1 appearance-none cursor-pointer"
                />
              </div>

              {bulkFiles.length > 1 && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] text-secondary/60 block font-medium mb-1">Bulk Processing</span>
                  <div className="bg-white/5 p-2 rounded-lg flex items-center gap-2">
                    <span className="text-sm">📦</span>
                    <span className="text-[10px] text-secondary">{bulkFiles.length} files selected</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-white/5">
                <button
                  onClick={() => setCompressParams(prev => ({ ...prev, showComparison: !prev.showComparison }))}
                  className={`w-full py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${compressParams.showComparison ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 text-secondary border border-white/10 hover:bg-white/10'}`}
                >
                  <span>{compressParams.showComparison ? '👁️ Hide Comparison' : '👁️ Show Comparison'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={executeCompress}
              className="flex-1 h-14 rounded-2xl bg-primary border border-white/20 hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-xl shadow-primary/40"
              title="Apply Compression"
            >
              <span className="text-xl">✓</span>
            </button>
            <button
              onClick={() => setActiveTool(null)}
              className="w-14 h-14 rounded-2xl bg-red-500/80 border border-white/20 hover:bg-red-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-xl shadow-red-500/20"
              title="Cancel"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-screen bg-background text-white overflow-hidden">
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        type={authType}
        onAuthSuccess={(userData) => setUser(userData)}
      />
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
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-xs text-secondary">Logged in as</span>
                <span className="text-sm font-medium text-white">{user.email}</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('proimageedit_token');
                  setUser(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
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
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-black/20 to-black/40 relative overflow-auto">
              <div className={`flex items-center justify-center gap-8 w-full max-w-5xl ${activeTool === 'compress' && compressParams.showComparison ? 'flex-col lg:flex-row' : 'flex-col'}`}>

                {/* Main Editor / Original Side */}
                <div className={`flex flex-col gap-2 min-w-0 transition-all duration-300 ${activeTool === 'compress' && compressParams.showComparison ? 'flex-1 invisible md:visible h-0 md:h-auto' : 'w-full'}`}>
                  {activeTool === 'compress' && compressParams.showComparison && (
                    <span className="text-[10px] uppercase tracking-widest text-secondary font-bold px-2 animate-fade-in">Original (Lossless)</span>
                  )}
                  <div className={`relative border border-white/10 rounded-lg overflow-hidden bg-black/40 shadow-2xl w-fit mx-auto`}>
                    <EditorCanvas
                      activeTool={activeTool === 'compress' && compressParams.showComparison ? null : activeTool}
                      forwardedRef={canvasRef}
                      cropBox={cropBox}
                      setCropBox={setCropBox}
                    />
                  </div>
                </div>

                {/* Compressed Preview Side */}
                {activeTool === 'compress' && compressParams.showComparison && (
                  <div className="flex flex-col gap-2 flex-1 min-w-0 animate-fade-in">
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold px-2 flex justify-between">
                      <span>Compressed Preview</span>
                      <span className="flex gap-2">
                        <span>Quality: {compressParams.quality}%</span>
                        <span className="text-secondary/40">|</span>
                        <span>{compressParams.format.split('/')[1].toUpperCase()}</span>
                      </span>
                    </span>
                    <div className="relative border border-primary/20 rounded-lg overflow-hidden bg-black/40 shadow-2xl min-h-[100px] flex items-center justify-center">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Compressed Preview"
                          className="block object-contain max-w-full max-h-[50vh] mx-auto"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-12">
                          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                          <span className="text-xs text-secondary/60">Generating preview...</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-primary/20 backdrop-blur rounded text-[9px] text-primary border border-primary/20 font-bold">
                        PREVIEW
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
