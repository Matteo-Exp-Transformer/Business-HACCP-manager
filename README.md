# 🍽️ HACCP Business Manager

> Progressive Web App for HACCP food safety management in restaurants

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF.svg)](https://vitejs.dev/)

## 🎯 Overview

HACCP Business Manager is a mobile-first Progressive Web App designed to revolutionize food safety management in the restaurant industry. By digitalizing HACCP compliance processes, we make food safety management intuitive, efficient, and accessible for restaurant staff at all levels.

### Key Features

- **📱 Mobile-First**: Optimized for smartphones and tablets
- **🔄 Offline-First**: Critical functions work without internet
- **⚡ Real-Time**: Instant updates across all devices
- **📊 Compliance-Focused**: Built around HACCP regulations
- **👥 User-Friendly**: Intuitive interface requiring minimal training

## 🏗️ Architecture

### Frontend Stack
- **React 18.3+** - UI Framework
- **TypeScript 5.6+** - Type Safety
- **Vite 5.4+** - Build Tool
- **Tailwind CSS 3.4+** - Styling
- **Zustand 5.0+** - State Management

### Backend & Services
- **Supabase** - Database & Real-time
- **Clerk** - Authentication
- **Vercel** - Hosting & Deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or 20.x LTS
- pnpm (recommended) or npm
- Git 2.40+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/haccp-business-manager.git
cd haccp-business-manager

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

### Environment Setup

1. **Supabase**: Create project and get URL + Anon Key
2. **Clerk**: Set up authentication and get Publishable Key
3. **Configure**: Update `.env.local` with your keys

## 📋 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript check

# Testing
pnpm test             # Run tests
pnpm test:watch       # Watch mode
pnpm test:ui          # Test UI
pnpm test:coverage    # Coverage report
```

### Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ui/             # Base UI components
│   ├── forms/          # Form components
│   └── layouts/        # Layout components
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── onboarding/    # Onboarding flow
│   ├── conservation/  # Temperature management
│   ├── tasks/         # Task management
│   └── inventory/     # Inventory system
├── hooks/             # Custom React hooks
├── lib/               # Utilities and helpers
├── stores/            # Zustand stores
├── types/             # TypeScript types
└── styles/            # Global styles
```

## 🎨 Core Modules

### 🏠 Dashboard
- Real-time overview
- Compliance metrics
- Quick actions

### ❄️ Conservation Points
- Temperature monitoring
- Automatic classification
- Maintenance scheduling

### ✅ Tasks & Activities
- HACCP task management
- Staff assignments
- Completion tracking

### 📦 Inventory
- Product management
- Expiry monitoring
- Allergen tracking

### ⚙️ Settings & Data
- Configuration
- Data export/import
- HACCP manual

### 👥 Management (Admin)
- Staff management
- Department setup
- System configuration

## 🔧 Development Guidelines

### Code Standards
- **TypeScript**: New components always in TS
- **ESLint + Prettier**: Consistent formatting
- **Testing**: Unit tests for all utilities
- **Documentation**: Comprehensive README files

### Git Workflow
1. Create feature branch from `main`
2. Make changes with clear commit messages
3. Run tests and linting
4. Create pull request
5. Code review and merge

## 📊 Performance Targets

- **Lighthouse Score**: >90 all categories
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Bundle Size**: <200KB initial load
- **Offline Support**: Full CRUD operations

## 🔒 Security

- HTTPS everywhere
- Content Security Policy
- Input sanitization
- Row Level Security (RLS)
- Regular dependency updates

## 📚 Documentation

- [Planning Document](./PLANNING.md) - Project architecture
- [Development Tasks](./TASKS.md) - Detailed task breakdown
- [Claude Guide](./Claude.md) - AI development guidelines

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- HACCP regulations and best practices
- Open source community
- Restaurant industry feedback

---

**Built with ❤️ for food safety compliance**