/**
 * App Layout Component - HACCP Design System
 * 
 * Main application layout with responsive navigation and PWA support
 */

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Thermometer, 
  CheckSquare, 
  Package, 
  Settings, 
  Users,
  Bot,
  Menu,
  X
} from 'lucide-react'
import { AuthButton } from '../../features/auth'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useAppStore } from '../../stores/appStore'

const AppLayout = ({ children }) => {
  const { 
    activeTab, 
    setActiveTab, 
    isMobileMenuOpen, 
    setMobileMenuOpen 
  } = useAppStore()
  
  const [isAdmin] = useState(false) // Will be connected to auth later

  // Navigation tabs configuration
  const navigationTabs = [
    {
      id: 'home',
      label: 'Home',
      icon: BarChart3,
      description: 'Dashboard e statistiche'
    },
    {
      id: 'conservation',
      label: 'Conservazione',
      icon: Thermometer,
      description: 'Punti di conservazione e temperature',
      badge: 2 // Example: 2 alerts
    },
    {
      id: 'tasks',
      label: 'Attività',
      icon: CheckSquare,
      description: 'Mansioni e manutenzioni',
      badge: 5 // Example: 5 pending tasks
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Package,
      description: 'Prodotti e scadenze'
    },
    {
      id: 'settings',
      label: 'Impostazioni',
      icon: Settings,
      description: 'Configurazioni e backup'
    }
  ]

  // Admin-only tabs
  const adminTabs = [
    {
      id: 'management',
      label: 'Gestione',
      icon: Users,
      description: 'Staff e reparti',
      adminOnly: true
    },
    {
      id: 'ai-assistant',
      label: 'IA Assistant',
      icon: Bot,
      description: 'Automazioni e suggerimenti',
      adminOnly: true
    }
  ]

  // Combine tabs based on permissions
  const allTabs = [
    ...navigationTabs,
    ...(isAdmin ? adminTabs : [])
  ]

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setMobileMenuOpen(false) // Close mobile menu when tab changes
  }

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen, setMobileMenuOpen])

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Thermometer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-neutral-900">
                    HACCP Manager
                  </h1>
                  <p className="text-xs text-neutral-500 hidden sm:block">
                    Gestione Sicurezza Alimentare
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {allTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    flex items-center gap-2 mobile-tap-target
                    ${activeTab === tab.id 
                      ? 'bg-primary-100 text-primary-700 shadow-sm' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }
                  `}
                  title={tab.description}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{tab.label}</span>
                  {tab.badge && (
                    <Badge variant="error" size="sm" className="ml-1">
                      {tab.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Desktop Auth Button */}
            <div className="hidden md:block">
              <AuthButton />
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="text-neutral-600"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white mobile-menu">
            <div className="px-4 py-3 space-y-1">
              {/* Mobile Auth Button */}
              <div className="pb-3 border-b border-neutral-200 mb-3">
                <AuthButton />
              </div>

              {/* Mobile Navigation */}
              {allTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left
                    transition-all duration-200 mobile-tap-target
                    ${activeTab === tab.id 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-neutral-700 hover:bg-neutral-100'
                    }
                  `}
                >
                  <tab.icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-neutral-500">{tab.description}</div>
                  </div>
                  {tab.badge && (
                    <Badge variant="error" size="sm">
                      {tab.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 safe-area-bottom">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Alternative to hamburger menu) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 lg:hidden safe-area-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navigationTabs.slice(0, 5).map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                relative flex flex-col items-center gap-1 py-2 px-1 rounded-lg
                transition-all duration-200 mobile-tap-target text-xs
                ${activeTab === tab.id 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-neutral-500 hover:text-neutral-700'
                }
              `}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium truncate w-full text-center">
                {tab.label}
              </span>
              {tab.badge && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                  {tab.badge}
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}

export default AppLayout