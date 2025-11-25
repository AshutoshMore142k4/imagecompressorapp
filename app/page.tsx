'use client';

import { useState, useCallback, lazy, Suspense } from 'react';
import {
  FileImage,
  FileText,
  Minimize2,
  RefreshCw,
  Shield,
  Zap
} from 'lucide-react';
import FeatureCard from '@/components/FeatureCard';
import Modal from '@/components/Modal';

const ImageCompressor = lazy(() => import('@/components/ImageCompressor'));
const PDFToImage = lazy(() => import('@/components/PDFToImage'));
const ImageToPDF = lazy(() => import('@/components/ImageToPDF'));
const PDFCompressor = lazy(() => import('@/components/PDFCompressor'));
const FormatConverter = lazy(() => import('@/components/FormatConverter'));

type FeatureType = 'compress-image' | 'pdf-to-jpg' | 'jpg-to-pdf' | 'compress-pdf' | 'convert-format' | null;

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
      title: 'Image Compression',
      description: 'Compress JPG, PNG, and WebP images with adjustable quality. Reduce file size up to 90% while maintaining visual quality.',
      component: ImageCompressor,
    },
    {
      id: 'pdf-to-jpg' as const,
      icon: FileImage,
      title: 'PDF to JPG',
      description: 'Convert PDF pages to high-quality JPG images. Select DPI and download individual pages or as a ZIP file.',
      component: PDFToImage,
    },
    {
      id: 'jpg-to-pdf' as const,
      icon: FileText,
      title: 'JPG to PDF',
      description: 'Combine multiple images into a single PDF. Customize page size, orientation, and image positioning.',
      component: ImageToPDF,
    },
    {
      id: 'compress-pdf' as const,
      icon: Minimize2,
      title: 'PDF Compression',
      description: 'Reduce PDF file size with three compression levels. Preserve quality while saving storage space.',
      component: PDFCompressor,
    },
    {
      id: 'convert-format' as const,
      icon: RefreshCw,
      title: 'Image Format Converter',
      description: 'Convert between JPG, PNG, WebP, and AVIF formats. Preserve transparency and adjust quality settings.',
      component: FormatConverter,
    },
  ];

  const activeFeatureData = features.find((f) => f.id === activeFeature);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="glass sticky top-0 z-40 shadow-lg backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg hover:scale-105 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                QuickConvert
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">All processing happens locally</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Fast & Free PDF and Image Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Compress, convert, and manipulate your files instantly. All processing happens in your browser -
            no uploads, completely private and secure.
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="max-w-2xl mx-auto mb-16 glass rounded-xl p-5 flex items-start gap-3 shadow-lg animate-slide-up">
          <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-green-800 mb-1">🔒 100% Private & Secure</p>
            <p className="text-sm text-green-700 leading-relaxed">
              All files are processed directly in your browser. Nothing is uploaded to our servers.
              Your data never leaves your device.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              style={{ animationDelay: `${index * 100}ms` }}
              className="animate-fade-in"
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                onClick={() => openFeature(feature.id)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">
              © {new Date().getFullYear()} QuickConvert. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
              Built with Next.js • All processing happens client-side • No data collection
            </p>
          </div>
        </div>
      </footer>

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
    </main>
  );
}
