# 🎨 See Color App

A privacy-first web application that teaches photographers to identify and correct color casts in their images using professional OKLab color space analysis.

## ✨ Features

- **🔒 Privacy-First**: All processing happens in your browser - no data leaves your device
- **🎯 OKLab Color Analysis**: Professional-grade color space analysis
- **👤 Skin Tone Detection**: Automatic face/skin region detection
- **📊 Specific Recommendations**: Exact slider adjustments for Lightroom, Photoshop, Capture One
- **🖱️ Interactive Learning**: Click to analyze specific points
- **👁️ Visual Feedback**: See color casts and healthy skin tones
- **📱 Responsive Design**: Works on desktop and mobile

## 🚀 Quick Start

### Option 1: Live Demo
Visit the deployed app: [See Color App](https://your-deployment-url.com)

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/see-color-app.git
cd see-color-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Option 3: Production Build
```bash
# Build for production
npm run build

# Serve the built files
npm run preview
```

## 📸 How to Use

1. **Upload an Image**: Drag and drop or click to upload a JPG/PNG image
2. **Analyze Color Cast**: Click "Analyze Color Cast" to detect color issues
3. **Check Specific Points**: Click anywhere on the image to analyze that point
4. **View Results**: See detailed OKLab measurements and recommendations
5. **Preview Corrections**: Use "Healthy Skin" and "Color Cast" preview buttons

## 🛠️ Technical Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Canvas API** for image processing
- **OKLab Color Space** for professional color analysis

## 🎯 Color Analysis Features

### OKLab Measurements
- **L (Lightness)**: 0-1 scale
- **a (Green-Magenta)**: Negative = Green, Positive = Magenta
- **b (Blue-Yellow)**: Negative = Blue, Positive = Yellow

### Skin Detection
- **MediaPipe Integration**: Advanced face landmark detection
- **Fallback Detection**: Color-based skin tone analysis
- **Healthy Skin Ranges**: Optimized for natural skin tones

### Software Integration
- **Adobe Lightroom**: White Balance, HSL, Color Grading
- **Adobe Photoshop**: Color Balance, Hue/Saturation, Camera Raw
- **Capture One**: White Balance, Color Editor, Skin Tone tool

## 🔧 Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure
```
src/
├── components/       # React components
├── lib/             # Core logic and utilities
├── store/           # State management
├── pages/           # Main app pages
└── main.tsx         # App entry point
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Deploy automatically on every push
3. Zero configuration needed

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### GitHub Pages
1. Enable GitHub Pages in repository settings
2. Set source to GitHub Actions
3. Use the provided workflow

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OKLab Color Space**: Björn Ottosson's perceptually uniform color space
- **MediaPipe**: Google's machine learning framework for face detection
- **React Community**: For excellent tooling and ecosystem

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub.

---

**Made with ❤️ for photographers who want to master color correction**