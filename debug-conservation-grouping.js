/**
 * Debug Conservation Grouping - Test logica di raggruppamento
 * 
 * Questo file testa la logica di raggruppamento per i punti di conservazione
 * basata sulle regole HACCP definite in haccpRules.js
 */

// Simulazione dati frigoriferi di test
const testRefrigerators = [
  { id: 1, name: 'Frigo A', targetTemp: 4, isAbbattitore: false },
  { id: 2, name: 'Frigo Bancone 1', targetTemp: 2, isAbbattitore: false },
  { id: 3, name: 'Frigo Bancone 2', targetTemp: 3, isAbbattitore: false },
  { id: 4, name: 'Frigo Bancone 3', targetTemp: 1, isAbbattitore: false },
  { id: 5, name: 'Frigo B', targetTemp: -18, isAbbattitore: false },
  { id: 6, name: 'Frigo C', targetTemp: -20, isAbbattitore: false },
  { id: 7, name: 'Frigo D', targetTemp: 20, isAbbattitore: false },
  { id: 8, name: 'Abbattitore 1', targetTemp: -30, isAbbattitore: true },
  { id: 9, name: 'Dispensa', targetTemp: 18, isAbbattitore: false }
]

// Logica di raggruppamento corretta (basata su regole HACCP)
const getConservationType = (refrigerator) => {
  const temp = parseFloat(refrigerator.targetTemp)
  
  // Priorità 1: Abbattitore (proprietà isAbbattitore = true)
  if (refrigerator.isAbbattitore) {
    return 'abbattitore'
  }
  
  // Priorità 2: Freezer (temperatura tra -25°C e -16°C)
  if (temp >= -25 && temp <= -16) {
    return 'freezer'
  }
  
  // Priorità 3: Ambiente (temperatura tra 15°C e 25°C - dispensa secca)
  if (temp >= 15 && temp <= 25) {
    return 'ambiente'
  }
  
  // Default: Frigorifero (temperatura tra 0°C e 8°C - prodotti freschi)
  if (temp >= 0 && temp <= 8) {
    return 'frigorifero'
  }
  
  // Fallback: se la temperatura non rientra in nessun range standard
  if (temp <= -15) {
    return 'freezer'
  } else if (temp > 8) {
    return 'ambiente'
  } else {
    return 'frigorifero'
  }
}

// Test della logica
console.log('🧪 TEST LOGICA RAGGRUPPAMENTO PUNTI DI CONSERVAZIONE')
console.log('=' .repeat(60))

testRefrigerators.forEach(refrigerator => {
  const type = getConservationType(refrigerator)
  const temp = refrigerator.targetTemp
  
  console.log(`📦 ${refrigerator.name}: ${temp}°C → ${type.toUpperCase()}`)
  
  // Verifica logica
  if (refrigerator.isAbbattitore && type !== 'abbattitore') {
    console.log(`❌ ERRORE: ${refrigerator.name} dovrebbe essere abbattitore`)
  }
  
  if (temp >= -25 && temp <= -16 && type !== 'freezer') {
    console.log(`❌ ERRORE: ${refrigerator.name} (${temp}°C) dovrebbe essere freezer`)
  }
  
  if (temp >= 15 && temp <= 25 && type !== 'ambiente') {
    console.log(`❌ ERRORE: ${refrigerator.name} (${temp}°C) dovrebbe essere ambiente`)
  }
  
  if (temp >= 0 && temp <= 8 && type !== 'frigorifero') {
    console.log(`❌ ERRORE: ${refrigerator.name} (${temp}°C) dovrebbe essere frigorifero`)
  }
})

console.log('\n📊 RAGGRUPPAMENTO FINALE:')
console.log('=' .repeat(30))

const groups = {
  'frigorifero': [],
  'freezer': [],
  'abbattitore': [],
  'ambiente': []
}

testRefrigerators.forEach(refrigerator => {
  const type = getConservationType(refrigerator)
  groups[type].push(refrigerator)
})

Object.entries(groups).forEach(([type, points]) => {
  console.log(`\n${type.toUpperCase()}: ${points.length} punti`)
  points.forEach(point => {
    console.log(`  • ${point.name}: ${point.targetTemp}°C`)
  })
})

console.log('\n✅ Test completato!')
