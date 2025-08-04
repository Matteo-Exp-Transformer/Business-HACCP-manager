import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Sparkles,
  Package,
  Thermometer,
  Users,
  BarChart3,
  Mic,
  MicOff,
  Minus
} from 'lucide-react'

function AIAssistant({ 
  currentUser, 
  currentSection, 
  products = [], 
  temperatures = [], 
  cleaning = [], 
  staff = [],
  onAction 
}) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [automations, setAutomations] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [isMinimized, setIsMinimized] = useState(true) // Always start minimized
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false) // New: control overall visibility
  const messagesEndRef = useRef(null)
  const forceMinimizedRef = useRef(true) // Force minimized state
  const gracePeriodRef = useRef(true) // Grace period - no opening allowed

  console.log('🚀 AIAssistant: Component rendering, isMinimized:', isMinimized, 'isMounted:', isMounted, 'isVisible:', isVisible)

  // Force minimized state on first mount to prevent auto-opening
  useEffect(() => {
    console.log('🎯 AIAssistant: useEffect triggered - setting up component')
    // Force minimized and delay mounting to prevent flash
    setIsMinimized(true)
    forceMinimizedRef.current = true
    gracePeriodRef.current = true
    setIsVisible(false) // Start completely hidden
    
    console.log('⏰ AIAssistant: Starting mount timer (500ms)')
    setTimeout(() => {
      console.log('✅ AIAssistant: Mount timer complete - making visible')
      setIsMounted(true)
      setIsMinimized(true) // Double check after mounting
      forceMinimizedRef.current = true
      setIsVisible(true) // Show only the button after delay
    }, 500) // Longer delay
    
    // Grace period - absolutely no opening for 2 seconds
    console.log('🚫 AIAssistant: Starting grace period (2000ms)')
    setTimeout(() => {
      gracePeriodRef.current = false
      console.log('🎉 AIAssistant: Grace period ended, chat can now be opened by user')
    }, 2000)
  }, [])

  // Track state changes for debugging
  useEffect(() => {
    console.log('📊 AIAssistant: State changed - isMinimized:', isMinimized, 'isMounted:', isMounted, 'isVisible:', isVisible, 'forceMinimized:', forceMinimizedRef.current, 'gracePeriod:', gracePeriodRef.current)
  }, [isMinimized, isMounted, isVisible])

  // Override setIsMinimized to prevent auto-opening on first load
  const handleSetMinimized = (value) => {
    console.log('AIAssistant: handleSetMinimized called with:', value, 'gracePeriod:', gracePeriodRef.current, 'forceMinimized:', forceMinimizedRef.current)
    
    // Absolutely no opening during grace period
    if (value === false && gracePeriodRef.current) {
      console.log('AIAssistant: BLOCKED - Still in grace period, no opening allowed')
      return
    }
    
    // Only allow opening if user explicitly clicks (not on auto-mount)
    if (value === false && forceMinimizedRef.current) {
      console.log('AIAssistant: Preventing auto-open, first user click required')
      return // Don't even set it
    }
    forceMinimizedRef.current = false // First click allows future opening
    setIsMinimized(value)
  }

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'it-IT'
      
      recognitionInstance.onstart = () => {
        setIsListening(true)
        addMessage('assistant', '🎤 Ti sto ascoltando... Parla ora!', 'system')
      }
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
        addMessage('assistant', `🎤 Ho sentito: "${transcript}"`, 'system')
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        addMessage('assistant', '❌ Errore nel riconoscimento vocale. Riprova!', 'system')
      }
      
      recognitionInstance.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognitionInstance)
    }
  }, [])

  // Initialize with empty messages - no welcome message
  useEffect(() => {
    // No automatic welcome message
  }, [])

  const addMessage = (sender, content, type = 'text', data = null) => {
    const newMessage = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender,
      content,
      type,
      data,
      timestamp: new Date().toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue.trim()
    setInputValue('')
    addMessage('user', userMessage)

    setIsTyping(true)

    // Simulate AI processing
    setTimeout(() => {
      const response = generateAIResponse(userMessage, currentSection)
      addMessage('assistant', response.content, response.type, response.data)
      setIsTyping(false)
    }, 1000)
  }

  const generateAIResponse = (message, section) => {
    const lowerMessage = message.toLowerCase()
    
    // Context-aware responses based on current section
    switch(section) {
      case 'inventory':
        return generateInventoryResponse(lowerMessage)
      case 'cleaning':
        return generateCleaningResponse(lowerMessage)
      case 'temperature':
        return generateTemperatureResponse(lowerMessage)
      case 'staff':
        return generateStaffResponse(lowerMessage)
      case 'dashboard':
        return generateDashboardResponse(lowerMessage)
      default:
        return generateGeneralResponse(lowerMessage)
    }
  }

  const generateInventoryResponse = (message) => {
    if (message.includes('aggiungere') || message.includes('nuovo prodotto')) {
      return {
        content: `Per aggiungere un nuovo prodotto:

1. **Vai alla sezione "Inventario"**
2. **Clicca "Aggiungi Prodotto"**
3. **Compila i campi richiesti:**
   - Nome prodotto
   - Categoria
   - Posizione
   - Data scadenza
   - Allergeni (se presenti)

**Suggerimento**: Puoi anche usare le categorie predefinite per aggiunta rapida!`,
        type: 'text'
      }
    }

    if (message.includes('scadenza') || message.includes('scaduti')) {
      const expiringProducts = products.filter(p => {
        const daysUntilExpiry = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0
      })

      if (expiringProducts.length > 0) {
        return {
          content: `⚠️ **Prodotti in scadenza** (${expiringProducts.length} prodotti):

${expiringProducts.map(p => `• ${p.name} - Scade il ${p.expiryDate}`).join('\n')}

**Suggerimento**: Vuoi che generi delle ricette per utilizzare questi ingredienti?`,
          type: 'alert',
          data: { products: expiringProducts }
        }
      } else {
        return {
          content: '✅ Nessun prodotto in scadenza nei prossimi 7 giorni!',
          type: 'text'
        }
      }
    }

    return {
      content: 'Per l\'inventario posso aiutarti con:\n• Aggiungere prodotti\n• Controllare scadenze\n• Gestire categorie\n• Suggerimenti ricette\n\nCosa ti serve?',
      type: 'text'
    }
  }

  const generateCleaningResponse = (message) => {
    if (message.includes('attività') || message.includes('mansioni')) {
      const pendingTasks = cleaning.filter(t => !t.completed)
      return {
        content: `📋 **Attività da svolgere** (${pendingTasks.length} totali):

${pendingTasks.slice(0, 5).map(t => `• ${t.task} - Assegnato a: ${t.assignee}`).join('\n')}
${pendingTasks.length > 5 ? `\n... e altre ${pendingTasks.length - 5} attività` : ''}

**Suggerimento**: Usa le schede per filtrare per frequenza (Giornaliere/Settimanali/Mensili/Annuali)`,
        type: 'text'
      }
    }

    if (message.includes('temperatura') || message.includes('frigo')) {
      const recentTemps = temperatures.slice(-3)
      return {
        content: `🌡️ **Ultime temperature registrate**:

${recentTemps.map(t => `• ${t.location}: ${t.temperature}°C (${t.status})`).join('\n')}

**Suggerimento**: Registra temperature regolarmente per monitorare la sicurezza alimentare!`,
        type: 'text'
      }
    }

    return {
      content: 'Per la sezione pulizia posso aiutarti con:\n• Gestione attività\n• Controlli temperatura\n• Frequenze mansioni\n• Report completamento\n\nCosa ti serve?',
      type: 'text'
    }
  }

  const generateTemperatureResponse = (message) => {
    return {
      content: 'Per i controlli temperatura posso aiutarti con:\n• Registrare nuove temperature\n• Monitorare trend\n• Alert automatici\n• Report periodici\n\nCosa ti serve?',
      type: 'text'
    }
  }

  const generateStaffResponse = (message) => {
    return {
      content: 'Per la gestione del personale posso aiutarti con:\n• Aggiungere dipendenti\n• Gestire ruoli\n• Assegnare mansioni\n• Report attività\n\nCosa ti serve?',
      type: 'text'
    }
  }

  const generateDashboardResponse = (message) => {
    return {
      content: 'Per la dashboard posso aiutarti con:\n• Panoramica generale\n• Statistiche rapide\n• Alert importanti\n• Navigazione sezioni\n\nCosa ti serve?',
      type: 'text'
    }
  }

  const generateGeneralResponse = (message) => {
    if (message.includes('aiuto') || message.includes('help')) {
      return {
        content: `🤖 **Come posso aiutarti:**

**📦 Inventario:**
• Aggiungere prodotti
• Controllare scadenze
• Suggerimenti ricette

**🧹 Pulizia:**
• Gestire attività
• Controlli temperatura
• Frequenze mansioni

**👥 Personale:**
• Gestire dipendenti
• Assegnare ruoli

**📊 Dashboard:**
• Panoramica generale
• Statistiche

**⚙️ Automatizzazioni:**
• Alert scadenze
• Ordini settimanali
• Suggerimenti ricette

Dimmi in quale sezione ti trovi o cosa ti serve!`,
        type: 'text'
      }
    }

    return {
      content: 'Non sono sicuro di aver capito. Puoi essere più specifico? Oppure dimmi in quale sezione ti trovi per ricevere aiuto mirato!',
      type: 'text'
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceRecognition = () => {
    if (!recognition) {
      addMessage('assistant', '❌ Riconoscimento vocale non supportato dal tuo browser. Usa Chrome o Edge!', 'system')
      return
    }

    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isMounted || !isVisible ? null : isMinimized ? (
        <Button
          onClick={() => handleSetMinimized(false)}
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <Card className="w-80 h-96 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-600" />
                Assistente IA
                {isListening && (
                  <div className="flex items-center gap-1 text-red-600">
                    <Mic className="h-3 w-3 animate-pulse" />
                    <span className="text-xs">Ascoltando...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSetMinimized(true)}
                  className="h-6 w-6 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="h-6 w-6 p-0"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'assistant' && (
                      <Bot className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2 items-center">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scrivi un messaggio..."
                className="flex-1 min-h-[40px]"
              />
              <Button
                onClick={toggleVoiceRecognition}
                disabled={isTyping}
                size="sm"
                className={`px-3 h-10 ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                size="sm"
                className="px-3 h-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}

export default AIAssistant 