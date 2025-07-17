# PetTalesAI Frontend

The frontend application for PetTalesAI - an AI-powered children's book generator platform.

## 🚀 Features

- **User Authentication**: Login, signup, email verification with Google OAuth
- **Internationalization**: Full support for English and Spanish with automatic language detection
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **State Management**: Redux Toolkit for efficient state management
- **Error Handling**: Comprehensive error handling with localized error messages
- **Modern Development**: Built with React 19, Vite, and modern JavaScript

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and development server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Material Tailwind** - UI components
- **i18next** - Internationalization
- **Axios** - HTTP client
- **React Toastify** - Toast notifications

## 📦 Installation

1. Install dependencies:

```bash
yarn install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Configure environment variables:

```env
VITE_DEBUG_MODE=true
VITE_API_BASE_URL=http://localhost:3000
```

## 🏃‍♂️ Development

Start the development server:

```bash
yarn dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Build

Build for production:

```bash
yarn build
```

## 🧹 Code Quality

Run ESLint:

```bash
yarn lint
```

## 🌍 Internationalization

The application supports:

- **English** (default)
- **Spanish**

Language detection priority:

1. localStorage (user preference)
2. Browser language
3. English (fallback)

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── i18n/          # Internationalization setup and translations
├── layouts/       # Layout components
├── pages/         # Page components
├── services/      # API service functions
├── stores/        # Redux store and slices
├── utils/         # Utility functions and helpers
└── assets/        # Static assets
```

## 🔧 Configuration

- **Vite**: `vite.config.js`
- **Tailwind**: `tailwind.config.js`
- **ESLint**: `eslint.config.js`
- **Path aliases**: `jsconfig.json`
