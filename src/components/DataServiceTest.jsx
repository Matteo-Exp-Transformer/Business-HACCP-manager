/**
 * Componente di test per DataService
 * 
 * Verifica che tutte le funzionalità DataService funzionino correttamente
 * 
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import DataService from '../services/dataService'
import { useHaccpData } from '../hooks/useHaccpData'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

const DataServiceTest = () => {
  const [testResults, setTestResults] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  
  // Test con useHaccpData hook
  const { data: testData, addItem, updateItem, removeItem, clearData, loading, error } = useHaccpData(
    DataService.KEYS.TEMPERATURES, 
    []
  )

  const addTestResult = (test, status, message) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      status,
      message,
      timestamp: new Date().toLocaleString()
    }])
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    try {
      // Test 1: Salvataggio dati
      addTestResult('Salvataggio Dati', 'running', 'Testando salvataggio...')
      const testData = [{ id: 'test1', name: 'Test Temperature', value: 4.5 }]
      const saveResult = await DataService.save(DataService.KEYS.TEMPERATURES, testData)
      if (saveResult.success) {
        addTestResult('Salvataggio Dati', 'success', '✅ Salvataggio riuscito')
      } else {
        addTestResult('Salvataggio Dati', 'error', `❌ Errore: ${saveResult.error}`)
      }

      // Test 2: Caricamento dati
      addTestResult('Caricamento Dati', 'running', 'Testando caricamento...')
      const loadResult = await DataService.load(DataService.KEYS.TEMPERATURES, [])
      if (Array.isArray(loadResult) && loadResult.length > 0) {
        addTestResult('Caricamento Dati', 'success', `✅ Caricati ${loadResult.length} elementi`)
      } else {
        addTestResult('Caricamento Dati', 'error', '❌ Dati non caricati correttamente')
      }

      // Test 3: Validazione dati
      addTestResult('Validazione Dati', 'running', 'Testando validazione...')
      try {
        DataService.validateData(DataService.KEYS.TEMPERATURES, testData)
        addTestResult('Validazione Dati', 'success', '✅ Validazione riuscita')
      } catch (error) {
        addTestResult('Validazione Dati', 'error', `❌ Errore validazione: ${error.message}`)
      }

      // Test 4: Gestione errori
      addTestResult('Gestione Errori', 'running', 'Testando gestione errori...')
      try {
        await DataService.save(DataService.KEYS.TEMPERATURES, 'invalid-data')
        addTestResult('Gestione Errori', 'error', '❌ Dovrebbe aver fallito')
      } catch (error) {
        addTestResult('Gestione Errori', 'success', '✅ Gestione errori funziona')
      }

      // Test 5: Hook useHaccpData
      addTestResult('Hook useHaccpData', 'running', 'Testando hook...')
      if (loading) {
        addTestResult('Hook useHaccpData', 'info', '⏳ Hook in caricamento...')
      } else if (error) {
        addTestResult('Hook useHaccpData', 'error', `❌ Errore hook: ${error}`)
      } else {
        addTestResult('Hook useHaccpData', 'success', `✅ Hook funziona, ${testData.length} elementi`)
      }

      // Test 6: Export/Import
      addTestResult('Export/Import', 'running', 'Testando export/import...')
      try {
        const exportData = await DataService.exportAllData()
        if (exportData && exportData.exportDate) {
          addTestResult('Export/Import', 'success', '✅ Export funziona')
        } else {
          addTestResult('Export/Import', 'error', '❌ Export fallito')
        }
      } catch (error) {
        addTestResult('Export/Import', 'error', `❌ Errore export: ${error.message}`)
      }

      // Test 7: Pulizia duplicati
      addTestResult('Pulizia Duplicati', 'running', 'Testando pulizia...')
      try {
        await DataService.cleanupDuplicates()
        addTestResult('Pulizia Duplicati', 'success', '✅ Pulizia completata')
      } catch (error) {
        addTestResult('Pulizia Duplicati', 'error', `❌ Errore pulizia: ${error.message}`)
      }

    } catch (error) {
      addTestResult('Test Generale', 'error', `❌ Errore generale: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const testHookOperations = async () => {
    try {
      // Test addItem
      await addItem({ name: 'Test Item', value: 25 })
      addTestResult('Hook addItem', 'success', '✅ addItem funziona')
      
      // Test updateItem
      if (testData.length > 0) {
        await updateItem(testData[0].id, { name: 'Updated Item' })
        addTestResult('Hook updateItem', 'success', '✅ updateItem funziona')
      }
      
      // Test removeItem
      if (testData.length > 0) {
        await removeItem(testData[0].id)
        addTestResult('Hook removeItem', 'success', '✅ removeItem funziona')
      }
      
    } catch (error) {
      addTestResult('Hook Operations', 'error', `❌ Errore operazioni hook: ${error.message}`)
    }
  }

  const clearTestData = async () => {
    try {
      await clearData()
      addTestResult('Clear Data', 'success', '✅ Dati puliti')
    } catch (error) {
      addTestResult('Clear Data', 'error', `❌ Errore pulizia: ${error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test DataService</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? '⏳ Test in corso...' : '🚀 Avvia Test'}
            </Button>
            <Button 
              onClick={testHookOperations}
              disabled={isRunning}
              variant="outline"
            >
              🔧 Test Hook Operations
            </Button>
            <Button 
              onClick={clearTestData}
              disabled={isRunning}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              🗑️ Pulisci Dati
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Risultati Test:</h3>
            <div className="max-h-96 overflow-y-auto space-y-1">
              {testResults.map((result) => (
                <div 
                  key={result.id}
                  className={`p-2 rounded text-sm ${
                    result.status === 'success' ? 'bg-green-100 text-green-800' :
                    result.status === 'error' ? 'bg-red-100 text-red-800' :
                    result.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    result.status === 'info' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="font-medium">{result.test}</div>
                  <div className="text-xs opacity-75">{result.message}</div>
                  <div className="text-xs opacity-50">{result.timestamp}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Hook useHaccpData Status:</h3>
            <div className="text-sm space-y-1">
              <div>Loading: {loading ? '⏳ Sì' : '✅ No'}</div>
              <div>Error: {error || '✅ Nessuno'}</div>
              <div>Data Count: {testData.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DataServiceTest
