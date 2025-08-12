# 📚 Documentazione Lavori Svolti

Questa cartella contiene tutta la documentazione dei lavori svolti sul codice, organizzata per facilitare la gestione e la rimozione futura.

## 🗂️ Struttura Organizzativa

```
docs/
├── README.md                    # Questo file - guida alla documentazione
├── .gitignore                   # Gestione file temporanei
└── jobs/                        # Tutti i lavori svolti
    ├── README.md                # Guida per IA e sviluppatori
    ├── normal/                  # Lavori normali di sviluppo
    │   └── [nome-lavoro]/       # Cartella per ogni lavoro specifico
    └── night/                   # Lavori notturni (Night Job)
        └── haccp-2025-12-08/    # Night Job HACCP specifico
            ├── NIGHT_RUN_LOG.md # Log dettagliato esecuzione
            └── HACCP_Report_ASL.md # Report ASL generato
```

## 🧹 Gestione e Pulizia

### Per Rimuovere Tutta la Documentazione:
```bash
# Rimuove tutta la cartella docs e il suo contenuto
rm -rf docs/
```

### Per Rimuovere Solo i Lavori:
```bash
# Rimuove solo la cartella jobs
rm -rf docs/jobs/

# Rimuove solo i lavori notturni
rm -rf docs/jobs/night/

# Rimuove solo i lavori normali
rm -rf docs/jobs/normal/
```

## 📝 Tipi di Documentazione

- **Lavori Normali**: Sviluppi, bugfix, feature aggiuntive
- **Night Job**: Lavori notturni intensivi con priorità specifiche
- **Log di Esecuzione**: Tracciano i lavori svolti passo-passo
- **Report**: Documentazione tecnica e compliance
- **Template**: Modelli per report futuri

## ⚠️ Importante

Questa documentazione è **separata dal codice** e può essere rimossa in qualsiasi momento senza impattare il funzionamento dell'applicazione.

---

*Ultimo aggiornamento: 08/12/2025*
*Generato da: Night Job HACCP*
