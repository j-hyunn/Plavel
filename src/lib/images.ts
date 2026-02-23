/**
 * Processes an image file: reads it as data URL and resizes it using Canvas.
 * Returns a Promise that resolves to a compressed JPEG data URL.
 */
export function processImageFile(file: File, maxDimension: number = 800, quality: number = 0.6): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('File reading failed'));
        reader.onloadend = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('Image loading failed'));
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                if (width > height && width > maxDimension) {
                    height *= maxDimension / width;
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width *= maxDimension / height;
                    height = maxDimension;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context failed'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    });
}
