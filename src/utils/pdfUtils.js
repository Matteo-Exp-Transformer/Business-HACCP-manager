// Utility functions for PDF generation
export const checkPDFLibraries = () => {
  if (typeof window.jspdf === 'undefined') {
    console.error('PDF libraries not loaded')
    return false
  }
  return true
}

export const getJsPDF = () => {
  if (!checkPDFLibraries()) {
    throw new Error('PDF libraries not loaded')
  }
  return window.jspdf.jsPDF
}

export const createPDFDocument = () => {
  const jsPDF = getJsPDF()
  return new jsPDF()
}

export const downloadPDF = (doc, filename) => {
  try {
    // Method 1: Direct save (works in most browsers)
    doc.save(filename)
    return true
  } catch (error) {
    console.error('Direct PDF save failed, trying blob method:', error)
    
    try {
      // Method 2: Blob method (better for Chrome)
      const pdfBlob = doc.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return true
    } catch (blobError) {
      console.error('Blob PDF download failed:', blobError)
      
      try {
        // Method 3: Data URL method (fallback)
        const dataUrl = doc.output('dataurlstring')
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = filename
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return true
      } catch (dataUrlError) {
        console.error('Data URL PDF download failed:', dataUrlError)
        return false
      }
    }
  }
}

// Enhanced download function with better error handling
export const downloadPDFWithRetry = async (doc, filename, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const success = downloadPDF(doc, filename)
      if (success) {
        return true
      }
    } catch (error) {
      console.error(`PDF download attempt ${attempt} failed:`, error)
      if (attempt === maxRetries) {
        throw error
      }
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  return false
} 