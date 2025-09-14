import React, { useEffect, useState } from 'react'
import { FileDown } from 'lucide-react'
import { Button } from './ui/Button'
import { errorLog } from '../utils/debug'

function PDFExport({ activeTab, temperatures }) {
  const [showPDFButton, setShowPDFButton] = useState(false)

  // Show PDF button only on temperature tab
  useEffect(() => {
    setShowPDFButton(activeTab === 'temperature')
  }, [activeTab])

  const exportTemperaturePDF = () => {
    // Check if PDF libraries are loaded
    if (typeof window.jspdf === 'undefined') {
      alert("Errore: Librerie PDF non caricate. Ricarica la pagina e riprova.")
      return
    }

    if (temperatures.length === 0) {
      alert("Nessuna temperatura registrata da esportare.")
      return
    }

    try {
      const headers = ["Posizione", "Temperatura", "Orario"]
      const rows = []

      temperatures.forEach(temp => {
        rows.push([
          temp.location,
          `${temp.temperature}°C`,
          temp.time
        ])
      })

      const { jsPDF } = window.jspdf
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(18)
      doc.text("Report: Temperature HACCP", 14, 22)
      
      // Date range info
      doc.setFontSize(12)
      const today = new Date().toLocaleDateString('it-IT')
      doc.text(`Data esportazione: ${today}`, 14, 32)
      doc.text(`Totale rilevazioni: ${temperatures.length}`, 14, 40)

      // Table
      doc.autoTable({
        startY: 50,
        head: [headers],
        body: rows,
        theme: 'striped',
        styles: { 
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: { 
          fillColor: [25, 118, 210],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 50 }
        }
      })

      // Footer
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.text(
          `Mini-ePackPro HACCP - Pagina ${i} di ${pageCount}`,
          14,
          doc.internal.pageSize.height - 10
        )
      }

      const fileName = `report_Temperature_${new Date().toISOString().slice(0, 10)}.pdf`
      doc.save(fileName)
    } catch (error) {
      errorLog('PDF export error:', error)
      alert("Errore durante l'esportazione del PDF. Riprova.")
    }
  }

  if (!showPDFButton) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={exportTemperaturePDF}
        className="bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 px-6 py-3 rounded-xl"
        size="lg"
      >
        <FileDown className="h-5 w-5" />
        <span className="hidden sm:inline">Esporta Temperature in PDF</span>
        <span className="sm:hidden">PDF</span>
      </Button>
    </div>
  )
}

export default PDFExport