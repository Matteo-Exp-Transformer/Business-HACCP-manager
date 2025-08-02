import React, { useState, useEffect } from 'react'
import { X, User, Plus, Eye, EyeOff } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'

function Login({ isOpen, onClose, onLogin, users, onAddUser }) {
  const [selectedUser, setSelectedUser] = useState('')
  const [pin, setPin] = useState('')
  const [showAddUser, setShowAddUser] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')

  // Form per nuovo utente
  const [newUser, setNewUser] = useState({
    name: '',
    pin: '',
    role: 'employee',
    department: ''
  })

  // Stati per i reparti dinamici
  const [departments, setDepartments] = useState([])
  const [suggestedDepartments, setSuggestedDepartments] = useState([])

  // Carica reparti dal localStorage
  useEffect(() => {
    const departmentsData = localStorage.getItem('haccp-departments')
    const departmentsVersion = localStorage.getItem('haccp-departments-version')
    
    // Reparti consigliati e provvisori
    const suggestedDepartments = [
      'Banconisti',
      'Cuochi', 
      'Amministrazione'
    ]
    
    if (departmentsVersion !== '2.0' || !departmentsData) {
      // Prima volta o versione vecchia - usa solo i consigliati
      setDepartments(suggestedDepartments)
      setSuggestedDepartments(suggestedDepartments)
    } else {
      // Carica reparti esistenti dal localStorage
      try {
        const existingDepartments = JSON.parse(departmentsData)
        const customDepartments = existingDepartments
          .filter(dept => dept.isCustom)
          .map(dept => dept.name)
        
        // Combina reparti personalizzati con quelli consigliati (se non esistono già)
        const allDepartments = [...customDepartments]
        suggestedDepartments.forEach(suggested => {
          if (!customDepartments.includes(suggested)) {
            allDepartments.push(suggested)
          }
        })
        
        setDepartments(allDepartments)
        setSuggestedDepartments(suggestedDepartments)
      } catch (error) {
        console.error('Errore nel caricamento reparti:', error)
        setDepartments(suggestedDepartments)
        setSuggestedDepartments(suggestedDepartments)
      }
    }
  }, [])

  const handleLogin = () => {
    if (!selectedUser || !pin) {
      setError('Seleziona utente e inserisci PIN')
      return
    }

    const user = users.find(u => u.id === selectedUser)
    if (!user) {
      setError('Utente non trovato')
      return
    }

    if (user.pin !== pin) {
      setError('PIN non corretto')
      return
    }

    onLogin(user)
    resetForm()
  }

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.pin.trim()) {
      setError('Nome e PIN sono obbligatori')
      return
    }

    if (newUser.pin.length !== 4) {
      setError('Il PIN deve essere di 4 cifre')
      return
    }

    // Controlla se il PIN è già in uso
    if (users.some(u => u.pin === newUser.pin)) {
      setError('PIN già in uso, scegline un altro')
      return
    }

    onAddUser(newUser)
    setShowAddUser(false)
    setNewUser({
      name: '',
      pin: '',
      role: 'employee',
      department: ''
    })
    setError('')
  }

  const resetForm = () => {
    setSelectedUser('')
    setPin('')
    setError('')
    setShowAddUser(false)
    setShowPin(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {showAddUser ? 'Aggiungi Nuovo Utente' : 'Inizia il Turno'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!showAddUser ? (
            // Form Login
            <div className="space-y-4">
              {/* Selezione Utente */}
              <div>
                <Label htmlFor="user-select">Seleziona Utente</Label>
                <select
                  id="user-select"
                  value={selectedUser}
                  onChange={(e) => {
                    setSelectedUser(e.target.value)
                    setError('')
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Scegli utente --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.department})
                      {user.role === 'admin' && ' - Admin'}
                    </option>
                  ))}
                </select>
              </div>

              {/* PIN */}
              <div>
                <Label htmlFor="pin">PIN (4 cifre)</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setPin(value)
                      setError('')
                    }}
                    maxLength={4}
                    placeholder="••••"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Pulsanti */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleLogin}
                  className="flex-1"
                  disabled={!selectedUser || pin.length !== 4}
                >
                  <User className="mr-2 h-4 w-4" />
                  Entra
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Annulla
                </Button>
              </div>

              {/* Aggiungi nuovo utente */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddUser(true)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi Nuovo Utente
                </Button>
              </div>
            </div>
          ) : (
            // Form Nuovo Utente
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <Label htmlFor="new-name">Nome Completo</Label>
                <Input
                  id="new-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="es. Mario Rossi"
                />
              </div>

              {/* PIN */}
              <div>
                <Label htmlFor="new-pin">PIN (4 cifre)</Label>
                <Input
                  id="new-pin"
                  type="password"
                  value={newUser.pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setNewUser({...newUser, pin: value})
                  }}
                  maxLength={4}
                  placeholder="••••"
                />
              </div>

              {/* Ruolo */}
              <div>
                <Label htmlFor="new-role">Ruolo</Label>
                <select
                  id="new-role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Seleziona ruolo --</option>
                  <option value="dipendente">Dipendente (Staff Fisso) (Consigliato)</option>
                  <option value="responsabile">Responsabile (Consigliato)</option>
                  <option value="collaboratore">Collaboratore Occasionale (Consigliato)</option>
                  <option value="admin">Amministratore (Consigliato)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  I ruoli contrassegnati come "Consigliato" sono provvisori e verranno sostituiti dalle categorie create dall'amministratore.
                </p>
              </div>

              {/* Reparto */}
              <div>
                <Label htmlFor="new-department">Reparto</Label>
                <select
                  id="new-department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Seleziona reparto --</option>
                  {departments.map(dept => {
                    const isSuggested = suggestedDepartments.includes(dept)
                    return (
                      <option key={dept} value={dept}>
                        {dept} {isSuggested ? '(Consigliato)' : ''}
                      </option>
                    )
                  })}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  I reparti contrassegnati come "Consigliato" sono provvisori e verranno sostituiti dalle categorie create dall'amministratore.
                </p>
              </div>

              {/* Pulsanti */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddUser}
                  className="flex-1"
                  disabled={!newUser.name.trim() || newUser.pin.length !== 4}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crea Utente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddUser(false)
                    setError('')
                  }}
                >
                  Indietro
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login