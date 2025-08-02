import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { 
  Bot, 
  Settings, 
  Mic, 
  MicOff, 
  MessageCircle, 
  Send, 
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Thermometer,
  Users,
  BarChart3,
  Zap,
  BookOpen,
  HelpCircle
} from 'lucide-react'

function AIAssistantSection({ 
  currentUser, 
  products = [], 
  temperatures = [], 
  cleaning = [], 
  staff = [],
  onAction 
}) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [automations, setAutomations] = useState([
    { id: 1, name: 'Alert Scadenze', enabled: true, description: 'Avvisa sui prodotti in scadenza' },
    { id: 2, name: 'Suggerimenti Ricette', enabled: true, description: 'Genera ricette per ingredienti in scadenza' },
    { id: 3, name: 'Ordini Settimanali', enabled: false, description: 'Crea ordini automatici ogni lunedì' },
    { id: 4, name: 'Alert Temperature', enabled: true, description: 'Avvisa su temperature critiche' }
  ])

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

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      addMessage('assistant', `Ciao ${currentUser?.name || 'utente'}! 👋 Sono il tuo assistente IA per il sistema HACCP.

**🤖 Cosa posso fare:**
• **Gestione inventario** - Aggiungere prodotti, controllare scadenze
• **Controlli temperatura** - Registrare e monitorare temperature
• **Attività di pulizia** - Gestire mansioni e frequenze
• **Automatizzazioni** - Alert intelligenti e suggerimenti
• **🎤 Riconoscimento vocale** - Parla invece di scrivere!

**⚙️ Automatizzazioni attive:**
${automations.filter(a => a.enabled).map(a => `• ${a.name}`).join('\n')}

Dimmi cosa ti serve!`)
    }
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
      const response = generateAIResponse(userMessage)
      addMessage('assistant', response.content, response.type, response.data)
      setIsTyping(false)
    }, 1000)
  }

  const generateAIResponse = (message) => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('aiuto') || lowerMessage.includes('help')) {
      return {
        content: `🤖 **Come posso aiutarti:**

**📦 Inventario:**
• "Aggiungi un nuovo prodotto"
• "Controlla le scadenze"
• "Mostra i prodotti in scadenza"

**🌡️ Temperature:**
• "Registra una temperatura"
• "Mostra le ultime temperature"
• "Controlla i frigoriferi"

**🧹 Pulizia:**
• "Mostra le attività da svolgere"
• "Aggiungi una nuova attività"
• "Controlla le mansioni"

**⚙️ Automatizzazioni:**
• "Attiva alert scadenze"
• "Genera ricette"
• "Configura automatizzazioni"

**🎤 Comandi vocali:**
• Parla chiaramente in italiano
• Usa frasi semplici e dirette
• Clicca il microfono per iniziare`,
        type: 'text'
      }
    }

    if (lowerMessage.includes('scadenza') || lowerMessage.includes('scaduti')) {
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

    if (lowerMessage.includes('attività') || lowerMessage.includes('mansioni')) {
      const pendingTasks = cleaning.filter(t => !t.completed)
      return {
        content: `📋 **Attività da svolgere** (${pendingTasks.length} totali):

${pendingTasks.slice(0, 5).map(t => `• ${t.task} - Assegnato a: ${t.assignee}`).join('\n')}
${pendingTasks.length > 5 ? `\n... e altre ${pendingTasks.length - 5} attività` : ''}

**Suggerimento**: Usa le schede per filtrare per frequenza!`,
        type: 'text'
      }
    }

    if (lowerMessage.includes('temperatura') || lowerMessage.includes('frigo')) {
      const recentTemps = temperatures.slice(-3)
      return {
        content: `🌡️ **Ultime temperature registrate**:

${recentTemps.map(t => `• ${t.location}: ${t.temperature}°C (${t.status})`).join('\n')}

**Suggerimento**: Registra temperature regolarmente per monitorare la sicurezza alimentare!`,
        type: 'text'
      }
    }

    return {
      content: 'Non sono sicuro di aver capito. Prova a dire "aiuto" per vedere tutti i comandi disponibili!',
      type: 'text'
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

  const toggleAutomation = (id) => {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IA Assistant</h1>
          <p className="text-gray-600">Il tuo assistente intelligente per la gestione HACCP</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleVoiceRecognition}
            disabled={isTyping}
            className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
            {isListening ? 'Ferma Ascolto' : 'Parla'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Impostazioni
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                Chat con l'IA
                {isListening && (
                  <div className="flex items-center gap-1 text-red-600">
                    <Mic className="h-3 w-3 animate-pulse" />
                    <span className="text-xs">Ascoltando...</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
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
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Scrivi un messaggio o parla..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Automatizzazioni */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Automatizzazioni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {automations.map(automation => (
                  <div key={automation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{automation.name}</h4>
                      <p className="text-xs text-gray-600">{automation.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={automation.enabled ? "default" : "outline"}
                      onClick={() => toggleAutomation(automation.id)}
                    >
                      {automation.enabled ? 'Attiva' : 'Disattiva'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Azioni Rapide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setInputValue('Controlla le scadenze')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Controlla Scadenze
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setInputValue('Mostra le attività da svolgere')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Attività da Svolgere
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setInputValue('Mostra le ultime temperature')}
                >
                  <Thermometer className="h-4 w-4 mr-2" />
                  Ultime Temperature
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setInputValue('Aiuto')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Aiuto
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AIAssistantSection 