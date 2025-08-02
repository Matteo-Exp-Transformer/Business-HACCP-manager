# 🚀 Deploy con Vercel CLI - Senza Git

## ⚡ **Deploy da Terminale**

### **📋 Cosa hai bisogno:**
- Node.js installato
- Account Vercel
- 3 minuti di tempo

---

## **🎯 PASSO 1: Installa Vercel CLI**

```bash
npm install -g vercel
```

---

## **🎯 PASSO 2: Login Vercel**

```bash
vercel login
```

- **Segui** le istruzioni nel browser
- **Autorizza** Vercel CLI
- **Torna** al terminale

---

## **🎯 PASSO 3: Deploy**

### **3.1 Dalla directory del progetto**
```bash
cd "C:\Users\PC Simo\Documents\GitHub\Business-HACCP-manager"
vercel
```

### **3.2 Rispondi alle domande:**
- **Set up and deploy**: `Y`
- **Which scope**: Seleziona il tuo account
- **Link to existing project**: `N`
- **Project name**: `business-haccp-manager`
- **In which directory is your code located**: `./` (premi Enter)
- **Want to override the settings**: `N`

### **3.3 Aspetta il deploy**
- **Vercel** farà il build automaticamente
- **Ti darà** un URL tipo: `https://business-haccp-manager.vercel.app`

---

## **🎯 PASSO 4: Verifica**

1. **Clicca** sull'URL fornito
2. **Testa** l'app:
   - ✅ Login funziona
   - ✅ Tutte le sezioni accessibili
   - ✅ PWA installabile

---

## **📱 PASSO 5: Installazione Telefono**

### **Android (Chrome):**
1. Apri l'URL Vercel su Chrome
2. Aspetta 2-3 secondi
3. Tocca "Aggiungi alla schermata Home"
4. Conferma installazione

### **iPhone (Safari):**
1. Apri l'URL Vercel su Safari
2. Tocca il pulsante Condividi
3. Seleziona "Aggiungi alla schermata Home"
4. Tocca "Aggiungi"

---

## **🔄 Aggiornamenti**

### **Deploy nuovo build:**
```bash
npm run build
vercel --prod
```

### **Deploy preview:**
```bash
vercel
```

---

## **✅ Vantaggi Vercel CLI**

- ✅ **No Git** richiesto
- ✅ **Deploy** da terminale
- ✅ **Build automatico**
- ✅ **HTTPS automatico**
- ✅ **CDN globale**
- ✅ **Analytics incluse**

---

## **🔧 Se qualcosa non funziona:**

### **Login fallisce:**
- Verifica connessione internet
- Prova `vercel logout` e poi `vercel login`
- Controlla che l'account Vercel sia attivo

### **Deploy fallisce:**
- Verifica che `npm run build` funzioni
- Controlla i log di errore
- Assicurati di essere nella directory giusta

### **App non si installa:**
- Verifica che l'URL inizi con `https://`
- Cancella cache del browser
- Prova un browser diverso

---

## **📊 Dashboard Vercel**

- **Vai su**: https://vercel.com/dashboard
- **Trova** il tuo progetto
- **Gestisci** domini, analytics, settings

---

**🎯 Vercel CLI è perfetto per deploy senza Git!** 🚀📱 