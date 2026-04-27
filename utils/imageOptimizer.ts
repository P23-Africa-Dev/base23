/**
 * Image Optimizer Utility
 *
 * Optimizes images to meet a target file size while maintaining quality.
 * Supports images between 5MB and 20MB for optimization.
 */

// Configuration constants
const CONFIG = {
    MAX_OPTIMIZABLE_SIZE_MB: 20,
    MIN_DIMENSION: 100,
    OUTPUT_FORMAT: 'image/jpeg',
    INITIAL_QUALITY: 0.92,
    MIN_QUALITY: 0.1,
    QUALITY_STEP: 0.05,
    DIMENSION_SCALE_FACTOR: 0.9,
    // Aggressive optimization thresholds
    AGGRESSIVE_SIZE_THRESHOLD_MB: 15,
    AGGRESSIVE_INITIAL_QUALITY: 0.8,
    AGGRESSIVE_DIMENSION_SCALE: 0.7,
} as const;

/**
 * Custom error class for image optimization failures
 */
export class ImageOptimizationError extends Error {
    constructor(
        message: string,
        public readonly code: 'INVALID_INPUT' | 'TOO_LARGE' | 'OPTIMIZATION_FAILED' | 'CANVAS_ERROR',
    ) {
        super(message);
        this.name = 'ImageOptimizationError';
    }
}

/**
 * Converts megabytes to bytes
 */
const mbToBytes = (mb: number): number => mb * 1024 * 1024;

/**
 * Converts bytes to megabytes (rounded to 2 decimal places)
 */
const bytesToMb = (bytes: number): string => (bytes / (1024 * 1024)).toFixed(2);

/**
 * Loads an image file and returns an HTMLImageElement
 */
const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new ImageOptimizationError('Failed to load image', 'INVALID_INPUT'));
            image.src = reader.result as string;
        };

        reader.onerror = () => reject(new ImageOptimizationError('Failed to read file', 'INVALID_INPUT'));
        reader.readAsDataURL(file);
    });
};

/**
 * Exports an image from canvas to a Blob
 */
const exportToBlob = (img: HTMLImageElement, width: number, height: number, quality: number, format: string): Blob => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new ImageOptimizationError('Failed to get canvas context', 'CANVAS_ERROR');
    }

    // Enable image smoothing for better quality when downscaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(img, 0, 0, width, height);

    const dataUrl = canvas.toDataURL(format, quality);
    const byteString = atob(dataUrl.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([uint8Array], { type: format });
};

/**
 * Generates the output filename with .jpg extension
 */
const generateOutputFilename = (originalName: string): string => {
    return originalName.replace(/\.(png|jpg|jpeg|gif|webp|bmp)$/i, '.jpg');
};

/**
 * Optimizes an image file to meet the target maximum size.
 *
 * @param file - The image file to optimize
 * @param maxSizeMB - Target maximum size in megabytes (default: 5)
 * @returns Promise<File> - The optimized image file
 * @throws ImageOptimizationError - If the image cannot be optimized
 *
 * @example
 * ```typescript
 * try {
 *   const optimizedFile = await optimizeImageToMaxSize(file, 5);
 *   console.log('Optimized!', optimizedFile.size);
 * } catch (error) {
 *   if (error instanceof ImageOptimizationError) {
 *     console.error(error.code, error.message);
 *   }
 * }
 * ```
 */
