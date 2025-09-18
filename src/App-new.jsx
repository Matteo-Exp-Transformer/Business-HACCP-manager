/**
 * HACCP Business Manager - Main Application Component
 * 
 * This is the main application component with Clerk authentication integration.
 * It provides the core structure and routing for the HACCP management system.
 */

import React, { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react'
import { 
  BarChart3, 
  Thermometer, 
  CheckSquare, 
  Package, 
  Settings, 
  Users,
  Bot,
  Menu
} from 'lucide-react'

// Import components
import Dashboard from './components/Dashboard'
import PuntidiConservazione from './components/PuntidiConservazione'
import Cleaning from './components/Cleaning'
import Inventory from './components/Inventory'
import Management from './components/Management'
import AIAssistant from './components/AIAssistant'
import DataSettings from './components/DataSettings'

// Import UI components
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Import authentication components
import { AuthButton, ProtectedRoute, useAuth } from './features/auth'

// Import utilities
import { safeGetItem, safeSetItem } from './utils/safeStorage'

function App() {
  const { isLoaded } = useUser()
  const { isAdmin, canManageUsers, userRole } = useAuth()
  
  // Application state
  const [activeTab, setActiveTab] = useState('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Show loading spinner while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Caricamento..." />
      </div>
    )
  }

  // Main navigation tabs
  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: BarChart3,
      component: Dashboard
    },
    {
      id: 'conservation',
      label: 'Conservazione',
      icon: Thermometer,
      component: PuntidiConservazione
    },
    {
      id: 'tasks',
      label: 'Attività e Mansioni',
      icon: CheckSquare,
      component: Cleaning
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Package,
      component: Inventory
    },
    {
      id: 'settings',
      label: 'Impostazioni',
      icon: Settings,
      component: DataSettings
    }
  ]

  // Admin-only tabs
  const adminTabs = [
    {
      id: 'management',
      label: 'Gestione',
      icon: Users,
      component: Management,
      adminOnly: true
    },
    {
      id: 'ai-assistant',
      label: 'IA Assistant',
      icon: Bot,
      component: AIAssistant,
      adminOnly: true
    }
  ]

  // Combine tabs based on user permissions
  const allTabs = [
    ...tabs,
    ...(isAdmin ? adminTabs : [])
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <SignedIn>
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Title */}
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <Thermometer className="w-8 h-8 text-blue-600 mr-2" />
                  <h1 className="text-xl font-bold text-gray-900">
                    HACCP Manager
                  </h1>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <AuthButton />
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-white">
              <div className="px-4 py-2">
                <AuthButton />
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-7 mb-6">
              {allTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            {allTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                {tab.adminOnly ? (
                  <ProtectedRoute adminOnly>
                    <tab.component />
                  </ProtectedRoute>
                ) : (
                  <tab.component />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  )
}

export default App