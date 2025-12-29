/**
 * NGRAPHICS - Image Processing Web Worker
 * Offloads heavy image operations from main thread
 */

// ============================================
// MESSAGE HANDLER
// ============================================
self.onmessage = async function(e) {
    const { id, action, data } = e.data;

    try {
        let result;

        switch (action) {
            case 'compress':
                result = await compressImage(data);
                break;

            case 'thumbnail':
                result = await createThumbnail(data);
                break;

            case 'analyze':
                result = await analyzeImage(data);
                break;

            case 'enhance':
                result = await enhanceImage(data);
                break;

            case 'resize':
                result = await resizeImage(data);
                break;

            case 'crop':
                result = await cropImage(data);
                break;

            case 'batch':
                result = await processBatch(data);
                break;

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        self.postMessage({ id, success: true, result });
    } catch (error) {
        self.postMessage({ id, success: false, error: error.message });
    }
};

// ============================================
// IMAGE COMPRESSION
// ============================================
async function compressImage({ imageData, options = {} }) {
    const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 0.85,
        format = 'image/webp'
    } = options;

    // Convert base64/blob to ImageBitmap
    let bitmap;
    if (typeof imageData === 'string') {
        const response = await fetch(imageData);
        const blob = await response.blob();
        bitmap = await createImageBitmap(blob);
    } else {
        bitmap = await createImageBitmap(imageData);
    }

    // Calculate dimensions
    let { width, height } = bitmap;
    const originalWidth = width;
    const originalHeight = height;

    if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
    }

    if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
    }

    width = Math.round(width);
    height = Math.round(height);

    // Create canvas and draw
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Use high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);

    // Convert to blob
    let blob;
    try {
        blob = await canvas.convertToBlob({ type: format, quality });
    } catch (e) {
        // Fallback to JPEG
        blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
    }

    // Convert to base64
    const base64 = await blobToBase64(blob);

    bitmap.close();

    return {
        base64,
        width,
        height,
        originalWidth,
        originalHeight,
        size: blob.size,
        format: blob.type
    };
}

// ============================================
// THUMBNAIL CREATION
// ============================================
async function createThumbnail({ imageData, size = 150 }) {
    return compressImage({
        imageData,
        options: {
            maxWidth: size,
            maxHeight: size,
            quality: 0.7,
            format: 'image/webp'
        }
    });
}

// ============================================
// IMAGE ANALYSIS
// ============================================
async function analyzeImage({ imageData }) {
    let bitmap;
    if (typeof imageData === 'string') {
        const response = await fetch(imageData);
        const blob = await response.blob();
        bitmap = await createImageBitmap(blob);
    } else {
        bitmap = await createImageBitmap(imageData);
    }

    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);

    const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageDataObj.data;

    // Calculate statistics
    let totalR = 0, totalG = 0, totalB = 0;
    let minBrightness = 255, maxBrightness = 0;
    const colorCounts = {};

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        totalR += r;
        totalG += g;
        totalB += b;

        const brightness = (r + g + b) / 3;
        minBrightness = Math.min(minBrightness, brightness);
        maxBrightness = Math.max(maxBrightness, brightness);

        // Quantize color for dominant color detection
        const quantizedColor = `${Math.round(r / 32) * 32},${Math.round(g / 32) * 32},${Math.round(b / 32) * 32}`;
        colorCounts[quantizedColor] = (colorCounts[quantizedColor] || 0) + 1;
    }

    const pixelCount = pixels.length / 4;
    const avgR = Math.round(totalR / pixelCount);
    const avgG = Math.round(totalG / pixelCount);
    const avgB = Math.round(totalB / pixelCount);

    // Find dominant colors
    const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([color, count]) => {
            const [r, g, b] = color.split(',').map(Number);
            return {
                rgb: { r, g, b },
                hex: rgbToHex(r, g, b),
                percentage: ((count / pixelCount) * 100).toFixed(1)
            };
        });

    bitmap.close();

    return {
        width: canvas.width,
        height: canvas.height,
        aspectRatio: (canvas.width / canvas.height).toFixed(2),
        averageColor: {
            rgb: { r: avgR, g: avgG, b: avgB },
            hex: rgbToHex(avgR, avgG, avgB)
        },
        brightness: {
            min: Math.round(minBrightness),
            max: Math.round(maxBrightness),
            average: Math.round((totalR + totalG + totalB) / (pixelCount * 3))
        },
        dominantColors: sortedColors,
        isLowContrast: (maxBrightness - minBrightness) < 50,
        isDark: (totalR + totalG + totalB) / (pixelCount * 3) < 128
    };
}

