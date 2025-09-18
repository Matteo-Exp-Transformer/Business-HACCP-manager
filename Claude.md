# 🤖 Claude Development Guide - HACCP Business Manager

**Version:** 1.0  
**Last Updated:** January 2025  
**Project:** HACCP Business Manager PWA

---

## 📋 **PROJECT OVERVIEW**

### **Product Vision**
HACCP Business Manager è una Progressive Web App (PWA) che digitalizza e automatizza la gestione della sicurezza alimentare per ristoranti e attività del settore food. L'app garantisce compliance HACCP attraverso workflow guidati, monitoraggio automatico e audit trail completo.

### **Core Value Proposition**
- **Compliance Automatica**: Guida passo-passo per conformità normative HACCP
- **Audit Trail Completo**: Tracciabilità totale per controlli ispettivi  
- **Operatività Offline**: Funzionamento garantito anche senza connessione
- **Score System**: Valutazione automatica delle performance di compliance
- **IA Assistant**: Automazioni intelligenti e suggerimenti proattivi

### **Target Users**
- **Titolare/Amministratore**: Setup completo, gestione utenti, export report
- **Responsabile/Manager**: Supervisione operativa, assegnazione mansioni, alert system
- **Dipendente/Collaboratore**: Task list, registrazione dati, note

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Frontend Stack**
```
Core Framework:
├── React 18+ (Current codebase)
├── TypeScript (gradual migration)
├── Vite (build tool)  
└── Tailwind CSS (styling)

PWA Components:
├── Service Worker (offline capability)
├── Web App Manifest
├── Push Notifications API
└── IndexedDB (offline storage)

State Management:
├── Zustand (lightweight, current)
├── React Query (server state)
└── Context API (local state)
```

### **Backend Architecture**
```
Authentication:
├── Clerk (email/password, MFA)
├── JWT tokens
└── Session management

Database:
├── Supabase (PostgreSQL)
├── Row Level Security (RLS)
├── Real-time subscriptions
└── Edge functions

Storage:
├── Supabase Storage (images)
├── CDN distribution
└── Backup automation
```

### **Key Integrations**
- **FullCalendar**: Calendario unificato mansioni/manutenzioni
- **jsPDF**: Generazione report e liste della spesa
- **Lucide Icons**: Sistema iconografico
- **Date libraries**: Manipolazione date e orari

---

## 🎯 **CORE FUNCTIONAL MODULES**

### **FR1: Authentication & Users**
- **Clerk Integration**: Email/password + MFA opzionale
- **Role-Based Access**: Admin, Responsabile, Dipendente, Collaboratore
- **Multi-tenant**: Isolamento dati per azienda

### **FR2: Onboarding Aziendale** 
- **Dati Azienda**: Nome, indirizzo, dipendenti, contatti
- **Configurazione Reparti**: Bancone, Sala, Magazzino, Cucina + custom
- **Staff Management**: Ruoli, categorie, certificazioni HACCP

### **FR3: Punti di Conservazione**
```
Classificazione Automatica per Temperatura:
├── Ambiente: Checkbox dedicata
├── Frigorifero: 0°C a 9°C  
├── Freezer: 0°C a -90°C
└── Abbattitore: -10°C a -99°C + Checkbox dedicata

Stati di Monitoraggio:
├── 🟢 Verde: Tutte manutenzioni in regola
├── 🟡 Giallo: Manutenzioni imminenti (≤2 giorni)
└── 🔴 Rosso: Manutenzioni scadute
```

### **FR4: Mansioni e Manutenzioni**
- **Calendario Unificato**: FullCalendar per mansioni + manutenzioni
- **Frequenze**: Giornaliera, Settimanale, Mensile, Annuale, Custom
- **Assegnazione**: Dipendente specifico, Ruolo, Categoria
- **Completamento**: Workflow con timestamp e reset automatico

### **FR5: Inventario Prodotti**
```
Campi Prodotto:
├── Nome prodotto *, Categoria *, Reparto *
├── Punto di conservazione *, Data scadenza
├── Allergeni (8 tipologie checkbox)
├── Foto etichetta (cloud storage)
└── Note

Alert Scadenze:
├── Configurabile: 3-7 giorni prima scadenza
├── Sezione "Prodotti Scaduti" con workflow reinserimento
└── Lista della Spesa: selezione + export PDF
```

### **FR6: Score System & Compliance**
```
Algoritmo Score:
├── Manutenzioni: Peso 70% (priorità alta)
├── Mansioni Generiche: Peso 20%  
├── Gestione Prodotti: Peso 10%
└── Formula: (Completate/Totali) * Peso

Tracking: Ultimi 6 mesi/1 anno per tipologia, dipendente, reparto
Export: Report automatici JSON + PDF
```

