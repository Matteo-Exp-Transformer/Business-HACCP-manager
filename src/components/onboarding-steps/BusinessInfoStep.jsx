import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { MapPin, Info, CheckCircle, XCircle } from 'lucide-react';

const BusinessInfoStep = ({ 
  formData, 
  setFormData, 
  currentStep, 
  validateStep, 
  confirmStep, 
  markStepAsUnconfirmed, 
  isStepConfirmed, 
  canConfirmStep 
}) => {
  const [emailValid, setEmailValid] = useState(null); // null = non validato, true = valido, false = non valido

  // Validazione email rinforzata
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Aggiorna lo stato di validazione email quando cambia
  useEffect(() => {
    const email = formData.business?.email || '';
    if (email.length > 0) {
      setEmailValid(validateEmail(email));
    } else {
      setEmailValid(null);
    }
  }, [formData.business?.email]);

  const canProceed = formData.business?.companyName && formData.business?.address && formData.business?.email && emailValid === true;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Informazioni Attività</h3>
        <p className="text-gray-600">Configura i dati base della tua attività</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="businessName">Nome Attività *</Label>
          <Input
            id="businessName"
            value={formData.business?.companyName || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              business: { ...prev.business, companyName: e.target.value }
            }))}
            placeholder="Es. Pizzeria Bella Napoli"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="vatNumber">P.IVA</Label>
          <Input
            id="vatNumber"
            value={formData.business?.vatNumber || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              business: { ...prev.business, vatNumber: e.target.value }
            }))}
            placeholder="11 caratteri max"
            maxLength={11}
            className="mt-1"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="address">Indirizzo *</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="address"
              value={formData.business?.address || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                business: { ...prev.business, address: e.target.value }
              }))}
              placeholder="Via Roma 123, Milano"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (navigator.geolocation) {
                  try {
                    // Mostra loading
                    const button = event.target.closest('button');
                    const originalContent = button.innerHTML;
                    button.innerHTML = '<div class="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>';
                    button.disabled = true;
                    
                    const position = await new Promise((resolve, reject) => {
                      navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                      });
                    });
                    
                    const { latitude, longitude } = position.coords;
                    
                    // Reverse geocoding con OpenStreetMap (gratuito)
                    const response = await fetch(
                      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );
                    
                                         if (response.ok) {
                       const data = await response.json();
                       
                       // Debug: mostra l'oggetto completo dell'indirizzo nella console
                       
                                               if (data.display_name && data.address) {
                          // Usa la mappatura corretta dei campi OpenStreetMap
                          const address = data.address;
                          
                          // Mappatura corretta dei campi
                          const via = address.road || '';
                          const civico = address.house_number || '';
                          const cap = address.postcode || '';
                          const citta = address.city || address.town || address.village || '';
                          const provincia = address.state || '';
                          
                          // Formatta l'indirizzo completo
                          const fullAddress = [via, civico, citta, provincia].filter(Boolean).join(', ');
                          
                          // Salva i dati con la struttura corretta
                          setFormData(prev => ({
                            ...prev,
                            business: { 
                              ...prev.business, 
                              address: fullAddress,
                              via: via,
                              civico: civico,
                              cap: cap,
                              citta: citta,
                              provincia: provincia,
                              coordinates: { lat: latitude, lon: longitude }
                            }
                          }));
                        
                        // Mostra conferma
                        button.innerHTML = '<div class="text-green-600">✓</div>';
                        setTimeout(() => {
                          button.innerHTML = originalContent;
                          button.disabled = false;
                        }, 2000);
                      }
                    } else {
                      throw new Error('Errore nel reverse geocoding');
                    }
                  } catch (error) {
                    console.error('Errore geolocalizzazione:', error);
                    alert('Errore nella geolocalizzazione: ' + error.message);
                    
                    // Ripristina il pulsante
                    const button = event.target.closest('button');
                    button.innerHTML = originalContent;
                    button.disabled = false;
                  }
                } else {
                  alert('Geolocalizzazione non supportata dal browser');
                }
              }}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            💡 Clicca il pulsante GPS per rilevare automaticamente la tua posizione e compilare l'indirizzo
          </p>
          {formData.business?.address && (
            <div className="space-y-2 mt-2">
              {/* Suggerimento verifica */}
              <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-yellow-600 mt-0.5">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Verifica il numero civico!</p>
                  <p className="text-xs mt-1">
                    La geolocalizzazione ha un margine di errore di 5-15 metri. 
                    Controlla che il numero civico sia corretto e modificalo se necessario.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="phone">Telefono</Label>
          <Input
            id="phone"
            value={formData.business?.phone || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              business: { ...prev.business, phone: e.target.value }
            }))}
            placeholder="+39 123 456 7890"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email *</Label>
          <div className="relative mt-1">
            <Input
              id="email"
              type="email"
              value={formData.business?.email || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                business: { ...prev.business, email: e.target.value }
              }))}
              placeholder="info@pizzeria.it"
              className={`pr-10 ${
                emailValid === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                emailValid === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                'border-gray-300'
              }`}
            />
            {emailValid === true && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            )}
            {emailValid === false && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {emailValid === false && (
            <p className="mt-1 text-sm text-red-600">
              Inserisci un indirizzo email valido (es. info@pizzeria.it)
            </p>
          )}
        </div>
        

      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Campi obbligatori</p>
            <p className="text-sm text-blue-800 mt-1">
              Nome Attività, Indirizzo e Email sono obbligatori per procedere.
            </p>
          </div>
        </div>
      </div>
      
      {/* Pulsante "Conferma Dati" rimosso - ora si usa solo "Avanti" */}
    </div>
  );
};

export default BusinessInfoStep;