export async function optimizeImageToMaxSize(file: File, maxSizeMB = 5): Promise<File> {
    // Input validation
    if (!(file instanceof File)) {
        throw new ImageOptimizationError('Input must be a File', 'INVALID_INPUT');
    }

    if (!file.type.startsWith('image/')) {
        throw new ImageOptimizationError('File must be an image', 'INVALID_INPUT');
    }

    const targetSizeBytes = mbToBytes(maxSizeMB);
    const maxOptimizableSizeBytes = mbToBytes(CONFIG.MAX_OPTIMIZABLE_SIZE_MB);

    // Check if file is already within target size
    if (file.size <= targetSizeBytes) {
        return file;
    }

    // Reject files larger than 20MB
    if (file.size > maxOptimizableSizeBytes) {
        throw new ImageOptimizationError(
            `Image is too large (${bytesToMb(file.size)}MB). Maximum allowed size for optimization is ${CONFIG.MAX_OPTIMIZABLE_SIZE_MB}MB. Please select a smaller image.`,
            'TOO_LARGE',
        );
    }

    // Load the image
    const img = await loadImage(file);

    // Determine optimization strategy based on file size
    const isLargeFile = file.size > mbToBytes(CONFIG.AGGRESSIVE_SIZE_THRESHOLD_MB);

    let width = img.width;
    let height = img.height;
    let quality: number = isLargeFile ? CONFIG.AGGRESSIVE_INITIAL_QUALITY : CONFIG.INITIAL_QUALITY;
    let blob: Blob | null = null;
    let previousSize = file.size;

    // For very large files (15-20MB), start with aggressive dimension reduction
    if (isLargeFile) {
        width = Math.round(width * CONFIG.AGGRESSIVE_DIMENSION_SCALE);
        height = Math.round(height * CONFIG.AGGRESSIVE_DIMENSION_SCALE);
    }

    // Phase 1: Reduce quality while maintaining dimensions
    while (quality >= CONFIG.MIN_QUALITY) {
        blob = exportToBlob(img, width, height, quality, CONFIG.OUTPUT_FORMAT);

        if (blob.size <= targetSizeBytes) {
            break;
        }

        // If size isn't decreasing, move to dimension reduction
        if (blob.size >= previousSize && quality < CONFIG.INITIAL_QUALITY) {
            break;
        }

        previousSize = blob.size;
        quality -= CONFIG.QUALITY_STEP;
    }

    // Phase 2: Reduce dimensions if quality reduction wasn't enough
    while (blob && blob.size > targetSizeBytes) {
        // Stop if dimensions are too small
        if (width <= CONFIG.MIN_DIMENSION || height <= CONFIG.MIN_DIMENSION) {
            break;
        }

        width = Math.round(width * CONFIG.DIMENSION_SCALE_FACTOR);
        height = Math.round(height * CONFIG.DIMENSION_SCALE_FACTOR);

        // Reset quality slightly for each dimension reduction pass
        quality = Math.max(quality, 0.5);

        blob = exportToBlob(img, width, height, quality, CONFIG.OUTPUT_FORMAT);

        // Additional quality reduction at new dimensions if needed
        while (blob.size > targetSizeBytes && quality > CONFIG.MIN_QUALITY) {
            quality -= CONFIG.QUALITY_STEP;
            blob = exportToBlob(img, width, height, quality, CONFIG.OUTPUT_FORMAT);
        }
    }

    // Final validation
    if (!blob || blob.size > targetSizeBytes) {
        throw new ImageOptimizationError(
            `Unable to optimize image to ${maxSizeMB}MB. The image may be too complex. Try cropping or using a different image.`,
            'OPTIMIZATION_FAILED',
        );
    }

    // Create and return the optimized file
    return new File([blob], generateOutputFilename(file.name), { type: CONFIG.OUTPUT_FORMAT });
}

/**
 * Validates if a file can be optimized without actually optimizing it.
 * Useful for pre-validation before upload.
 *
 * @param file - The file to validate
 * @param maxSizeMB - Target maximum size in megabytes
 * @returns Object containing validation result and any error message
 */
export function validateImageForOptimization(file: File, maxSizeMB = 5): { isValid: boolean; needsOptimization: boolean; error?: string } {
    if (!(file instanceof File)) {
        return { isValid: false, needsOptimization: false, error: 'Input must be a File' };
    }

    if (!file.type.startsWith('image/')) {
        return { isValid: false, needsOptimization: false, error: 'File must be an image' };
    }

    const targetSizeBytes = mbToBytes(maxSizeMB);
    const maxOptimizableSizeBytes = mbToBytes(CONFIG.MAX_OPTIMIZABLE_SIZE_MB);

    if (file.size > maxOptimizableSizeBytes) {
        return {
            isValid: false,
            needsOptimization: true,
            error: `Image is too large (${bytesToMb(file.size)}MB). Maximum allowed size is ${CONFIG.MAX_OPTIMIZABLE_SIZE_MB}MB.`,
        };
    }

    if (file.size > targetSizeBytes) {
        return { isValid: true, needsOptimization: true };
    }

    return { isValid: true, needsOptimization: false };
}
