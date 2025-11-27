'use client';

import { useState, useCallback, useRef } from 'react';
import FileUpload from './FileUpload';
import { validateFileSize, validateFileType, downloadFile, createFileFromBlob } from '@/lib/utils';
import { Download, Eraser, Image as ImageIcon } from 'lucide-react';

export default function RemoveWatermark() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [processedImage, setProcessedImage] = useState<File | null>(null);
    const [brushSize, setBrushSize] = useState(20);
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [markedAreas, setMarkedAreas] = useState<ImageData | null>(null);

    const handleFileSelected = useCallback((selectedFiles: File[]) => {
        const selectedFile = selectedFiles[0];
        if (selectedFile && validateFileSize(selectedFile) && validateFileType(selectedFile, ['image/jpeg', 'image/png', 'image/webp'])) {
            setFile(selectedFile);
            setProcessedImage(null);
            setMarkedAreas(null);

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            ctx.drawImage(img, 0, 0);
                        }
                    }
                };
                img.src = e.target?.result as string;
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing && e.type !== 'mousedown') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
    };

    const handleRemove = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas || !file) return;

        setProcessing(true);

        try {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Get the image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Simple inpainting: replace red-marked areas with surrounding pixel average
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                // Check if pixel has red overlay (marked for removal)
                if (r > 200 && g < 100 && b < 100 && a > 0) {
                    // Sample surrounding pixels for inpainting
                    const x = (i / 4) % canvas.width;
                    const y = Math.floor((i / 4) / canvas.width);
                    
                    let sumR = 0, sumG = 0, sumB = 0, count = 0;
                    
                    // Sample 8 surrounding pixels
                    for (let dy = -brushSize; dy <= brushSize; dy += brushSize) {
                        for (let dx = -brushSize; dx <= brushSize; dx += brushSize) {
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                                const idx = (ny * canvas.width + nx) * 4;
                                const nr = data[idx];
                                const ng = data[idx + 1];
                                const nb = data[idx + 2];
                                
                                // Only sample non-marked pixels
                                if (!(nr > 200 && ng < 100 && nb < 100)) {
                                    sumR += nr;
                                    sumG += ng;
                                    sumB += nb;
                                    count++;
                                }
                            }
                        }
                    }

                    if (count > 0) {
                        data[i] = sumR / count;
                        data[i + 1] = sumG / count;
                        data[i + 2] = sumB / count;
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    const processedFile = createFileFromBlob(
                        blob,
                        `watermark_removed_${file.name}`,
                        file.type
                    );
                    setProcessedImage(processedFile);
                }
                setProcessing(false);
            }, file.type);

        } catch (error) {
            console.error('Watermark removal failed:', error);
            setProcessing(false);
        }
    }, [file, brushSize]);

    const handleDownload = useCallback(() => {
        if (processedImage) {
            downloadFile(processedImage);
        }
    }, [processedImage]);

    const handleReset = useCallback(() => {
        if (preview && canvasRef.current) {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);
                    }
                }
            };
            img.src = preview;
        }
        setProcessedImage(null);
    }, [preview]);

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>How to use:</strong> Upload an image, then use your mouse to mark the watermark areas you want to remove. 
                    Adjust the brush size, then click "Remove Watermark" to process.
                </p>
            </div>

            <FileUpload
                onFilesSelected={handleFileSelected}
                accept=".jpg,.jpeg,.png,.webp"
                multiple={false}
                label="Select an image with watermark"
            />

            {file && preview && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brush Size: {brushSize}px
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="50"
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            className="max-w-full h-auto cursor-crosshair"
                            style={{ display: 'block', margin: '0 auto' }}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleRemove}
                            disabled={processing}
                            className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {processing ? 'Processing...' : 'Remove Watermark'}
                        </button>
                    </div>
                </div>
            )}

            {processedImage && !processing && (
                <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <ImageIcon className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">Watermark Removed!</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Your image has been processed. Download to save the result.
                            </p>
                            <button
                                onClick={handleDownload}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Download Image
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
