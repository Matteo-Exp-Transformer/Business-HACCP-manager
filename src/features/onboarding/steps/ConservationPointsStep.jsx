/**
 * Conservation Points Step - Onboarding Wizard
 * 
 * Configure conservation points with automatic HACCP classification
 */

import { useState } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Thermometer, Plus, Trash2, Snowflake, Home, Zap, MapPin } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { InputField, SelectField, CheckboxField, FormSection } from '../../../components/forms/FormField'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Badge, TemperatureBadge } from '../../../components/ui/Badge'

const ConservationPointsStep = () => {
  const { control, register, formState: { errors }, watch } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'conservationPoints'
  })

  const [newPoint, setNewPoint] = useState({
    name: '',
    type: 'frigorifero',
    departmentId: '',
    targetTemperatureMin: 2,
    targetTemperatureMax: 4,
    productCategories: [],
    location: ''
  })

  // Watch departments for assignment
  const departments = watch('departments') || []

  // Conservation point types with HACCP specifications
  const conservationTypes = [
    {
      value: 'ambiente',
      label: 'Ambiente (Temperatura ambiente)',
      icon: Home,
      tempRange: { min: 15, max: 25 },
      description: 'Prodotti secchi, conserve, bevande',
      color: 'text-neutral-600',
      bgColor: 'bg-neutral-100'
    },
    {
      value: 'frigorifero',
      label: 'Frigorifero (Refrigerazione)',
      icon: Thermometer,
      tempRange: { min: 0, max: 9 },
      description: 'Prodotti freschi, latticini, carne, pesce',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      value: 'freezer',
      label: 'Freezer (Congelamento)',
      icon: Snowflake,
      tempRange: { min: -25, max: -15 },
      description: 'Prodotti surgelati, gelati',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100'
    },
    {
      value: 'abbattitore',
      label: 'Abbattitore (Abbattimento rapido)',
      icon: Zap,
      tempRange: { min: -50, max: -10 },
      description: 'Abbattimento temperatura per sicurezza',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  // Product categories by conservation type
  const productCategoriesByType = {
    ambiente: [
      'Pasta e cereali', 'Conserve', 'Olio e aceto', 'Vino e bevande', 
      'Spezie e condimenti', 'Prodotti da forno secchi'
    ],
    frigorifero: [
      'Latticini', 'Carne fresca', 'Pesce fresco', 'Verdure fresche',
      'Uova', 'Salumi e formaggi', 'Preparazioni fresche'
    ],
    freezer: [
      'Carne surgelata', 'Pesce surgelato', 'Verdure surgelate',
      'Gelati', 'Prodotti da forno surgelati', 'Preparazioni congelate'
    ],
    abbattitore: [
      'Preparazioni calde da raffreddare', 'Prodotti per abbattimento',
      'Alimenti cotti da conservare'
    ]
  }

  // Update temperature range when type changes
  const handleTypeChange = (type) => {
    const typeConfig = conservationTypes.find(t => t.value === type)
    if (typeConfig) {
      setNewPoint(prev => ({
        ...prev,
        type,
        targetTemperatureMin: typeConfig.tempRange.min,
        targetTemperatureMax: typeConfig.tempRange.max,
        productCategories: [] // Reset categories when type changes
      }))
    }
  }

  // Add conservation point
  const addConservationPoint = () => {
    if (newPoint.name.trim() && newPoint.departmentId) {
      const nameExists = fields.some(field => 
        field.name.toLowerCase() === newPoint.name.toLowerCase()
      )
      
      if (nameExists) {
        alert('Un punto di conservazione con questo nome esiste già')
        return
      }

      append({
        ...newPoint,
        id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isActive: true,
        createdAt: new Date().toISOString()
      })
      
      setNewPoint({
        name: '',
        type: 'frigorifero',
        departmentId: '',
        targetTemperatureMin: 2,
        targetTemperatureMax: 4,
        productCategories: [],
        location: ''
      })
    }
  }

  // Remove conservation point
  const removeConservationPoint = (index) => {
    if (fields.length > 1) {
      remove(index)
    } else {
      alert('Deve rimanere almeno un punto di conservazione')
    }
  }

  // Get department name
  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId || d.name === departmentId)
    return dept?.name || 'Reparto non assegnato'
  }

  // Get type configuration
  const getTypeConfig = (type) => {
    return conservationTypes.find(t => t.value === type)
  }

  // Toggle product category
  const toggleProductCategory = (category) => {
    setNewPoint(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter(c => c !== category)
        : [...prev.productCategories, category]
    }))
  }

  return (
    <div className="space-y-8">
      {/* Add New Conservation Point */}
      <FormSection
        title="Configura Punto di Conservazione"
        description="Frigoriferi, freezer e aree di stoccaggio per il controllo HACCP"
      >
        <Card>
          <CardHeader>
            <CardTitle size="sm">
              <Thermometer className="w-5 h-5 text-primary-600" />
              Nuovo Punto di Conservazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome punto di conservazione *"
                  value={newPoint.name}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  required
                />
                <select
                  value={newPoint.departmentId}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, departmentId: e.target.value }))}
                  className="form-input"
                  required
                >
                  <option value="">Seleziona reparto *</option>
                  {departments.map(dept => (
                    <option key={dept.id || dept.name} value={dept.id || dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conservation Type Selection */}
              <div>
                <label className="form-label">Tipo di Conservazione *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {conservationTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = newPoint.type === type.value
                    
                    return (
                      <Card
                        key={type.value}
                        variant={isSelected ? 'primary' : 'default'}
                        hover={!isSelected}
                        className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary-300' : ''}`}
                        onClick={() => handleTypeChange(type.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${type.bgColor} rounded-lg flex items-center justify-center`}>
                              <Icon className={`w-5 h-5 ${type.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-neutral-900">
                                {type.label}
                              </div>
                              <div className="text-sm text-neutral-600">
                                {type.tempRange.min}°C - {type.tempRange.max}°C
                              </div>
                              <div className="text-xs text-neutral-500 mt-1">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Temperature Range */}
              <div>
                <label className="form-label">Range di Temperatura Target</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input
                    type="number"
                    placeholder="Temp. Min"
                    value={newPoint.targetTemperatureMin}
                    onChange={(e) => setNewPoint(prev => ({ ...prev, targetTemperatureMin: parseFloat(e.target.value) }))}
                    className="form-input"
                    step="0.1"
                  />
                  <input
                    type="number"
                    placeholder="Temp. Max"
                    value={newPoint.targetTemperatureMax}
                    onChange={(e) => setNewPoint(prev => ({ ...prev, targetTemperatureMax: parseFloat(e.target.value) }))}
                    className="form-input"
                    step="0.1"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Range consigliato per {getTypeConfig(newPoint.type)?.label}: {getTypeConfig(newPoint.type)?.tempRange.min}°C - {getTypeConfig(newPoint.type)?.tempRange.max}°C
                </p>
              </div>

              {/* Product Categories */}
              <div>
                <label className="form-label">Categorie di Prodotti *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {productCategoriesByType[newPoint.type]?.map((category) => (
                    <label 
                      key={category}
                      className={`
                        flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                        ${newPoint.productCategories.includes(category)
                          ? 'bg-primary-50 border-primary-300 text-primary-900'
                          : 'bg-white border-neutral-200 hover:bg-neutral-50'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={newPoint.productCategories.includes(category)}
                        onChange={() => toggleProductCategory(category)}
                        className="sr-only"
                      />
                      <div className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center
                        ${newPoint.productCategories.includes(category)
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-neutral-300'
                        }
                      `}>
                        {newPoint.productCategories.includes(category) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
                {newPoint.productCategories.length === 0 && (
                  <p className="text-error-600 text-sm mt-1">
                    Seleziona almeno una categoria di prodotti
                  </p>
                )}
              </div>

              {/* Location */}
              <input
                type="text"
                placeholder="Posizione/Note (es: Cucina principale, lato finestra)"
                value={newPoint.location}
                onChange={(e) => setNewPoint(prev => ({ ...prev, location: e.target.value }))}
                className="form-input"
              />

              <Button
                type="button"
                onClick={addConservationPoint}
                disabled={
                  !newPoint.name.trim() || 
                  !newPoint.departmentId || 
                  newPoint.productCategories.length === 0
                }
                className="w-full"
              >
                <Plus className="w-4 h-4" />
                Aggiungi Punto di Conservazione
              </Button>
            </div>
          </CardContent>
        </Card>
      </FormSection>

      {/* Conservation Points List */}
      {fields.length > 0 && (
        <FormSection
          title={`Punti di Conservazione (${fields.length})`}
          description="Punti di controllo critico configurati"
        >
          <div className="space-y-4">
            {fields.map((field, index) => {
              const typeConfig = getTypeConfig(field.type)
              const Icon = typeConfig?.icon || Thermometer
              
              return (
                <Card key={field.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${typeConfig?.bgColor || 'bg-primary-100'} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${typeConfig?.color || 'text-primary-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-neutral-900">
                              {field.name}
                            </span>
                            <Badge variant="primary" size="sm">
                              {typeConfig?.label}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm text-neutral-600">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {getDepartmentName(field.departmentId)}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Thermometer className="w-3 h-3" />
                              <TemperatureBadge
                                temperature={(field.targetTemperatureMin + field.targetTemperatureMax) / 2}
                                minTemp={field.targetTemperatureMin}
                                maxTemp={field.targetTemperatureMax}
                              />
                              <span className="text-xs">
                                ({field.targetTemperatureMin}°C - {field.targetTemperatureMax}°C)
                              </span>
                            </div>
                            
                            {field.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {field.location}
                              </div>
                            )}
                          </div>

                          {/* Product Categories */}
                          <div className="mt-3">
                            <div className="text-xs text-neutral-500 mb-1">Categorie prodotti:</div>
                            <div className="flex flex-wrap gap-1">
                              {field.productCategories?.map((category) => (
                                <Badge key={category} variant="secondary" size="sm">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {fields.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeConservationPoint(index)}
                          className="text-error-600 hover:text-error-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Validation error */}
          {errors.conservationPoints && (
            <div className="text-error-600 text-sm mt-2">
              {errors.conservationPoints.message}
            </div>
          )}
        </FormSection>
      )}

      {/* HACCP Critical Control Points Information */}
      <FormSection
        title="Punti di Controllo Critico (CCP)"
        description="Informazioni sui punti di controllo secondo HACCP"
      >
        <Card variant="error">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-error-600 rounded-lg flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-error-900">
                  Controllo Temperature Critiche
                </h4>
                <p className="text-sm text-error-800">
                  I punti di conservazione sono Punti di Controllo Critico (CCP) secondo HACCP:
                </p>
                <ul className="text-sm text-error-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-error-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Monitoraggio continuo:</strong> Temperature registrate regolarmente
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-error-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Limiti critici:</strong> Range di temperatura definiti per sicurezza
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-error-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Azioni correttive:</strong> Procedure automatiche per deviazioni
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-error-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Documentazione:</strong> Registro completo per controlli ispettivi
                    </div>
                  </li>
                </ul>
                <div className="pt-3 border-t border-error-200">
                  <p className="text-xs text-error-600 font-medium">
                    🚨 Minimo 1 punto di conservazione richiesto per la conformità HACCP
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FormSection>
    </div>
  )
}

export default ConservationPointsStep