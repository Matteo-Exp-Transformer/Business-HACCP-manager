/**
 * Business Info Step - Onboarding Wizard
 * 
 * Collects basic business information for HACCP compliance
 */

import { useFormContext } from 'react-hook-form'
import { Building2, Mail, Phone, Hash, Users } from 'lucide-react'
import { InputField, SelectField, FormSection } from '../../../components/forms/FormField'

const BusinessInfoStep = () => {
  const { register, formState: { errors } } = useFormContext()

  const businessTypes = [
    { value: 'restaurant', label: 'Ristorante' },
    { value: 'pizzeria', label: 'Pizzeria' },
    { value: 'bar', label: 'Bar/Caffetteria' },
    { value: 'catering', label: 'Catering' },
    { value: 'bakery', label: 'Panetteria/Pasticceria' },
    { value: 'other', label: 'Altro' }
  ]

  return (
    <div className="space-y-6">
      <FormSection
        title="Dati Aziendali"
        description="Inserisci le informazioni principali della tua attività"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Nome Attività"
            required
            error={errors.name?.message}
            placeholder="Es: Ristorante Da Mario"
            icon={Building2}
            {...register('name')}
          />

          <SelectField
            label="Tipo di Attività"
            required
            options={businessTypes}
            error={errors.businessType?.message}
            {...register('businessType')}
          />
        </div>

        <InputField
          label="Indirizzo Completo"
          required
          error={errors.address?.message}
          placeholder="Via, Numero Civico, CAP, Città, Provincia"
          {...register('address')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Email Aziendale"
            type="email"
            required
            error={errors.email?.message}
            placeholder="info@tuaattivita.it"
            icon={Mail}
            {...register('email')}
          />

          <InputField
            label="Telefono"
            type="tel"
            error={errors.phone?.message}
            placeholder="+39 06 1234567"
            icon={Phone}
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Partita IVA"
            error={errors.vatNumber?.message}
            placeholder="IT12345678901"
            icon={Hash}
            description="Formato: IT seguito da 11 cifre"
            {...register('vatNumber')}
          />

          <InputField
            label="Numero Dipendenti"
            type="number"
            required
            error={errors.employeeCount?.message}
            placeholder="5"
            icon={Users}
            min="1"
            max="1000"
            {...register('employeeCount', { valueAsNumber: true })}
          />
        </div>
      </FormSection>

      {/* HACCP Information */}
      <FormSection
        title="Informazioni HACCP"
        description="Queste informazioni sono essenziali per la conformità alle normative"
      >
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-primary-900 mb-1">
                Conformità HACCP
              </h4>
              <p className="text-sm text-primary-700">
                I dati inseriti verranno utilizzati per generare la documentazione HACCP 
                necessaria per la conformità alle normative sulla sicurezza alimentare.
                Assicurati che tutte le informazioni siano accurate e aggiornate.
              </p>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  )
}

export default BusinessInfoStep