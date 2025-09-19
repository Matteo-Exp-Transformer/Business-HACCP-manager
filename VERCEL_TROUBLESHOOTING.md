# 🔧 Vercel Deployment Troubleshooting Guide

**Project:** HACCP Business Manager  
**Branch:** BHM-v.2  
**Last Updated:** September 19, 2025

---

## 🚨 **PROBLEMI IDENTIFICATI DAL TERMINAL**

### **❌ Errore: "functions" property cannot be used with "builds"**
**Causa**: Vercel.json aveva proprietà deprecated
**✅ RISOLTO**: Rimosso `builds` e `functions` dal vercel.json

### **📝 Nome Progetto**: 
**Era**: "bhm-v.2"  
**Ora**: "haccp-business-manager"

---

## ✅ **CONFIGURAZIONE CORRETTA VERCEL**

### **📄 vercel.json (Produzione):**
```json
{
  "version": 2,
  "name": "haccp-business-manager",
  "buildCommand": "npm run build:prod",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": "docs"
}
```

### **📄 vercel-staging.json (Staging):**
```json
{
  "version": 2,
  "name": "haccp-business-manager-staging", 
  "buildCommand": "npm run build:staging",
  "outputDirectory": "docs"
}
```

---

## 🚀 **DEPLOY COMMANDS CORRETTI**

### **Local Testing:**
```bash
# Test build locale
npm run build:prod     # ✅ Build produzione
npm run preview        # ✅ Preview su :4173

# Test deploy script
node scripts/deploy.js prod  # ✅ Deploy manuale
```

### **Vercel CLI (Se installato):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy manuale
vercel --prod          # Deploy produzione
vercel                 # Deploy preview
```

### **GitHub Auto-Deploy:**
```bash
# Deploy staging automatico
git push origin BHM-v.2

# Deploy produzione automatico  
git push origin main-precompilato
```

---

## 🔍 **VERIFICA DEPLOY FUNZIONANTE**

### **✅ Checklist Post-Deploy:**

1. **📄 File Deploy Force**: 
   ```javascript
   fetch('/deploy-force.txt').then(r=>r.text()).then(console.log)
   // Dovrebbe mostrare: "DEPLOY SYSTEM V2.0"
   ```

2. **📊 Build Info API**:
   ```javascript
   fetch('/build-info.json').then(r=>r.json()).then(console.log)
   // Dovrebbe mostrare commit attuale e build ID
   ```

3. **🎯 Features Check**:
   - BuildInfoPanel visibile in dev mode
   - Console logs dettagliati
   - Chunk loading ottimizzato
   - PWA manifest accessibile

### **🔧 Se Deploy Fallisce:**

#### **Opzione 1: Riconnetti Progetto**
1. Vai su [vercel.com](https://vercel.com)
2. Disconnetti repository GitHub
3. Ricrea progetto con nome "haccp-business-manager"
4. Riconnetti repository
5. Configura environment variables

#### **Opzione 2: Force Deploy**
```bash
# Modifica deploy-force.txt per forzare nuovo deploy
echo "FORCE_DEPLOY_$(date +%s)" >> docs/deploy-force.txt
git add docs/deploy-force.txt
git commit -m "force: Trigger new deployment"
git push origin BHM-v.2
```

#### **Opzione 3: Manual Deploy**
```bash
# Build locale e upload manuale
npm run build:prod
# Poi upload manuale su Vercel dashboard
```

---

## 📊 **ENVIRONMENT VARIABLES RICHIESTE**

### **🔑 Vercel Dashboard → Settings → Environment Variables:**

#### **Development:**
```env
VITE_APP_ENV=development
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_dev_key
VITE_SUPABASE_URL=your_dev_supabase_url
VITE_SUPABASE_ANON_KEY=your_dev_anon_key
```

#### **Staging:**
```env
VITE_APP_ENV=staging
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_staging_key
VITE_SUPABASE_URL=your_staging_supabase_url
VITE_SUPABASE_ANON_KEY=your_staging_anon_key
```

#### **Production:**
```env
VITE_APP_ENV=production
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_prod_key
VITE_SUPABASE_URL=your_prod_supabase_url
VITE_SUPABASE_ANON_KEY=your_prod_anon_key
VITE_SENTRY_DSN=your_prod_sentry_dsn
```

---

## 🎯 **STATO ATTUALE**

### **✅ DEPLOY SYSTEM V2.0 - READY**

- **Build System**: Multi-ambiente configurato ✅
- **Version Tracking**: Automatico con git ✅
- **Vercel Config**: Corretto e semplificato ✅
- **Performance**: Code splitting attivo ✅
- **Monitoring**: Debug e tracking completo ✅

### **📋 PROSSIMI PASSI:**

1. **Vercel Account Setup**: Configura environment variables
2. **Test Deploy**: Pusha per attivare auto-deploy
3. **Verifica Live**: Controlla `/deploy-force.txt` e `/build-info.json`
4. **Monitor**: Usa BuildInfoPanel per tracking

---

**🚀 IL SISTEMA DI DEPLOY È COMPLETAMENTE CONFIGURATO E PRONTO!**