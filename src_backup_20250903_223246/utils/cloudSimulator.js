// Cloud Simulator - Simula Firebase con localStorage
// Perfetto per testare da mobile senza setup cloud!

export class CloudSimulator {
  constructor(companyId) {
    this.companyId = companyId
    this.storagePrefix = `cloud-sim-${companyId}`
    
    console.log('☁️ CloudSimulator attivo per:', companyId)
  }

  // Simula il salvataggio nel cloud
  async saveToCloud(collection, data, userId) {
    return new Promise((resolve, reject) => {
      try {
        // Simula latenza di rete
        setTimeout(() => {
          const key = `${this.storagePrefix}-${collection}`
          const cloudData = {
            data,
            lastModified: new Date().toISOString(),
            modifiedBy: userId,
            companyId: this.companyId,
            version: Date.now()
          }
          
          localStorage.setItem(key, JSON.stringify(cloudData))
          
          console.log(`📤 [SIMULATO] Salvato in cloud: ${collection}`)
          resolve({ 
            success: true, 
            message: `✅ ${collection} condiviso con tutti!`,
            timestamp: cloudData.lastModified
          })
        }, 800 + Math.random() * 400) // Simula 800-1200ms di rete
      } catch (error) {
        reject({ 
          success: false, 
          message: `❌ Errore simulato nel salvare ${collection}` 
        })
      }
    })
  }

  // Simula il download dal cloud
  async loadFromCloud(collection) {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          const key = `${this.storagePrefix}-${collection}`
          const cloudData = localStorage.getItem(key)
          
          if (cloudData) {
            const parsed = JSON.parse(cloudData)
            console.log(`📥 [SIMULATO] Scaricato dal cloud: ${collection}`)
            resolve({
              success: true,
              data: parsed.data,
              lastModified: parsed.lastModified,
              message: `✅ Ricevuti aggiornamenti di ${collection}!`
            })
          } else {
            resolve({
              success: true,
              data: null,
              message: `ℹ️ Nessun dato di ${collection} nel cloud`
            })
          }
        }, 600 + Math.random() * 300) // Simula download più veloce
      } catch (error) {
        reject({
          success: false,
          message: `❌ Errore nel scaricare ${collection}`
        })
      }
    })
  }

  // Simula controllo connessione
  isOnline() {
    return navigator.onLine
  }

  // Simula info azienda
  async getCompanyInfo() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: this.companyId,
          name: 'Demo Pizzeria Da Mario',
          plan: 'free',
          users: 5,
          maxUsers: 25,
          storageUsed: '45 MB',
          storageMax: '1 GB'
        })
      }, 300)
    })
  }

  // Simula lista modifiche recenti di altri utenti
  async getRecentChanges() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const fakeChanges = [
          {
            type: 'inventory',
            user: 'Luca (Magazzino)',
            action: 'Aggiunto: Mozzarella di Bufala',
            time: '5 min fa'
          },
          {
            type: 'temperatures',
            user: 'Sara (Cucina)',
            action: 'Temperatura Frigo A: 4.2°C',
            time: '12 min fa'
          },
          {
            type: 'cleaning',
            user: 'Marco (Pulizie)',
            action: 'Completata: Sanificazione tavoli',
            time: '25 min fa'
          }
        ]
        
        resolve({
          success: true,
          changes: fakeChanges,
          hasUpdates: Math.random() > 0.5 // 50% possibilità di aggiornamenti
        })
      }, 400)
    })
  }

  // Simula statistiche utilizzo
  getStorageStats() {
    const stats = {
      localSpace: '45 MB',
      cloudSpace: '12 MB', 
      photosCount: 23,
      documentsCount: 156,
      lastSync: localStorage.getItem('haccp-last-sync') || 'Mai',
      syncCount: parseInt(localStorage.getItem('cloud-sim-sync-count') || '0')
    }
    
    return stats
  }

  // Incrementa contatore sync per stats
  incrementSyncCount() {
    const current = parseInt(localStorage.getItem('cloud-sim-sync-count') || '0')
    localStorage.setItem('cloud-sim-sync-count', (current + 1).toString())
  }

  // Simula pulizia spazio cloud
  async cleanupCloudStorage() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const spaceSaved = Math.floor(Math.random() * 20) + 5 // 5-25 MB
        resolve({
          success: true,
          message: `🧹 Liberati ${spaceSaved} MB dal cloud!`,
          spaceSaved: `${spaceSaved} MB`
        })
      }, 1000)
    })
  }
}

// Factory per creare il simulatore
export const createCloudSimulator = (companyId = 'demo-company') => {
  return new CloudSimulator(companyId)
}

// Utilità per convertire dati reali in formato cloud
export const prepareDataForCloud = (type, data, userId) => {
  return {
    type,
    data,
    userId,
    timestamp: new Date().toISOString(),
    deviceInfo: {
      userAgent: navigator.userAgent.substring(0, 50),
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    }
  }
}

// Debug info per sviluppo
export const debugCloudSimulator = () => {
  console.log('🔍 Debug Cloud Simulator:')
  
  const keys = Object.keys(localStorage).filter(key => key.startsWith('cloud-sim-'))
  keys.forEach(key => {
    const data = JSON.parse(localStorage.getItem(key))
    console.log(`  📁 ${key}:`, data.lastModified, `by ${data.modifiedBy}`)
  })
  
  if (keys.length === 0) {
    console.log('  📭 Nessun dato nel cloud simulato')
  }
}