# Requirements: Advanced Filters & Adjustments

## Overview
Enhance the current basic filters with more granular controls and professional-grade effects.

## Functional Requirements

### 1. Granular Adjustment Sliders
Instead of simple toggle buttons, provide sliders for:
- **Brightness** (-100 to 100)
- **Contrast** (-100 to 100)
- **Saturation** (0 to 200%)
- **Hue Rotation** (0 to 360°)
- **Exposure**
- **Sharpness / Blur**

### 2. Professional Filters
- **Vignette**: Darken corners.
- **Gaussian Blur**: Smooth details.
- **Sharpen**: Enhance edges.
- **Color Grading Presets**: "Vintage", "Noir", "Natural", "Dramatic".

### 3. Layering (Optional)
- Ability to stack multiple filters and adjust their individual opacity.

## Technical Implementation Notes
- Use CSS Filters on the canvas/image element for real-time preview (performant).
- Bake the filters into the canvas using pixel manipulation (`getImageData`/`putImageData`) for the final result.
- Consider utilizing WebGL for complex filters to maintain high performance.
