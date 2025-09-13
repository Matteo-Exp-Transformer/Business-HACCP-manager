/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo componente gestisce il REPORTING AVANZATO - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo componente gestisce report e statistiche per compliance HACCP
 * ⚠️ Genera documentazione richiesta da autorità sanitarie
 * 
 * @fileoverview Sistema Reporting Avanzato HACCP - Sistema Critico di Documentazione
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Reporting e Compliance
 * @version 1.0
 */

import React, { useState, useEffect } from 'react'
import { errorLog } from '../utils/debug'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs'
import { 
  FileText, 
  Download, 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Thermometer, 
  Sparkles, 
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  PieChart,
  LineChart,
  Target,
  Award
} from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

function AdvancedReporting({ 
  temperatures = [], 
  cleaning = [], 
  products = [], 
  staff = [], 
  refrigerators = [],
  currentUser 
}) {
  const [selectedDateRange, setSelectedDateRange] = useState('week')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [selectedReportType, setSelectedReportType] = useState('overview')
  const [reportData, setReportData] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Date ranges predefiniti
  const dateRanges = {
    today: { label: 'Oggi', days: 1 },
    week: { label: 'Ultima Settimana', days: 7 },
    month: { label: 'Ultimo Mese', days: 30 },
    quarter: { label: 'Ultimo Trimestre', days: 90 },
    year: { label: 'Ultimo Anno', days: 365 }
  }

  // Calcola date range
  const getDateRange = () => {
    const endDate = new Date()
    let startDate = new Date()
    
    if (selectedDateRange === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate)
      endDate = new Date(customEndDate)
    } else {
      const range = dateRanges[selectedDateRange]
      if (range) {
        startDate.setDate(startDate.getDate() - range.days)
      }
    }
    
    return { startDate, endDate }
  }

  // Filtra dati per date range
  const getFilteredData = () => {
    const { startDate, endDate } = getDateRange()
    
    const filteredTemps = temperatures.filter(temp => {
      const tempDate = new Date(temp.timestamp || temp.date)
      return tempDate >= startDate && tempDate <= endDate
    })
    
    const filteredCleaning = cleaning.filter(task => {
      const taskDate = new Date(task.date.split('/').reverse().join('-'))
      return taskDate >= startDate && taskDate <= endDate
    })
    
    const filteredProducts = products.filter(product => {
      if (!product.expiryDate) return false
      const expiryDate = new Date(product.expiryDate)
      return expiryDate >= startDate && expiryDate <= endDate
    })
    
    return { temperatures: filteredTemps, cleaning: filteredCleaning, products: filteredProducts }
  }

  // Genera report
  const generateReport = async () => {
    setIsGenerating(true)
    
    try {
      const filteredData = getFilteredData()
      const { startDate, endDate } = getDateRange()
      
      let report = {
        period: { start: startDate, end: endDate },
        generatedAt: new Date(),
        generatedBy: currentUser?.name || 'Unknown',
        summary: {},
        details: {},
        compliance: {},
        recommendations: []
      }

      // Report Overview
      if (selectedReportType === 'overview') {
        report = await generateOverviewReport(filteredData, report)
      }
      
      // Report Temperature
      else if (selectedReportType === 'temperature') {
        report = await generateTemperatureReport(filteredData, report)
      }
      
      // Report Pulizie
      else if (selectedReportType === 'cleaning') {
        report = await generateCleaningReport(filteredData, report)
      }
      
      // Report Inventario
      else if (selectedReportType === 'inventory') {
        report = await generateInventoryReport(filteredData, report)
      }
      
      // Report Compliance
      else if (selectedReportType === 'compliance') {
        report = await generateComplianceReport(filteredData, report)
      }

      setReportData(report)
    } catch (error) {
      errorLog('Errore generazione report:', error)
      alert('Errore durante la generazione del report. Riprova.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Report Overview
  const generateOverviewReport = async (data, report) => {
    const { temperatures, cleaning, products } = data
    
    // Statistiche generali
    report.summary = {
      totalTemperatures: temperatures.length,
      criticalTemperatures: temperatures.filter(t => {
        const avgTemp = (t.temperatureMin + t.temperatureMax) / 2
        return avgTemp < 0 || avgTemp > 8
      }).length,
      totalCleaningTasks: cleaning.length,
      completedCleaningTasks: cleaning.filter(t => t.completed).length,
      totalProducts: products.length,
      expiringProducts: products.filter(p => {
        const daysUntilExpiry = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 7
      }).length
    }

    // Compliance score
    const tempCompliance = temperatures.length > 0 ? 
      ((temperatures.length - report.summary.criticalTemperatures) / temperatures.length) * 100 : 100
    
    const cleaningCompliance = cleaning.length > 0 ? 
      (report.summary.completedCleaningTasks / cleaning.length) * 100 : 100
    
    report.compliance = {
      overall: Math.round((tempCompliance + cleaningCompliance) / 2),
      temperature: Math.round(tempCompliance),
      cleaning: Math.round(cleaningCompliance)
    }

    // Raccomandazioni
    report.recommendations = generateRecommendations(report)
    
    return report
  }

  // Report Temperature
  const generateTemperatureReport = async (data, report) => {
    const { temperatures } = data
    
    // Analisi temperature per frigorifero
    const tempByRefrigerator = refrigerators.map(ref => {
      const refTemps = temperatures.filter(t => 
        t.refrigeratorId === ref.id || t.location === ref.name
      )
      
      if (refTemps.length === 0) return null
      
      const avgTemps = refTemps.map(t => (t.temperatureMin + t.temperatureMax) / 2)
      const minTemp = Math.min(...avgTemps)
      const maxTemp = Math.max(...avgTemps)
      const avgTemp = avgTemps.reduce((a, b) => a + b, 0) / avgTemps.length
      
      const criticalCount = refTemps.filter(t => {
        const avg = (t.temperatureMin + t.temperatureMax) / 2
        return avg < 0 || avg > 8
      }).length
      
      return {
        name: ref.name,
        location: ref.location,
        totalReadings: refTemps.length,
        averageTemp: Math.round(avgTemp * 10) / 10,
        minTemp: Math.round(minTemp * 10) / 10,
        maxTemp: Math.round(maxTemp * 10) / 10,
        criticalReadings: criticalCount,
        compliance: refTemps.length > 0 ? 
          Math.round(((refTemps.length - criticalCount) / refTemps.length) * 100) : 100
      }
    }).filter(Boolean)

    report.details.temperatureByRefrigerator = tempByRefrigerator
    report.details.temperatureTrends = generateTemperatureTrends(temperatures)
    
    return report
  }

  // Report Pulizie
  const generateCleaningReport = async (data, report) => {
    const { cleaning } = data
    
    // Analisi per frequenza
    const cleaningByFrequency = ['daily', 'weekly', 'monthly', 'yearly'].map(freq => {
      const freqTasks = cleaning.filter(t => t.frequency === freq)
      const completed = freqTasks.filter(t => t.completed).length
      
      return {
        frequency: freq,
        totalTasks: freqTasks.length,
        completedTasks: completed,
        completionRate: freqTasks.length > 0 ? Math.round((completed / freqTasks.length) * 100) : 0,
        overdueTasks: freqTasks.filter(t => {
          if (t.completed) return false
          const taskDate = new Date(t.date.split('/').reverse().join('-'))
          const now = new Date()
          const daysDiff = Math.ceil((now - taskDate) / (1000 * 60 * 60 * 24))
          
          switch (freq) {
            case 'daily': return daysDiff > 1
            case 'weekly': return daysDiff > 7
            case 'monthly': return daysDiff > 30
            case 'yearly': return daysDiff > 365
            default: return false
          }
        }).length
      }
    })

    // Analisi per assegnatario
    const cleaningByAssignee = staff.map(member => {
      const memberTasks = cleaning.filter(t => t.assignee === member.name)
      const completed = memberTasks.filter(t => t.completed).length
      
      return {
        name: member.name,
        role: member.role,
        totalTasks: memberTasks.length,
        completedTasks: completed,
        completionRate: memberTasks.length > 0 ? Math.round((completed / memberTasks.length) * 100) : 0
      }
    }).filter(m => m.totalTasks > 0)

    report.details.cleaningByFrequency = cleaningByFrequency
    report.details.cleaningByAssignee = cleaningByAssignee
    
    return report
  }

  // Report Inventario
  const generateInventoryReport = async (data, report) => {
    const { products } = data
    
    // Analisi per categoria
    const productsByCategory = {}
    products.forEach(product => {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = []
      }
      productsByCategory[product.category].push(product)
    })

    const categoryAnalysis = Object.entries(productsByCategory).map(([category, prods]) => {
      const expiringSoon = prods.filter(p => {
        const daysUntilExpiry = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 7
      }).length

      const expired = prods.filter(p => new Date(p.expiryDate) < new Date()).length

      return {
        category,
        totalProducts: prods.length,
        expiringSoon,
        expired,
        healthy: prods.length - expiringSoon - expired
      }
    })

    // Analisi scadenze
    const expiryAnalysis = {
      today: products.filter(p => {
        const today = new Date()
        const expiry = new Date(p.expiryDate)
        return today.toDateString() === expiry.toDateString()
      }).length,
      thisWeek: products.filter(p => {
        const daysUntilExpiry = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0
      }).length,
      thisMonth: products.filter(p => {
        const daysUntilExpiry = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 30 && daysUntilExpiry > 7
      }).length
    }

    report.details.productsByCategory = categoryAnalysis
    report.details.expiryAnalysis = expiryAnalysis
    
    return report
  }

  // Report Compliance
  const generateComplianceReport = async (data, report) => {
    const { temperatures, cleaning, products } = data
    
    // Checklist compliance HACCP
    const haccpChecklist = {
      temperatureMonitoring: {
        required: true,
        status: temperatures.length > 0 ? 'compliant' : 'non-compliant',
        details: `Registrazioni temperature: ${temperatures.length}`,
        score: temperatures.length > 0 ? 100 : 0
      },
      cleaningProcedures: {
        required: true,
        status: cleaning.length > 0 ? 'compliant' : 'non-compliant',
        details: `Procedure pulizia: ${cleaning.length}`,
        score: cleaning.length > 0 ? 100 : 0
      },
      productTracking: {
        required: true,
        status: products.length > 0 ? 'compliant' : 'non-compliant',
        details: `Prodotti tracciati: ${products.length}`,
        score: products.length > 0 ? 100 : 0
      },
      staffTraining: {
        required: true,
        status: staff.length > 0 ? 'compliant' : 'non-compliant',
        details: `Personale registrato: ${staff.length}`,
        score: staff.length > 0 ? 100 : 0
      }
    }

    // Calcola compliance generale
    const totalScore = Object.values(haccpChecklist).reduce((sum, item) => sum + item.score, 0)
    const overallCompliance = Math.round(totalScore / Object.keys(haccpChecklist).length)

    report.compliance = {
      overall: overallCompliance,
      checklist: haccpChecklist,
      level: overallCompliance >= 90 ? 'Excellent' : 
             overallCompliance >= 75 ? 'Good' : 
             overallCompliance >= 60 ? 'Fair' : 'Poor'
    }

    // Raccomandazioni compliance
    report.recommendations = generateComplianceRecommendations(haccpChecklist)
    
    return report
  }

  // Genera trend temperature
  const generateTemperatureTrends = (temps) => {
    if (temps.length === 0) return []
    
    // Raggruppa per giorno
    const dailyTemps = {}
    temps.forEach(temp => {
      const date = new Date(temp.timestamp || temp.date).toDateString()
      if (!dailyTemps[date]) {
        dailyTemps[date] = []
      }
      dailyTemps[date].push((temp.temperatureMin + temp.temperatureMax) / 2)
    })

    // Calcola media giornaliera
    return Object.entries(dailyTemps).map(([date, temps]) => ({
      date: new Date(date),
      averageTemp: temps.reduce((a, b) => a + b, 0) / temps.length,
      readings: temps.length
    })).sort((a, b) => a.date - b.date)
  }

  // Genera raccomandazioni
  const generateRecommendations = (report) => {
    const recommendations = []
    
    if (report.compliance.temperature < 90) {
      recommendations.push({
        type: 'temperature',
        priority: 'high',
        message: 'Migliorare il monitoraggio delle temperature per ridurre le letture critiche'
      })
    }
    
    if (report.compliance.cleaning < 90) {
      recommendations.push({
        type: 'cleaning',
        priority: 'high',
        message: 'Aumentare il tasso di completamento delle attività di pulizia'
      })
    }
    
    if (report.summary.expiringProducts > 5) {
      recommendations.push({
        type: 'inventory',
        priority: 'medium',
        message: 'Gestire meglio i prodotti in scadenza per ridurre gli sprechi'
      })
    }
    
    return recommendations
  }

  // Genera raccomandazioni compliance
  const generateComplianceRecommendations = (checklist) => {
    const recommendations = []
    
    Object.entries(checklist).forEach(([key, item]) => {
      if (item.score < 100) {
        recommendations.push({
          type: key,
          priority: 'high',
          message: `Implementare ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} per raggiungere la compliance HACCP`
        })
      }
    })
    
    return recommendations
  }

  // Esporta report PDF
  const exportReportPDF = () => {
    if (!reportData) return
    
    try {
      const { jsPDF } = window.jspdf
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(20)
      doc.text('Report HACCP', 14, 22)
      
      doc.setFontSize(12)
      doc.text(`Periodo: ${reportData.period.start.toLocaleDateString('it-IT')} - ${reportData.period.end.toLocaleDateString('it-IT')}`, 14, 32)
      doc.text(`Generato da: ${reportData.generatedBy}`, 14, 40)
      doc.text(`Data: ${reportData.generatedAt.toLocaleDateString('it-IT')}`, 14, 48)
      
      // Compliance Score
      doc.setFontSize(16)
      doc.text('Compliance Score', 14, 65)
      
      doc.setFontSize(12)
      doc.text(`Compliance Generale: ${reportData.compliance.overall}%`, 14, 75)
      
      if (reportData.compliance.temperature !== undefined) {
        doc.text(`Temperature: ${reportData.compliance.temperature}%`, 14, 85)
      }
      
      if (reportData.compliance.cleaning !== undefined) {
        doc.text(`Pulizie: ${reportData.compliance.cleaning}%`, 14, 95)
      }
      
      // Raccomandazioni
      if (reportData.recommendations && reportData.recommendations.length > 0) {
        doc.setFontSize(16)
        doc.text('Raccomandazioni', 14, 115)
        
        doc.setFontSize(10)
        reportData.recommendations.forEach((rec, index) => {
          const y = 125 + (index * 10)
          if (y < doc.internal.pageSize.height - 20) {
            doc.text(`• ${rec.message}`, 14, y)
          }
        })
      }
      
      const fileName = `report_HACCP_${selectedReportType}_${new Date().toISOString().slice(0, 10)}.pdf`
      doc.save(fileName)
      
    } catch (error) {
      errorLog('Errore esportazione PDF:', error)
      alert('Errore durante l\'esportazione del PDF. Riprova.')
    }
  }

  // Esporta report Excel (CSV)
  const exportReportCSV = () => {
    if (!reportData) return
    
    try {
      let csvContent = 'data:text/csv;charset=utf-8,'
      
      // Header
      csvContent += 'Report HACCP\n'
      csvContent += `Periodo,${reportData.period.start.toLocaleDateString('it-IT')} - ${reportData.period.end.toLocaleDateString('it-IT')}\n`
      csvContent += `Generato da,${reportData.generatedBy}\n`
      csvContent += `Data,${reportData.generatedAt.toLocaleDateString('it-IT')}\n\n`
      
      // Compliance
      csvContent += 'Compliance Score\n'
      csvContent += `Compliance Generale,${reportData.compliance.overall}%\n`
      
      if (reportData.compliance.temperature !== undefined) {
        csvContent += `Temperature,${reportData.compliance.temperature}%\n`
      }
      
      if (reportData.compliance.cleaning !== undefined) {
        csvContent += `Pulizie,${reportData.compliance.cleaning}%\n`
      }
      
      csvContent += '\n'
      
      // Raccomandazioni
      if (reportData.recommendations && reportData.recommendations.length > 0) {
        csvContent += 'Raccomandazioni\n'
        reportData.recommendations.forEach(rec => {
          csvContent += `${rec.type},${rec.priority},${rec.message}\n`
        })
      }
      
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `report_HACCP_${selectedReportType}_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      errorLog('Errore esportazione CSV:', error)
      alert('Errore durante l\'esportazione del CSV. Riprova.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Reporting Avanzato HACCP
          </h1>
          <p className="text-gray-600 mt-1">
            Genera report completi per compliance e analisi operativa
          </p>
        </div>
      </div>

      {/* Controlli Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Configurazione Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo Report */}
            <div className="space-y-2">
              <Label htmlFor="report-type">Tipo Report</Label>
              <select
                id="report-type"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Panoramica Generale</option>
                <option value="temperature">Report Temperature</option>
                <option value="cleaning">Report Pulizie</option>
                <option value="inventory">Report Inventario</option>
                <option value="compliance">Report Compliance HACCP</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="date-range">Periodo</Label>
              <select
                id="date-range"
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(dateRanges).map(([key, range]) => (
                  <option key={key} value={key}>{range.label}</option>
                ))}
                <option value="custom">Periodo Personalizzato</option>
              </select>
            </div>

            {/* Genera Report */}
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                onClick={generateReport}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Generazione...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Genera Report
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Date personalizzate */}
          {selectedDateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Data Inizio</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Data Fine</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risultati Report */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Risultati Report
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={exportReportCSV}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  onClick={exportReportPDF}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Riepilogo</TabsTrigger>
                <TabsTrigger value="details">Dettagli</TabsTrigger>
                <TabsTrigger value="recommendations">Raccomandazioni</TabsTrigger>
              </TabsList>

              {/* Tab Riepilogo */}
              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Compliance Score */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {reportData.compliance.overall}%
                        </div>
                        <div className="text-sm text-gray-600">Compliance Generale</div>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                          reportData.compliance.overall >= 90 ? 'bg-green-100 text-green-800' :
                          reportData.compliance.overall >= 75 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {reportData.compliance.overall >= 90 ? 'Eccellente' :
                           reportData.compliance.overall >= 75 ? 'Buono' :
                           reportData.compliance.overall >= 60 ? 'Sufficiente' : 'Critico'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Statistiche Generali */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Temperature</span>
                          <span className="font-medium">{reportData.summary.totalTemperatures}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Pulizie</span>
                          <span className="font-medium">{reportData.summary.totalCleaningTasks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Prodotti</span>
                          <span className="font-medium">{reportData.summary.totalProducts}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Criticità */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Temp. Critiche</span>
                          <span className="font-medium text-red-600">{reportData.summary.criticalTemperatures}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Pulizie Mancate</span>
                          <span className="font-medium text-orange-600">
                            {reportData.summary.totalCleaningTasks - reportData.summary.completedCleaningTasks}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Scadenze</span>
                          <span className="font-medium text-yellow-600">{reportData.summary.expiringProducts}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab Dettagli */}
              <TabsContent value="details" className="space-y-4">
                {selectedReportType === 'temperature' && reportData.details.temperatureByRefrigerator && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Analisi per Frigorifero</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-3 py-2 text-left">Frigorifero</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Letture</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Temp. Media</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Critiche</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Compliance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.details.temperatureByRefrigerator.map((ref, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-3 py-2">{ref.name}</td>
                              <td className="border border-gray-300 px-3 py-2 text-center">{ref.totalReadings}</td>
                              <td className="border border-gray-300 px-3 py-2 text-center">{ref.averageTemp}°C</td>
                              <td className="border border-gray-300 px-3 py-2 text-center text-red-600">{ref.criticalReadings}</td>
                              <td className="border border-gray-300 px-3 py-2 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  ref.compliance >= 90 ? 'bg-green-100 text-green-800' :
                                  ref.compliance >= 75 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {ref.compliance}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedReportType === 'cleaning' && reportData.details.cleaningByFrequency && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Analisi per Frequenza</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reportData.details.cleaningByFrequency.map((freq, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium capitalize">{freq.frequency}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                freq.completionRate >= 90 ? 'bg-green-100 text-green-800' :
                                freq.completionRate >= 75 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {freq.completionRate}%
                              </span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Totale: {freq.totalTasks}</span>
                                <span>Completate: {freq.completedTasks}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>In Ritardo: {freq.overdueTasks}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab Raccomandazioni */}
              <TabsContent value="recommendations" className="space-y-4">
                {reportData.recommendations && reportData.recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {reportData.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${
                          rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                          rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                          'border-blue-500 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">
                              {rec.type.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              Priorità {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Bassa'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
                    <p>Nessuna raccomandazione</p>
                    <p className="text-sm">Tutto sotto controllo!</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AdvancedReporting
