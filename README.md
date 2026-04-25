# FitMirror - AI-Powered Wardrobe Styling Platform

<p align="center">
  <strong>Your personal AI stylist that knows your wardrobe, your style, and the weather!</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.5-blue" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.0.9-purple" alt="Vite" />
  <img src="https://img.shields.io/badge/Three.js-Ready-green" alt="Three.js" />
  <img src="https://img.shields.io/badge/Gemini%20AI-Integrated-orange" alt="Gemini AI" />
</p>

---

## 🎯 Overview

FitMirror is an AI-powered personal styling platform that transforms how you manage your wardrobe and choose outfits. Upload photos of your clothing, and let Google Gemini AI analyze them to provide intelligent, personalized outfit recommendations based on your body measurements, style preferences, and real-time weather conditions.

---

## ✨ Features

### 🤖 AI-Powered Wardrobe
- **Multi-Image Upload**: Upload multiple clothing photos at once
- **Automatic Detection**: AI identifies type, color, texture, style, and occasions
- **Smart Categorization**: Items organized by category (upper, lower, jacket, shoes, accessories)
- **Unlimited Storage**: Powered by IndexedDB for hundreds of clothing items

### 🎨 Smart Avatar
- **3D Rotating Mannequin**: Professional avatar with 25+ body parts
- **2D Static View**: Clean, proportional body that updates with your measurements
- **Body Customization**: Adjust height, weight, shoulders, waist, and hips
- **Real-time Updates**: Avatar changes instantly as you modify proportions

### 🌤️ Weather-Aware Styling
- **Real-Time Weather**: Live weather data from OpenWeatherMap API
- **Location-Based**: Automatic geolocation for accurate forecasts
- **Daily Recommendations**: Outfit suggestions based on today's weather
- **Seasonal Intelligence**: AI considers seasonal appropriateness

### 🪞 Smart Mirror
- **Live Camera Feed**: See yourself in real-time
- **AI Outfit Analysis**: Get instant feedback on your outfit choices
- **Style Scoring**: Receive scores and improvement suggestions
- **Photo Capture**: Save and analyze outfit photos

### 🧳 Trip Packing Planner
- **Destination Weather**: Check weather for your travel destination
- **Smart Packing Lists**: AI suggests what to pack from YOUR wardrobe
- **Day-by-Day Planning**: Customize based on trip duration
- **Checklist Tracking**: Mark items as you pack them

### 🔐 Secure Access
- **OTP Authentication**: Email-based login with 6-digit verification
- **Session Persistence**: Stay logged in across browser sessions
- **Secure Logout**: Easy sign-out with session clearing

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19.2.5 + TypeScript |
| **Build Tool** | Vite 8.0.9 |
| **3D Rendering** | Three.js + React Three Fiber + Drei |
| **AI Engine** | Google Gemini 1.5 Flash |
| **Weather API** | OpenWeatherMap |
| **Storage** | IndexedDB (unlimited browser storage) |
| **Styling** | TailwindCSS 4.2.4 |
| **Animations** | Motion (Framer Motion) |
| **State Management** | React Context + useReducer |
| **Icons** | Lucide React |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.0.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FitMirror
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your API keys** (Edit `.env` file)
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```

   **Get API Keys:**
   - Gemini API: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - OpenWeather API: [https://openweathermap.org/api](https://openweathermap.org/api)

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

---

## 📖 Usage Guide

### 1. First Login
- Enter your email address
- Receive OTP (check console in demo mode)
- Enter 6-digit verification code
- Access granted!

### 2. Build Your Wardrobe
- Go to **Wardrobe** tab
- Click "Ingest Clothing" or drag & drop images
- Upload multiple photos at once
- AI automatically analyzes and categorizes each item

### 3. Set Your Profile
- Go to **Avatar** tab
- Adjust body measurements using sliders
- Choose 2D or 3D view
- Avatar updates in real-time

### 4. Get Daily Outfits
- Go to **Daily Sync** tab
- View weather-based recommendations
- See outfit combinations from your wardrobe
- Get AI explanations for each suggestion

### 5. Use Smart Mirror
- Go to **Mirror** tab
- Activate your camera
- Try on outfits in real-time
- Click "Analyze Outfit" for AI feedback

### 6. Plan Trips
- Go to **Suitcase** tab
- Set destination and trip duration
- Get AI-generated packing list from your wardrobe
- Check off items as you pack

---

## 📁 Project Structure

```
FitMirror/
├── src/
│   ├── components/
│   │   ├── auth/          # Login & authentication
│   │   ├── avatar/        # 2D & 3D avatar components
│   │   ├── layout/        # Sidebar & app shell
│   │   └── ui/            # Reusable UI components
│   ├── views/             # Main feature pages
│   │   ├── DashboardView.tsx
│   │   ├── WardrobeView.tsx
│   │   ├── AvatarView.tsx
│   │   ├── MirrorView.tsx
│   │   ├── SyncView.tsx
│   │   ├── SuitcaseView.tsx
│   │   └── AuraView.tsx
│   ├── lib/
│   │   ├── database.ts    # IndexedDB storage
│   │   ├── gemini.ts      # AI integration
│   │   ├── store.tsx      # State management
│   │   ├── types.ts       # TypeScript types
│   │   └── weather.ts     # Weather API
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── .env.example           # Environment template
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🎯 Key Features in Detail

