# QuickConvert

A high-performance, privacy-focused web application for PDF and image manipulation. All file processing happens client-side in your browser - no uploads, completely secure.

## Features

- **Image Compression** - Compress JPG, PNG, WebP with adjustable quality (10-100%)
- **PDF to JPG** - Convert PDF pages to individual JPG images with DPI selection
- **JPG to PDF** - Combine multiple images into a single PDF with customization
- **PDF Compression** - Reduce PDF file size with three compression levels
- **Image Format Converter** - Convert between JPG, PNG, WebP, and AVIF

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Libraries**: 
  - browser-image-compression (image processing)
  - pdf-lib (PDF manipulation)
  - jszip (file compression)
  - lucide-react (icons)

## Performance

- ✅ Lighthouse score 95+ on all metrics
- ✅ JavaScript bundle under 200KB
- ✅ Client-side processing (no server costs)
- ✅ Code splitting and lazy loading
- ✅ Web Workers for heavy operations

## Privacy

All file operations are performed entirely in your browser using Web APIs. No files are ever uploaded to any server. Your data never leaves your device.

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

## Deployment

Optimized for Vercel deployment:

```bash
vercel
```

## Project Structure

```
/app              - Next.js App Router pages
/components       - Reusable UI components
/lib              - Utility functions and file processing
/types            - TypeScript type definitions
/public           - Static assets
```

## License

MIT License - feel free to use this project for your own purposes.
