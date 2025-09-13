# 🎯 GUIDA COMPLETA - Replicazione CollapsibleCard Tab 2 "Punti di Conservazione"

*Guida completa per la replicazione identica delle CollapsibleCard nella tab 2 "Punti di Conservazione" dell'applicazione HACCP Business Manager con layout a colonne dinamiche.*

---

## 📋 **INDICE**

1. [Analisi Styling CollapsibleCard](#1-analisi-styling-collapsiblecard)
2. [Implementazione Punti di Conservazione](#2-implementazione-punti-di-conservazione)
3. [Implementazione Stato Punti di Conservazione](#3-implementazione-stato-punti-di-conservazione)
4. [Logica di Raggruppamento](#4-logica-di-raggruppamento)
5. [Layout a Colonne Dinamiche](#5-layout-a-colonne-dinamiche)
6. [Configurazione Tipi di Colonna](#6-configurazione-tipi-di-colonna)
7. [Implementazione Layout a Colonne](#7-implementazione-layout-a-colonne)
8. [Stato Punti Semplificato](#8-stato-punti-semplificato)

---

## 1. **ANALISI STYLING COLLAPSIBLECARD**

### 🎨 **BORDO E OMBRA DISTINTIVI**
```css
/* Bordo principale */
border-2 border-blue-300

/* Ombra base */
shadow-lg

/* Ombra al hover */
hover:shadow-xl

/* Transizione smooth */
transition-all duration-200
```

### 🏷️ **HEADER CON INDICATORI VISIVI CHIARI**
```css
/* Header container */
cursor-pointer hover:bg-blue-50 transition-all duration-200 border-b border-blue-100

/* Layout flex */
flex items-center justify-between

/* Icona container */
p-3 rounded-xl bg-blue-100 shadow-sm

/* Icona */
h-6 w-6 text-blue-600

/* Titolo */
font-semibold text-gray-900

/* Sottotitolo */
text-sm text-gray-600
```

### 🔢 **CONTATORE CON STILE DISTINTIVO**
```css
/* Container contatore */
bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm

/* Posizionamento */
flex items-center gap-2
```

### 🔄 **CHEVRON CON ANIMAZIONE**
```css
/* Icona chevron */
h-5 w-5 text-blue-600 transition-transform duration-200

/* Rotazione quando espanso */
rotate-180 (quando isExpanded = true)
```

### ✨ **CONTENUTO CON ANIMAZIONE SMOOTH**
```css
/* Container contenuto */
pt-0 animate-in slide-in-from-top-2 fade-in-50 duration-300

/* Animazioni Tailwind */
animate-in: slide-in-from-top-2 fade-in-50 duration-300
```

---

## 2. **IMPLEMENTAZIONE PUNTI DI CONSERVAZIONE**

### 🏗️ **Struttura CollapsibleCard**
```jsx
<CollapsibleCard
  title="Punti di Conservazione"
  subtitle="Gestione frigoriferi e temperature"
  icon={Thermometer}
  iconColor="text-blue-600"
  iconBgColor="bg-blue-100"
  count={stats.total}
  testId="pc-list"
  defaultExpanded={true}
>
  {/* Contenuto dinamico con layout a colonne */}
</CollapsibleCard>
```

### 📊 **Statistiche di Base**
```jsx
const stats = {
  total: refrigerators.length,
  compliant: refrigerators.filter(r => r.isCompliant).length,
  nonCompliant: refrigerators.filter(r => !r.isCompliant).length,
  withData: refrigerators.filter(r => r.hasData).length
}
```

---

## 3. **IMPLEMENTAZIONE STATO PUNTI DI CONSERVAZIONE**

### 🏗️ **Struttura CollapsibleCard**
```jsx
<CollapsibleCard
  title="Stato Punti di Conservazione"
  subtitle="Overview compliance e statistiche"
  icon={BarChart3}
  iconColor="text-purple-600"
  iconBgColor="bg-purple-100"
  count={stats.compliant}
  testId="pc-stato"
>
  {/* Griglia 2x4 semplificata */}
</CollapsibleCard>
```

### 📊 **Griglia Statistiche Semplificata**
```jsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {/* Totale Frigoriferi */}
  <div className="text-center p-4 bg-blue-50 rounded-lg">
    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
    <p className="text-sm text-blue-700">Totale Frigoriferi</p>
  </div>

  {/* Compliant */}
  <div className="text-center p-4 bg-green-50 rounded-lg">
    <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
    <p className="text-sm text-green-700">Compliant</p>
  </div>

  {/* Non Compliant */}
  <div className="text-center p-4 bg-red-50 rounded-lg">
    <p className="text-2xl font-bold text-red-600">{stats.nonCompliant}</p>
    <p className="text-sm text-red-700">Non Compliant</p>
  </div>

  {/* Con Dati */}
  <div className="text-center p-4 bg-purple-50 rounded-lg">
    <p className="text-2xl font-bold text-purple-600">{stats.withData}</p>
    <p className="text-sm text-purple-700">Con Dati</p>
  </div>
</div>
```

---

## 4. **LOGICA DI RAGGRUPPAMENTO**

### 🔍 **Funzione di Determinazione Tipo**
```jsx
const getConservationType = (refrigerator) => {
  const temp = parseFloat(refrigerator.targetTemp)

  // Priorità 1: Abbattitore
  if (refrigerator.isAbbattitore) {
    return 'abbattitore'
  }

  // Priorità 2: Freezer (temperatura <= -15°C)
  if (temp <= -15) {
    return 'freezer'
  }

  // Priorità 3: Ambiente (temperatura > 0°C)
  if (temp > 0) {
    return 'ambiente'
  }

  // Default: Frigorifero (temperatura tra -15°C e 0°C)
  return 'frigorifero'
}
```

### 📦 **Funzione di Raggruppamento**
```jsx
const groupByConservationType = (refrigerators) => {
  const groups = {
    'frigorifero': [],
    'freezer': [],
    'abbattitore': [],
    'ambiente': []
  }

  refrigerators.forEach(refrigerator => {
    const type = getConservationType(refrigerator)
    groups[type].push(refrigerator)
  })

  return groups
}
```

---

## 5. **LAYOUT A COLONNE DINAMICHE**

### 🎯 **Principio Base**
- **Colonne dinamiche** basate sui dati effettivi
- **Raggruppamento automatico** per tipo di conservazione
- **Layout responsive** che si adatta al contenuto
- **4 tipi di colonna**: Frigorifero, Freezer, Abbattitore, Ambiente

### 📐 **Struttura Responsive**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Colonne dinamiche generate automaticamente */}
</div>
```

---

## 6. **CONFIGURAZIONE TIPI DI COLONNA**

### 🏷️ **Configurazione Completa**
```jsx
const getTypeConfig = (type) => {
  const configs = {
    'frigorifero': {
      label: 'Frigoriferi',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      emptyBg: 'bg-blue-50',
      emptyTextColor: 'text-blue-600',
      emptyMessage: 'Nessun frigorifero configurato'
    },
    'freezer': {
      label: 'Freezer',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      emptyBg: 'bg-cyan-50',
      emptyTextColor: 'text-cyan-600',
      emptyMessage: 'Nessun freezer configurato'
    },
    'abbattitore': {
      label: 'Abbattitori',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      emptyBg: 'bg-orange-50',
      emptyTextColor: 'text-orange-600',
      emptyMessage: 'Nessun abbattitore configurato'
    },
    'ambiente': {
      label: 'Ambiente',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      emptyBg: 'bg-green-50',
      emptyTextColor: 'text-green-600',
      emptyMessage: 'Nessun punto ambiente configurato'
    }
  }

  return configs[type] || configs['frigorifero']
}
```

---

## 7. **IMPLEMENTAZIONE LAYOUT A COLONNE**

### 🏗️ **Rendering Colonne Dinamiche**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {Object.entries(groupByConservationType(refrigerators)).map(([type, points]) => {
    const typeConfig = getTypeConfig(type)

    return (
      <div key={type} className="space-y-4">
        {/* Header Colonna */}
        <div className="text-center">
          <h3 className={`text-lg font-semibold ${typeConfig.textColor}`}>
            {typeConfig.label}
          </h3>
        </div>

        {/* Contenuto Colonna */}
        <div className="space-y-3">
          {points.length === 0 ? (
            <div className={`text-center p-4 rounded-lg ${typeConfig.emptyBg}`}>
              <p className={`text-sm ${typeConfig.emptyTextColor}`}>
                {typeConfig.emptyMessage}
              </p>
            </div>
          ) : (
            points.map(point => (
              <Card key={point.id} className="border border-gray-200 rounded-lg shadow-sm">
                <CardContent className="p-4">
                  {/* Header Scheda */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{point.name}</h4>
                      <p className="text-sm text-gray-500">Nessun dato</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(point)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(point.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Dettagli Scheda */}
                  <div className="space-y-2">
                    {/* Posizione */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">📍 {point.location}</span>
                    </div>

                    {/* Temperatura */}
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {point.targetTemp}°C
                      </span>
                    </div>

                    {/* Categorie */}
                    {point.selectedCategories && point.selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {point.selectedCategories.map(catId => {
                          const category = productCategories.find(cat => cat.id === catId)
                          return category ? (
                            <span key={catId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {category.name}
                            </span>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    )
  })}
</div>
```

---

## 8. **STATO PUNTI SEMPLIFICATO**

### ⚠️ **NOTA CRITICA**
La sezione "Stato Punti di Conservazione" nella versione deployata è **semplificata** rispetto a quella in sviluppo. Utilizza una griglia 2x4 con statistiche base.

### 🏗️ **Implementazione Corretta**
```jsx
<CollapsibleCard
  title="Stato Punti di Conservazione"
  subtitle="Overview compliance e statistiche"
  icon={BarChart3}
  iconColor="text-purple-600"
  iconBgColor="bg-purple-100"
  count={stats.compliant}
  testId="pc-stato"
>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div className="text-center p-4 bg-blue-50 rounded-lg">
      <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
      <p className="text-sm text-blue-700">Totale Frigoriferi</p>
    </div>
    <div className="text-center p-4 bg-green-50 rounded-lg">
      <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
      <p className="text-sm text-green-700">Compliant</p>
    </div>
    <div className="text-center p-4 bg-red-50 rounded-lg">
      <p className="text-2xl font-bold text-red-600">{stats.nonCompliant}</p>
      <p className="text-sm text-red-700">Non Compliant</p>
    </div>
    <div className="text-center p-4 bg-purple-50 rounded-lg">
      <p className="text-2xl font-bold text-purple-600">{stats.withData}</p>
      <p className="text-sm text-purple-700">Con Dati</p>
    </div>
  </div>
</CollapsibleCard>
```

---

## 🎯 **RIEPILOGO IMPLEMENTAZIONE**

### ✅ **Elementi Implementati**
1. **Styling completo** CollapsibleCard con bordi, ombre, animazioni
2. **Layout a colonne dinamiche** basato su temperatura e tipo
3. **Logica di raggruppamento** automatica per 4 tipi
4. **Configurazione colori** coordinata per ogni tipo
5. **Rendering responsive** che si adatta al contenuto
6. **Stato semplificato** come nella versione deployata

### 🔧 **Funzionalità Chiave**
- **Raggruppamento automatico** per tipo di conservazione
- **Colonne dinamiche** che appaiono solo se hanno contenuto
- **Layout responsive** 1/2/4 colonne
- **Icone sempre visibili** per modifica/eliminazione
- **Categorie prodotti** visualizzate come badge
- **Pulsante esistente** per aggiungere nuovi punti

### 📱 **Compatibilità**
- **Mobile**: 1 colonna
- **Tablet**: 2 colonne  
- **Desktop**: 4 colonne
- **Contenuto dinamico** che si adatta automaticamente

---

*Guida completa per la replicazione identica delle CollapsibleCard nella tab 2 "Punti di Conservazione" dell'applicazione HACCP Business Manager con layout a colonne dinamiche.*