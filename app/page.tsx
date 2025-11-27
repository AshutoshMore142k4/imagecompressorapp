'use client';

import { useState, useCallback, lazy, Suspense } from 'react';
import {
  FileImage,
  FileText,
  Minimize2,
  RefreshCw,
  Shield,
  Zap,
  Merge,
  Scissors,
  RotateCw,
  Eraser
} from 'lucide-react';
import { BeamsBackground } from '@/components/ui/beams-background';
import FeatureCard from '@/components/FeatureCard';
import Modal from '@/components/Modal';

const ImageCompressor = lazy(() => import('@/components/ImageCompressor'));
const PDFToImage = lazy(() => import('@/components/PDFToImage'));
const ImageToPDF = lazy(() => import('@/components/ImageToPDF'));
const PDFCompressor = lazy(() => import('@/components/PDFCompressor'));
const FormatConverter = lazy(() => import('@/components/FormatConverter'));
const MergePDF = lazy(() => import('@/components/MergePDF'));
const SplitPDF = lazy(() => import('@/components/SplitPDF'));
const RotatePDF = lazy(() => import('@/components/RotatePDF'));
const RemoveWatermark = lazy(() => import('@/components/RemoveWatermark'));

type FeatureType = 'compress-image' | 'pdf-to-jpg' | 'jpg-to-pdf' | 'compress-pdf' | 'convert-format' | 'merge-pdf' | 'split-pdf' | 'rotate-pdf' | 'remove-watermark' | null;

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<FeatureType>(null);

  const openFeature = useCallback((feature: FeatureType) => {
    setActiveFeature(feature);
  }, []);

  const closeFeature = useCallback(() => {
    setActiveFeature(null);
  }, []);

  const features = [
    {
      id: 'compress-image' as const,
      icon: Minimize2,
      title: 'Compress Image',
      description: 'Reduce image file size while maintaining quality. Supports JPG, PNG, and WebP formats.',
      component: ImageCompressor,
    },
    {
      id: 'compress-pdf' as const,
      icon: Minimize2,
      title: 'Compress PDF',
      description: 'Reduce PDF file size with three compression levels. Preserve quality while saving storage space.',
      component: PDFCompressor,
    },
    {
      id: 'merge-pdf' as const,
      icon: Merge,
      title: 'Merge PDF',
      description: 'Combine multiple PDF files into a single document. Arrange pages in any order you want.',
      component: MergePDF,
    },
    {
      id: 'split-pdf' as const,
      icon: Scissors,
      title: 'Split PDF',
      description: 'Extract pages from PDF files. Split all pages or select a specific range to extract.',
      component: SplitPDF,
    },
    {
      id: 'rotate-pdf' as const,
      icon: RotateCw,
      title: 'Rotate PDF',
      description: 'Rotate PDF pages by 90, 180, or 270 degrees. Fix page orientation easily.',
      component: RotatePDF,
    },
    {
      id: 'pdf-to-jpg' as const,
      icon: FileImage,
      title: 'PDF to JPG',
      description: 'Convert PDF pages to high-quality JPG images. Extract all pages or select specific ones.',
      component: PDFToImage,
    },
    {
      id: 'jpg-to-pdf' as const,
      icon: FileText,
      title: 'JPG to PDF',
      description: 'Combine multiple images into a single PDF. Customize page size and orientation.',
      component: ImageToPDF,
    },
    {
      id: 'convert-format' as const,
      icon: RefreshCw,
      title: 'Convert Image',
      description: 'Convert between JPG, PNG, WebP, and AVIF formats. Preserve transparency and quality.',
      component: FormatConverter,
    },
    {
      id: 'remove-watermark' as const,
      icon: Eraser,
      title: 'Remove Watermark',
      description: 'Remove watermarks from images. Mark the watermark areas and let AI clean them up.',
      component: RemoveWatermark,
    },
  ];

  const activeFeatureData = features.find((f) => f.id === activeFeature);

  return (
    <BeamsBackground intensity="subtle" className="min-h-screen!">
      <div className="absolute inset-0 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/20 border-b border-white/10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-medium">All processing happens locally</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10">
          {/* Title Section */}
          <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="flex flex-col items-center justify-center text-center mb-10 sm:mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight max-w-5xl">
                Fast & Free PDF and Image Tools
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/80 max-w-4xl leading-relaxed font-light">
                Compress, convert, and manipulate your files instantly.
                <br />
                All processing happens in your browser.
              </p>
            </div>

            {/* Features Grid */}
            <div className="flex justify-center w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-6xl w-full">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="animate-fade-in"
                >
                  <div 
                    onClick={() => openFeature(feature.id)}
                    className="group relative backdrop-blur-xl bg-white/5 hover:bg-white/10 rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer hover:scale-[1.02] shadow-xl hover:shadow-2xl"
                  >
                    <div className="flex flex-col items-center text-center gap-4 sm:gap-5">
                      <div className="relative p-4 sm:p-5 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl group-hover:scale-110 group-hover:bg-white/15 transition-all border border-white/20">
                        <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent rounded-2xl" />
                        <feature.icon className="relative w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-blue-300 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm lg:text-base text-white/70 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="backdrop-blur-xl bg-black/30 border-t border-white/10 mt-12 sm:mt-16 lg:mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
              <div className="text-center space-y-3 sm:space-y-4">
                <p className="text-white/70 text-sm sm:text-base font-medium">
                  © {new Date().getFullYear()} QuickConvert. All rights reserved.
                </p>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                  Built with Next.js • All processing happens client-side • No data collection
                </p>
              </div>
            </div>
          </footer>
        </main>

        {/* Feature Modal */}
        {activeFeatureData && (
          <Modal
            isOpen={!!activeFeature}
            onClose={closeFeature}
            title={activeFeatureData.title}
          >
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            }>
              <activeFeatureData.component />
            </Suspense>
          </Modal>
        )}
      </div>
    </BeamsBackground>
  );
}
