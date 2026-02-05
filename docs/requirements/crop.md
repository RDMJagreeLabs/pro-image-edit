# Requirements: Crop Feature

## Overview
The Crop Feature allows users to select a specific rectangular area of an image and remove the surrounding parts. This is a fundamental feature for any image editor.

## Functional Requirements

### 1. Selection Tool
- Users must be able to define a crop area by dragging their cursor/finger over the image.
- The crop area should be represented by a semi-transparent overlay with a clear "cutout" for the selected area.
- Selection handles should be available at the corners and edges of the crop box for resizing.

### 2. Aspect Ratio Presets
- The tool should provide common aspect ratio presets:
    - **Free**: No restrictions on dimensions.
    - **Square (1:1)**: Locks width and height to be equal.
    - **4:3**: Standard photo aspect ratio.
    - **16:9**: Widescreen aspect ratio.
- Selecting a preset should immediately adjust the crop box to that ratio.

### 3. Transformation Actions
- **Move**: Users can drag the entire crop box to a different position.
- **Resize**: Users can drag handles to change the size while maintaining (or not) the aspect ratio.

### 4. Control Buttons
- **Apply / Crop**: Finalizes the crop and updates the canvas with the new image dimensions.
- **Cancel / Reset**: Discards the current selection and returns to the previous state.

### 5. Preview
- A real-time preview of what the cropped image will look like should be visible (e.g., by dimming the excluded areas).

## Non-Functional Requirements

### 1. Performance
- The selection overlay and resizing should be smooth (target 60fps).
- The actual cropping operation should be fast and not freeze the UI.

### 2. Accessibility
- All buttons and presets should be keyboard accessible.
- ARIA labels should be provided for the crop handles and controls.

### 3. Responsiveness
- The crop tool must work on both desktop (mouse) and mobile (touch) devices.
- Handles should be large enough to be easily draggable on touch screens.

## Technical Implementation Notes
- Use `<canvas>` for rendering the selection overlay.
- Maintain a "source" image and a "display" version to allow for non-destructive previewing if possible.
- The `EditorCanvas` component should handle the coordinates and the final crop execution.