### **FR7: Offline System**
```
Strategia Sync (Last-Write-Wins + Dedup):
├── localStorage outbox system
├── Entità Append-Only: temperature, completamenti, note
├── Entità LWW: prodotti, punti conservazione, configurazioni  
├── Conflict resolution: v1 semplificata, v2 advanced
└── Capacità: 3 giorni - 1 mese dati offline
```

---

## 🎨 **UI/UX PATTERNS**

### **Navigation Structure**
```
Main Tabs:
├── 🏠 Home (dashboard, statistiche principali)
├── ❄️ Conservazione (punti + manutenzioni + stato)
├── ✅ Attività e Mansioni (calendario + registro + statistiche)
├── 📦 Inventario (prodotti + etichette)  
├── ⚙️ Impostazioni e Dati (backup + configurazioni)
├── 👥 Gestione (staff + reparti) [Admin only]
└── 🤖 IA Assistant (automazioni + suggerimenti)
```

### **CollapsibleCard Pattern**
```
Standard Component Structure:
├── Header: Icon + Title + Counter + Expand/Collapse
├── Content: Dynamic based on section
├── Actions: Primary/Secondary buttons
└── States: Loading, Empty, Error, Success
```

### **Color Schema & States**
```
Color Coding:
├── Primary: Blue tones (trust, stability)
├── Success: Green (compliance, completato)  
├── Warning: Yellow (attenzione, imminente)
├── Error: Red (critico, scaduto)
└── Neutral: Gray scale (backgrounds, text)
```

### **Responsive Breakpoints**
```
Device Strategy:
├── Mobile: 320px - 768px (primary focus)
├── Tablet: 768px - 1024px (secondary)  
└── Desktop: 1024px+ (tertiary)
```

---

## 💾 **DATABASE SCHEMA OVERVIEW**

### **Core Tables**
```
Primary Entities:
├── companies (tenant isolation)
├── users (authentication + roles)
├── departments (organizational structure)
├── conservation_points (monitoring locations)
├── products (inventory management)
├── tasks (maintenance + general tasks)
├── task_completions (execution tracking)
├── temperature_readings (compliance data)
├── non_conformities (issue tracking)
├── notes (communication system)  
├── audit_logs (full traceability)
└── exports (backup history)
```

### **Row Level Security (RLS)**
- **Tenant Isolation**: Tutti i dati filtrati per `company_id`
- **Role-based Access**: Controllo granulare per funzionalità
- **Audit Trail**: Logging automatico di tutte le operazioni

---

## 🔧 **DEVELOPMENT GUIDELINES**

### **Code Standards**
```
TypeScript Migration Strategy:
├── New components: Always TypeScript
├── Existing components: Gradual migration  
├── Types: Strong typing for all data models
└── Interfaces: Defined in /src/types/entities.ts
```

### **Component Architecture**
```
Component Structure:
├── /src/components/[Feature]/
├── /src/hooks/[custom hooks]
├── /src/services/[API layer]
├── /src/store/[Zustand stores]
├── /src/utils/[utility functions]
└── /src/types/[TypeScript definitions]
```

### **State Management Pattern**
```
Zustand Stores:
├── dataStore.ts (main application state)
├── /selectors/ (computed state)
├── Persistence: localStorage integration  
└── Sync: Supabase real-time subscriptions
```

### **Error Handling**
```
Error Boundaries:
├── Component-level: ErrorBoundary wrapper
├── API-level: Service layer try/catch  
├── User Feedback: Toast notifications
└── Logging: Full error tracking to audit trail
```

### **Performance Optimization**
```
Key Strategies:
├── React.memo for expensive components
├── useMemo/useCallback for complex calculations
├── Lazy loading for route components
├── Image optimization for photo uploads
└── IndexedDB for offline data caching
```

---

## 🧪 **TESTING STRATEGY**

### **Testing Pyramid**
```
Test Coverage:
├── Unit Tests: Utility functions, hooks, services
├── Component Tests: React Testing Library
├── Integration Tests: API interactions, state management
├── E2E Tests: Critical user workflows
└── Manual Testing: HACCP compliance scenarios
```

### **Key Test Scenarios**
```
Critical Paths:
├── Onboarding workflow completion
├── Task assignment and completion
├── Temperature logging and alerts
├── Offline sync functionality  
├── Data export/import operations
└── Multi-user role access control
```

---

## 📋 **DEVELOPMENT PHASES**

### **Current Phase: Foundation (Step A)**
```
🏗️ Infrastructure & Core:
├── ✅ Repository setup + development environment
├── ✅ Clerk authentication integration  
├── ✅ Supabase setup (DDL + basic RLS)
├── ✅ Service layer architecture
├── ✅ UI skeleton (Tab structure)
└── ✅ PWA basic configuration

📋 Onboarding Completo:
├── Business data collection
├── Departments setup (≥1 required)
├── Staff management (≥1 required)
├── Conservation points configuration  
├── Maintenance planning per point
└── At least 1 generic task creation
```