### IndexedDB Storage
Unlike localStorage's 5MB limit, FitMirror uses IndexedDB for virtually unlimited storage (50MB-2GB+), allowing you to store hundreds of clothing images without worrying about space.

### Gemini AI Integration
- **Clothing Analysis**: Detects type, color, texture, style, occasions
- **Outfit Recommendations**: Combines weather + style + wardrobe
- **Mirror Analysis**: Real-time outfit scoring and suggestions
- **Packing Lists**: Smart trip planning from your wardrobe

### Real-Time Features
- **Live Camera**: WebRTC-based video feed for mirror view
- **Weather Updates**: Automatic location detection and forecasts
- **Avatar Sync**: Instant proportional updates
- **State Persistence**: All data saves automatically to IndexedDB

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

---

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Latest 2 versions |
| Firefox | ✅ Latest 2 versions |
| Safari | ✅ Latest 2 versions |
| Edge | ✅ Latest 2 versions |

**Note**: Requires modern browser with IndexedDB and WebRTC support.

---

## 🔒 Privacy & Security

- **Local Storage**: All data stored in your browser (IndexedDB)
- **No Server**: No backend server required
- **Camera Access**: Only activated when you enable Mirror view
- **API Keys**: Stored locally in `.env` file
- **OTP Demo**: Email OTP uses demo mode (no actual emails sent)

---

## 🐛 Troubleshooting

### Images Not Showing in Wardrobe?
- Check browser console (F12) for errors
- Verify IndexedDB is enabled in browser settings
- Try clearing browser data and re-uploading

### Gemini API Not Working?
- Ensure `.env` file has `VITE_GEMINI_API_KEY`
- Restart dev server after adding API key
- Check API key validity at Google AI Studio

### Camera Not Activating?
- Grant camera permission when prompted
- Use HTTPS or localhost (required for camera access)
- Check if another app is using the camera

### Storage Issues?
- IndexedDB may be limited in private/incognito mode
- Clear old data: DevTools → Application → IndexedDB → Delete
- Browser storage quota varies (typically 50MB-2GB)

---

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |
| `VITE_OPENWEATHER_API_KEY` | Optional | OpenWeatherMap API key for real weather (uses mock data if missing) |

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🎓 Learning Resources

- **React Documentation**: [react.dev](https://react.dev)
- **Three.js Fundamentals**: [threejs.org](https://threejs.org)
- **Google Gemini API**: [ai.google.dev](https://ai.google.dev)
- **IndexedDB Guide**: [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- **TailwindCSS**: [tailwindcss.com](https://tailwindcss.com)

---

## 📞 Support

Having issues? Here's how to get help:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review console logs in browser (F12)
3. Open an issue on GitHub with:
   - Browser version
   - Console errors
   - Steps to reproduce

---

## 🌟 Acknowledgments

- **Google Gemini** for AI-powered analysis
- **OpenWeatherMap** for weather data
- **Three.js** community for 3D rendering
- **React** team for the amazing framework
- **TailwindCSS** for beautiful styling

---

<p align="center">
  <strong>Made with ❤️ for fashion lovers everywhere</strong>
</p>

<p align="center">
  <em>Transform your wardrobe with AI. Look your best, every day.</em>
</p>
