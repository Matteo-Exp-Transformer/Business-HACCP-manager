/**
 * Business Info Step - Onboarding Wizard
 * 
 * Collects comprehensive business information for HACCP compliance
 */

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Building2, Mail, Phone, Hash, Users, MapPin, Upload, Camera } from 'lucide-react'
import { InputField, SelectField, FormSection } from '../../../components/forms/FormField'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent } from '../../../components/ui/Card'

const BusinessInfoStep = () => {
  const { register, formState: { errors }, setValue, watch } = useFormContext()
  const [logoPreview, setLogoPreview] = useState(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  const businessTypes = [
    { value: 'restaurant', label: 'Ristorante' },
    { value: 'pizzeria', label: 'Pizzeria' },
    { value: 'bar', label: 'Bar/Caffetteria' },
    { value: 'catering', label: 'Catering' },
    { value: 'bakery', label: 'Panetteria/Pasticceria' },
    { value: 'gelateria', label: 'Gelateria' },
    { value: 'rosticceria', label: 'Rosticceria' },
    { value: 'mensa', label: 'Mensa/Ristorazione Collettiva' },
    { value: 'food_truck', label: 'Food Truck' },
    { value: 'other', label: 'Altro' }
  ]

  // Handle logo upload
  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Seleziona un file immagine valido')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Il file deve essere inferiore a 2MB')
      return
    }

    setIsUploadingLogo(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target.result)
        setValue('logoUrl', e.target.result)
      }
      reader.readAsDataURL(file)

      // In a real implementation, this would upload to Supabase Storage
      // For now, we'll use the data URL
      
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Errore durante il caricamento del logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  // Address validation helper
  const validateAddress = (address) => {
    // Basic Italian address validation
    const hasStreet = /via|viale|piazza|corso|largo|vicolo/i.test(address)
    const hasNumber = /\d+/.test(address)
    const hasCity = address.split(',').length >= 2
    
    return hasStreet && hasNumber && hasCity
  }

  return (
    <div className="space-y-8">
      {/* Basic Business Information */}
      <FormSection
        title="Informazioni Aziendali"
        description="Dati principali della tua attività per la documentazione HACCP"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Nome Attività"
            required
            error={errors.name?.message}
            placeholder="Es: Ristorante Da Mario"
            description="Nome completo come registrato nella licenza commerciale"
            {...register('name')}
          />

          <SelectField
            label="Tipo di Attività"
            required
            options={businessTypes}
            error={errors.businessType?.message}
            description="Categoria principale della tua attività"
            {...register('businessType')}
          />
        </div>

        <InputField
          label="Indirizzo Completo"
          required
          error={errors.address?.message}
          placeholder="Via Roma 123, 00100 Roma RM"
          description="Indirizzo completo: via, numero civico, CAP, città, provincia"
          {...register('address', {
            validate: value => validateAddress(value) || 'Inserisci un indirizzo completo (via, numero, città)'
          })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Email Aziendale"
            type="email"
            required
            error={errors.email?.message}
            placeholder="info@tuaattivita.it"
            description="Email principale per comunicazioni ufficiali"
            {...register('email')}
          />

          <InputField
            label="Telefono"
            type="tel"
            error={errors.phone?.message}
            placeholder="+39 06 1234567"
            description="Numero di telefono principale"
            {...register('phone')}
          />
        </div>
      </FormSection>

      {/* Legal and Tax Information */}
      <FormSection
        title="Informazioni Fiscali"
        description="Dati necessari per la documentazione legale e fiscale"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Partita IVA"
            error={errors.vatNumber?.message}
            placeholder="IT12345678901"
            description="Partita IVA nel formato IT + 11 cifre"
            {...register('vatNumber')}
          />

          <InputField
            label="Numero Dipendenti"
            type="number"
            required
            error={errors.employeeCount?.message}
            placeholder="5"
            description="Numero totale di dipendenti e collaboratori"
            min="1"
            max="1000"
            {...register('employeeCount', { valueAsNumber: true })}
          />
        </div>
      </FormSection>

      {/* Logo Upload */}
      <FormSection
        title="Logo Aziendale"
        description="Carica il logo della tua attività (opzionale)"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            {/* Logo preview */}
            <div className="w-24 h-24 bg-neutral-100 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Camera className="w-8 h-8 text-neutral-400" />
              )}
            </div>

            {/* Upload button */}
            <div className="space-y-2">
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleLogoUpload}
                className="sr-only"
              />
              <label htmlFor="logo-upload">
                <Button
                  type="button"
                  variant="outline"
                  loading={isUploadingLogo}
                  className="cursor-pointer"
                  as="span"
                >
                  <Upload className="w-4 h-4" />
                  Carica Logo
                </Button>
              </label>
              <p className="text-xs text-neutral-500">
                Formati supportati: JPG, PNG, SVG (max 2MB)
              </p>
            </div>
          </div>
        </div>
      </FormSection>

      {/* HACCP Compliance Information */}
      <FormSection
        title="Conformità HACCP"
        description="Informazioni essenziali per la gestione della sicurezza alimentare"
      >
        <Card variant="primary">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-primary-900">
                  Sistema di Gestione HACCP
                </h4>
                <p className="text-sm text-primary-800 leading-relaxed">
                  I dati inseriti verranno utilizzati per:
                </p>
                <ul className="text-sm text-primary-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                    Generare la documentazione HACCP obbligatoria
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                    Configurare i punti di controllo critici (CCP)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                    Impostare le procedure di monitoraggio
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                    Creare l'audit trail per le ispezioni
                  </li>
                </ul>
                <div className="pt-2 border-t border-primary-200">
                  <p className="text-xs text-primary-600 font-medium">
                    ℹ️ Tutti i dati sono protetti e conformi al GDPR
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FormSection>

      {/* Address Validation Helper */}
      <FormSection
        title="Validazione Indirizzo"
        description="Verifica che l'indirizzo sia completo per la conformità"
      >
        <Card variant="warning">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-warning-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-warning-900 mb-1">
                  Formato Indirizzo Richiesto
                </h4>
                <p className="text-sm text-warning-700 mb-2">
                  Per la conformità HACCP, l'indirizzo deve includere:
                </p>
                <ul className="text-sm text-warning-700 space-y-1">
                  <li>• Tipo di via (Via, Viale, Piazza, Corso, etc.)</li>
                  <li>• Numero civico</li>
                  <li>• Codice postale (CAP)</li>
                  <li>• Città e provincia</li>
                </ul>
                <p className="text-xs text-warning-600 mt-2 font-medium">
                  Esempio: Via Roma 123, 00100 Roma RM
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FormSection>
    </div>
  )
}

export default BusinessInfoStep