### **Next Phase: Core Modules (Step B)**
```
📅 Unified Calendar System
💬 Mini-Messages System
🌡️ Temperature Logging & Non-Conformance
🔄 Offline v1 Implementation
```

---

## ⚠️ **CRITICAL CONSIDERATIONS**

### **HACCP Compliance**
```
Non-Negotiable Requirements:
├── Temperature ranges: Strict validation per categoria prodotti
├── Audit Trail: Immutable logging di tutte le operazioni
├── Data Retention: Minimo 1 anno per controlli ispettivi
├── Export Requirements: Formati standard per authorities
└── Legal Compliance: Timestamp immutabili e tracciabilità completa
```

### **Security & Privacy**  
```
Security Measures:
├── TLS 1.3 per trasporto, AES-256 per storage
├── JWT tokens con refresh mechanism
├── RBAC (Role-Based Access Control)
├── GDPR compliance per data privacy
└── Regular security audits e penetration testing
```

### **Performance Requirements**
```
SLA Targets:
├── Load Time: < 3 secondi caricamento iniziale
├── Response Time: < 1 secondo per operazioni CRUD
├── Offline Sync: < 30 secondi riconnessione
├── Image Upload: < 10 secondi per foto etichette
└── System Uptime: 99.5% availability
```

---

## 🚨 **COMMON PITFALLS & SOLUTIONS**

### **Data Sync Issues**
```
Problem: Offline/online conflicts
Solution: 
├── Robust outbox pattern implementation
├── Proper deduplication keys
├── Last-Write-Wins strategy for v1
└── Comprehensive conflict detection
```

### **HACCP Validation**
```
Problem: Incorrect temperature/category combinations
Solution:
├── Server-side validation rules
├── Real-time client-side feedback
├── Expert consultation for validation logic
└── Comprehensive test coverage
```

### **Mobile Performance** 
```
Problem: Slow performance on older devices
Solution:
├── Progressive enhancement approach  
├── Lazy loading and code splitting
├── Efficient image handling and caching
└── Memory management for large datasets
```

---

## 📚 **QUICK REFERENCE**

### **File Structure Priority**
```
High Priority Files:
├── /src/App.jsx (main app structure)
├── /src/components/PuntidiConservazione.jsx (conservation points)
├── /src/store/dataStore.ts (main state)
├── /src/services/dataService.js (API layer)
└── /src/persistence/ (offline sync)
```

### **Environment Setup**
```
Required Services:
├── Clerk account (authentication)
├── Supabase project (database + storage)
├── Vercel/Netlify (deployment)
└── Development tools: Node.js 18+, Vite
```

### **Key Commands**
```bash
# Development
npm run dev          # Start development server
npm run build        # Production build  
npm run test         # Run test suite
npm run lint         # Code linting

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed test data
```

---

## 🎯 **SUCCESS METRICS**

### **Development KPIs**
```
Code Quality:
├── Test coverage: >80%
├── TypeScript migration: >60% by Phase 2
├── Performance: Lighthouse score >90
├── Bundle size: <500KB initial load
└── Error rate: <1% in production
```

### **User Experience**
```
UX Metrics:
├── Onboarding completion: >80%
├── Daily active usage: >70%
├── Task completion rate: >95%
├── Support ticket volume: <5% users/month
└── Customer satisfaction (NPS): >50
```

---

## 📈 **SESSION SUMMARY**

### **Session 1 - January 18, 2025**
**Objective:** Project setup and alignment with documentation

**Completed Tasks:**
- ✅ Read and analyzed project documentation (Claude.md, PLANNING.md, TASKS.md)
- ✅ Cleaned up chaotic files from previous versions:
  - Deleted debug scripts (debug_file_changes.js, debug_file_verification.js, debug-conservation-grouping.js)
  - Removed Python-related files (ram_monitor.py, requirements.txt, avvia_monitor_ram.bat)
  - Cleaned up incomplete files (tatus, test_file_content.md)
- ✅ **A.1.0 Initial Project Setup** - COMPLETED:
  - Updated package.json with proper name and description
  - Added all required dependencies per PLANNING.md specifications
  - Created proper project directory structure
  - Set up GitHub templates (issue templates, PR template, CI/CD workflow)
  - Configured development tools (Prettier, Husky, Playwright)
  - Updated .gitignore with comprehensive rules
  - Created VS Code workspace configuration
  - Added environment variables template (.env.example)
  - Updated README.md with complete project overview
- ✅ **A.1.1 Repository & Development Environment** - COMPLETED:
  - Configured ESLint for React/JavaScript/TypeScript
  - Set up testing framework (Vitest + React Testing Library + Playwright)
  - Created GitHub Actions CI/CD pipeline
  - Established code formatting and git hooks
  - Verified Node.js 22.16.0 compatibility
