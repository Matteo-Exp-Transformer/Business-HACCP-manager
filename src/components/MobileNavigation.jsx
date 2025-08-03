import React, { useState } from 'react'
import { Menu, X, BarChart3, Thermometer, Sparkles, Package, ShoppingCart, QrCode, Bot, Users } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'

const tabConfig = [
  { value: 'dashboard', icon: BarChart3, label: 'Dashboard', shortLabel: 'Dash' },
  { value: 'refrigerators', icon: Thermometer, label: 'Frigoriferi e Freezer', shortLabel: 'Temp' },
  { value: 'cleaning', icon: Sparkles, label: 'Attività e Mansioni', shortLabel: 'Pulizie' },
  { value: 'inventory', icon: Package, label: 'Inventario', shortLabel: 'Invent' },
  { value: 'orders-shopping', icon: ShoppingCart, label: 'Ordini e Spesa', shortLabel: 'Ordini' },
  { value: 'labels', icon: QrCode, label: 'Etichette', shortLabel: 'Etichette' },
  { value: 'ai-assistant', icon: Bot, label: 'IA Assistant', shortLabel: 'IA' },
  { value: 'staff', icon: Users, label: 'Gestione', shortLabel: 'Gest' }
]

function MobileNavigation({ activeTab, onTabChange, isAdmin }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const visibleTabs = isAdmin ? tabConfig : tabConfig.filter(tab => tab.value !== 'staff')

  const handleTabClick = (tabValue) => {
    onTabChange(tabValue)
    setIsMenuOpen(false)
  }

  return (
    <div className="sm:hidden">
      {/* Mobile Menu Button */}
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          <span>Menu</span>
        </Button>
        
        {/* Current Tab Display */}
        <div className="text-sm font-medium text-gray-600">
          {visibleTabs.find(tab => tab.value === activeTab)?.shortLabel || 'Menu'}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <Card className="w-11/12 max-w-sm mx-4">
            <CardContent className="p-4">
              <div className="space-y-2">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.value
                  
                  return (
                    <button
                      key={tab.value}
                      onClick={() => handleTabClick(tab.value)}
                      className={`
                        w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700 border-2 border-blue-200' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
              
              <Button
                onClick={() => setIsMenuOpen(false)}
                variant="outline"
                className="w-full mt-4"
              >
                Chiudi
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default MobileNavigation 