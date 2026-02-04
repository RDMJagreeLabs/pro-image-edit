export const imageProcessor = {
    grayscale: (ctx, width, height) => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
        }
        ctx.putImageData(imageData, 0, 0);
    },

    sepia: (ctx, width, height) => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
            data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
            data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
        }
        ctx.putImageData(imageData, 0, 0);
    },

    invert: (ctx, width, height) => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];     // red
            data[i + 1] = 255 - data[i + 1]; // green
            data[i + 2] = 255 - data[i + 2]; // blue
        }
        ctx.putImageData(imageData, 0, 0);
    },

    // Simple brightness adjustment (not perfect, but works for demo)
    brightness: (ctx, width, height, adjustment = 20) => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] += adjustment;
            data[i + 1] += adjustment;
            data[i + 2] += adjustment;
        }
        ctx.putImageData(imageData, 0, 0);
    },

    contrast: (ctx, width, height, adjustment = 20) => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const factor = (259 * (adjustment + 255)) / (255 * (259 - adjustment));
        for (let i = 0; i < data.length; i += 4) {
            data[i] = factor * (data[i] - 128) + 128;
            data[i + 1] = factor * (data[i + 1] - 128) + 128;
            data[i + 2] = factor * (data[i + 2] - 128) + 128;
        }
        ctx.putImageData(imageData, 0, 0);
    }
};