- ✅ Project structure alignment with documentation requirements
- ✅ Initial git commits with proper project setup

**Current Status:** Foundation Phase (Step A) - Ready for Authentication Setup

- ✅ **A.1.2 Authentication System (Clerk)** - COMPLETED:
  - Clerk React SDK integration with proper configuration
  - Role-based access control (Admin, Manager, Employee, Collaborator)
  - Multi-tenant support with company isolation
  - JWT token handling and session management
  - Permission-based route protection
  - Authentication components and custom hooks
  - Comprehensive documentation and testing
- ✅ **A.1.3 Supabase Backend Setup** - COMPLETED:
  - Complete PostgreSQL schema with 12 core tables
  - Multi-tenant architecture with company isolation
  - Row Level Security (RLS) policies for data protection
  - Real-time subscriptions for live data updates
  - File storage integration for images and documents
  - Service layer with comprehensive CRUD operations
  - React hooks for seamless data integration
  - Comprehensive documentation and seed data

- ✅ **A.2.1 Design System & Components** - COMPLETED:
  - Custom Tailwind CSS theme with HACCP-specific color palette
  - Comprehensive component library (Button, Input, Select, Card, Modal, etc.)
  - Form components with validation states and mobile optimization
  - Loading skeletons and status badges for HACCP compliance
  - Layout components (AppLayout, PageLayout, GridLayout)
  - Toast notification system with HACCP-specific variants
  - Zustand state management with persistence
  - React Query configuration for server state
- ✅ **A.2.2 Navigation & PWA Setup** - COMPLETED:
  - React Router 6.28+ integration with lazy loading
  - Role-based route protection and error boundaries
  - Progressive Web App with Vite PWA plugin
  - Service Worker with Workbox caching strategies
  - IndexedDB for offline data storage
  - Web Push notifications with HACCP-specific types
  - Install prompt and update notifications
  - Mobile-optimized navigation with bottom tabs
- ✅ **A.3.1 Onboarding Wizard Infrastructure** - COMPLETED:
  - Multi-step wizard with React Hook Form and Zod validation
  - HACCP compliance validation throughout the process
  - Progress tracking and step navigation
  - Form data persistence and auto-save
  - Professional error handling and user guidance
  - Mobile-first responsive design with accessibility

- ✅ **A.3.2 Business Configuration** - COMPLETED:
  - Comprehensive business data collection form with validation
  - Required fields: name, address, email, employee count
  - Optional fields: phone, VAT number, business type
  - Logo upload functionality with file validation
  - Address validation with Italian format checking
  - HACCP compliance information and guidance
- ✅ **A.3.3 Department Management** - COMPLETED:
  - Preset department system with HACCP roles
  - Custom department creation with validation
  - Department cards with icons and descriptions
  - Enable/disable functionality and uniqueness checking
  - Minimum 1 department validation enforcement
- ✅ **A.3.4 Staff Management** - COMPLETED:
  - Complete staff registration with role assignment
  - HACCP certification tracking with expiry alerts
  - Department assignment integration
  - Email uniqueness validation and statistics
  - Certification body selection and compliance overview
- ✅ **A.3.5 Conservation Points Setup** - COMPLETED:
  - Automatic temperature classification by type
  - Product category assignment and validation
  - Department assignment for each conservation point
  - HACCP Critical Control Point (CCP) setup
  - Temperature range validation and location tracking
- ✅ **A.3.6 Basic Tasks & Completion** - COMPLETED:
  - HACCP-essential preset tasks with proper classification
  - Custom task creation with full configuration options
  - Task assignment (role, department, conservation point)
  - Frequency and priority configuration
  - Final compliance review with scoring system

**Current Status:** STEP A - FOUNDATION PHASE 100% COMPLETED! 🎉

**MAJOR ACHIEVEMENT:** Complete onboarding system with HACCP compliance validation
- Full business setup wizard with 6-step process
- Professional form validation with Zod schemas
- HACCP compliance scoring and issue detection
- Mobile-optimized responsive design
- Complete audit trail and data persistence

**Next Steps:**
- Begin STEP B - CORE OPERATIONS (B.1.1 FullCalendar Integration)
- Implement unified calendar system
- Start communication system development
- Begin temperature logging and compliance features

---

**Document Control:**
- **Created:** January 2025
- **Last Updated:** January 18, 2025
- **Next Review:** After each development session
- **Usage:** Reference guide for all Claude development sessions

---

4 Rules to follow in workflow :
 
1. Always read PLANNING.MD at the start of every new conversation.
2. Check TASKS.md befor starting your work
3. Mark completed task immediately.
4. Add new discovered tasks.
---
*This guide should be consulted at the start of every development session to ensure consistency with project goals, architecture, and standards.*