// ============================================
// IMAGE ENHANCEMENT
// ============================================
async function enhanceImage({ imageData, options = {} }) {
    const {
        contrast = 1.1,
        brightness = 1.0,
        saturation = 1.1,
        autoLevels = true
    } = options;

    let bitmap;
    if (typeof imageData === 'string') {
        const response = await fetch(imageData);
        const blob = await response.blob();
        bitmap = await createImageBitmap(blob);
    } else {
        bitmap = await createImageBitmap(imageData);
    }

    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);

    const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageDataObj.data;

    // Auto levels - find actual min/max
    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;

    if (autoLevels) {
        for (let i = 0; i < pixels.length; i += 4) {
            minR = Math.min(minR, pixels[i]);
            maxR = Math.max(maxR, pixels[i]);
            minG = Math.min(minG, pixels[i + 1]);
            maxG = Math.max(maxG, pixels[i + 1]);
            minB = Math.min(minB, pixels[i + 2]);
            maxB = Math.max(maxB, pixels[i + 2]);
        }
    }

    // Apply enhancements
    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];

        // Auto levels
        if (autoLevels) {
            r = ((r - minR) / (maxR - minR || 1)) * 255;
            g = ((g - minG) / (maxG - minG || 1)) * 255;
            b = ((b - minB) / (maxB - minB || 1)) * 255;
        }

        // Brightness
        r *= brightness;
        g *= brightness;
        b *= brightness;

        // Contrast
        r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
        g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
        b = ((b / 255 - 0.5) * contrast + 0.5) * 255;

        // Saturation
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + saturation * (r - gray);
        g = gray + saturation * (g - gray);
        b = gray + saturation * (b - gray);

        // Clamp values
        pixels[i] = Math.max(0, Math.min(255, Math.round(r)));
        pixels[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
        pixels[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }

    ctx.putImageData(imageDataObj, 0, 0);

    const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.9 });
    const base64 = await blobToBase64(blob);

    bitmap.close();

    return {
        base64,
        width: canvas.width,
        height: canvas.height
    };
}

// ============================================
// RESIZE IMAGE
// ============================================
async function resizeImage({ imageData, width, height, fit = 'contain' }) {
    let bitmap;
    if (typeof imageData === 'string') {
        const response = await fetch(imageData);
        const blob = await response.blob();
        bitmap = await createImageBitmap(blob);
    } else {
        bitmap = await createImageBitmap(imageData);
    }

    let destWidth = width;
    let destHeight = height;
    let srcX = 0, srcY = 0;
    let srcWidth = bitmap.width;
    let srcHeight = bitmap.height;

    if (fit === 'contain') {
        const scale = Math.min(width / bitmap.width, height / bitmap.height);
        destWidth = Math.round(bitmap.width * scale);
        destHeight = Math.round(bitmap.height * scale);
    } else if (fit === 'cover') {
        const scale = Math.max(width / bitmap.width, height / bitmap.height);
        srcWidth = width / scale;
        srcHeight = height / scale;
        srcX = (bitmap.width - srcWidth) / 2;
        srcY = (bitmap.height - srcHeight) / 2;
    }

    const canvas = new OffscreenCanvas(fit === 'contain' ? destWidth : width, fit === 'contain' ? destHeight : height);
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (fit === 'cover') {
        ctx.drawImage(bitmap, srcX, srcY, srcWidth, srcHeight, 0, 0, width, height);
    } else {
        ctx.drawImage(bitmap, 0, 0, destWidth, destHeight);
    }

    const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.9 });
    const base64 = await blobToBase64(blob);

    bitmap.close();

    return {
        base64,
        width: canvas.width,
        height: canvas.height
    };
}

// ============================================
// CROP IMAGE
// ============================================
async function cropImage({ imageData, x, y, width, height }) {
    let bitmap;
    if (typeof imageData === 'string') {
        const response = await fetch(imageData);
        const blob = await response.blob();
        bitmap = await createImageBitmap(blob);
    } else {
        bitmap = await createImageBitmap(imageData);
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(bitmap, x, y, width, height, 0, 0, width, height);

    const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.9 });
    const base64 = await blobToBase64(blob);

    bitmap.close();

    return {
        base64,
        width,
        height
    };
}

// ============================================
// BATCH PROCESSING
// ============================================
async function processBatch({ images, action, options = {} }) {
    const results = [];

    for (let i = 0; i < images.length; i++) {
        try {
            let result;

            switch (action) {
                case 'compress':
                    result = await compressImage({ imageData: images[i], options });
                    break;
                case 'thumbnail':
                    result = await createThumbnail({ imageData: images[i], ...options });
                    break;
                case 'enhance':
                    result = await enhanceImage({ imageData: images[i], options });
                    break;
                default:
                    throw new Error(`Unknown batch action: ${action}`);
            }

            results.push({ index: i, success: true, result });

            // Report progress
            self.postMessage({
                type: 'progress',
                current: i + 1,
                total: images.length
            });
        } catch (error) {
            results.push({ index: i, success: false, error: error.message });
        }
    }

    return results;
}

// ============================================
// UTILITIES
// ============================================
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}
