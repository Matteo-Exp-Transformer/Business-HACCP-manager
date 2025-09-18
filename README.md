# 🍽️ HACCP Business Manager

**A Progressive Web App for Restaurant Food Safety Management**

[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![React](https://img.shields.io/badge/React-18.3+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4+-purple.svg)](https://vitejs.dev/)

HACCP Business Manager is a mobile-first Progressive Web App (PWA) designed to revolutionize food safety management in the restaurant industry. By digitalizing HACCP compliance processes, we make food safety management intuitive, efficient, and accessible for restaurant staff at all levels.

## ✨ Key Features

- **🔒 Automated Compliance**: Step-by-step guidance for HACCP regulatory compliance
- **📋 Complete Audit Trail**: Full traceability for inspection controls
- **📱 Offline Operations**: Guaranteed functionality even without internet connection
- **📊 Score System**: Automatic evaluation of compliance performance
- **🏢 Multi-tenant**: Support for multiple companies with data isolation
- **🤖 AI Assistant**: Smart automations and proactive suggestions

## 🛠️ Tech Stack

### Frontend
- **React 18.3+** - UI Framework
- **TypeScript 5.6+** - Type Safety
- **Vite 5.4+** - Build Tool
- **Tailwind CSS 3.4+** - Styling
- **Zustand 5.0+** - State Management

### Backend & Services
- **Supabase** - PostgreSQL, Real-time, Storage
- **Clerk 5.20+** - Authentication
- **Vercel** - Hosting & Deployment

### Key Libraries
- **React Query 5.62+** - Server State Management
- **FullCalendar 6.1+** - Calendar Views
- **React Hook Form 7.54+** - Form Management
- **Chart.js 4.4+** - Data Visualization

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or 20.x LTS
- npm or pnpm (recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/haccp-business-manager.git
cd haccp-business-manager

# Install dependencies
npm install
# or
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Setup

Create a `.env.local` file based on `.env.example` and configure:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Optional Services
VITE_SENTRY_DSN=your_sentry_dsn
VITE_POSTHOG_KEY=your_posthog_key
```

## 📁 Project Structure

```
haccp-business-manager/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # Base UI components
│   │   ├── forms/          # Form components
│   │   └── layouts/        # Layout components
│   ├── features/           # Feature-based modules
│   │   ├── auth/          # Authentication
│   │   ├── onboarding/    # Onboarding flow
│   │   ├── conservation/  # Temperature management
│   │   ├── tasks/         # Task management
│   │   └── inventory/     # Inventory system
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and helpers
│   ├── stores/            # Zustand stores
│   └── types/             # TypeScript definitions
├── tests/                 # Test files
├── docs/                  # Documentation
└── .github/               # GitHub templates & workflows
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test with UI
npm run test:ui

# Watch mode
npm run test:watch
```

## 🏗️ Development

```bash
# Development server
npm run dev

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Performance Targets

- **Lighthouse Score**: > 90 across all categories
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## 🚀 Deployment

The application is configured for deployment on:
- **Vercel** (recommended)
- **Netlify**
- Any static hosting service

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the established code style (ESLint + Prettier)
- Write tests for new features
- Ensure HACCP compliance requirements are met
- Update documentation as needed

## 📋 Development Phases

### Current Phase: Foundation (Step A)
- ✅ Repository setup and development environment
- ✅ Basic project structure
- 🔄 Authentication system (Clerk)
- 🔄 Database setup (Supabase)
- 🔄 UI foundation and components

### Next Phase: Core Operations (Step B)
- Unified Calendar System
- Communication System
- Temperature & Compliance
- Notification System

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**Made with ❤️ for the restaurant industry**