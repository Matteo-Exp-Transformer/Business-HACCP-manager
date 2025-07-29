/**
 * 🎤 SISTEMA CONTROLLO VOCALE HACCP
 * Il primo sistema vocale per HACCP in italiano
 * Comandi naturali per environment cucina
 */

class HACCPVoiceControl {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.isSupported = false;
        this.commands = this.initializeCommands();
        this.currentMode = 'standby'; // standby, listening, processing
        
        this.init();
    }

    init() {
        this.checkBrowserSupport();
        this.setupRecognition();
        this.setupUI();
        this.setupEventListeners();
        
        console.log('🎤 Sistema Controllo Vocale HACCP inizializzato');
    }

    checkBrowserSupport() {
        // Controllo supporto browser per riconoscimento vocale
        if ('webkitSpeechRecognition' in window) {
            this.isSupported = true;
            this.SpeechRecognition = window.webkitSpeechRecognition;
        } else if ('SpeechRecognition' in window) {
            this.isSupported = true;
            this.SpeechRecognition = window.SpeechRecognition;
        } else {
            this.isSupported = false;
            console.warn('⚠️ Riconoscimento vocale non supportato in questo browser');
        }
    }

    setupRecognition() {
        if (!this.isSupported) return;

        this.recognition = new this.SpeechRecognition();
        
        // Configurazione per ambiente cucina
        this.recognition.continuous = false; // Un comando alla volta
        this.recognition.interimResults = true; // Risultati in tempo reale
        this.recognition.lang = 'it-IT'; // Italiano
        this.recognition.maxAlternatives = 3; // Alternative per accuratezza

        // Eventi riconoscimento vocale
        this.recognition.onstart = () => {
            console.log('🎤 Ascolto iniziato...');
            this.currentMode = 'listening';
            this.updateUI();
        };

        this.recognition.onresult = (event) => {
            this.handleVoiceResult(event);
        };

        this.recognition.onerror = (event) => {
            console.error('❌ Errore riconoscimento vocale:', event.error);
            this.handleVoiceError(event.error);
        };

        this.recognition.onend = () => {
            console.log('🎤 Ascolto terminato');
            this.currentMode = 'standby';
            this.isListening = false;
            this.updateUI();
        };
    }

    setupUI() {
        // Crea interfaccia controllo vocale
        const voiceUI = document.createElement('div');
        voiceUI.id = 'voice-control-ui';
        voiceUI.className = 'fixed bottom-20 right-4 z-50';
        voiceUI.innerHTML = `
            <!-- Pulsante Microfono Principale -->
            <div id="voice-main-button" class="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg cursor-pointer transition-all duration-300 mb-4" style="width: 64px; height: 64px; display: flex; align-items: center; justify-content: center;">
                <span id="voice-icon" class="text-xl">🎤</span>
            </div>
            
            <!-- Pannello Comandi Vocali -->
            <div id="voice-panel" class="bg-white rounded-lg shadow-xl p-4 mb-4 hidden" style="width: 300px;">
                <h3 class="font-bold text-gray-800 mb-3 text-center">🎤 Controllo Vocale</h3>
                
                <!-- Status -->
                <div id="voice-status" class="text-center mb-3">
                    <span class="inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                        Pronto all'ascolto
                    </span>
                </div>
                
                <!-- Trascrizione Live -->
                <div id="voice-transcript" class="bg-gray-50 p-3 rounded-lg mb-3 min-h-12 text-sm">
                    <span class="text-gray-500 italic">I tuoi comandi appariranno qui...</span>
                </div>
                
                <!-- Esempi Comandi -->
                <div class="text-xs text-gray-600 mb-3">
                    <div class="font-semibold mb-1">Esempi comandi:</div>
                    <div>"Temperatura frigorifero 2 gradi"</div>
                    <div>"Pulizia banco lavoro completata"</div>
                    <div>"Note: controllare guarnizione"</div>
                </div>
                
                <!-- Controlli -->
                <div class="flex space-x-2">
                    <button id="voice-start" class="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700">
                        Inizia
                    </button>
                    <button id="voice-stop" class="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700">
                        Stop
                    </button>
                    <button id="voice-help" class="bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700">
                        ?
                    </button>
                </div>
            </div>
            
            <!-- Modal Aiuto -->
            <div id="voice-help-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-lg max-w-md w-full p-6">
                    <h3 class="text-lg font-bold mb-4">🎤 Guida Controllo Vocale</h3>
                    <div class="space-y-3 text-sm">
                        <div>
                            <strong>Temperature:</strong><br>
                            "Temperatura [posizione] [valore] gradi"<br>
                            <em>Es: "Temperatura frigorifero 2 gradi"</em>
                        </div>
                        <div>
                            <strong>Pulizie:</strong><br>
                            "Pulizia [cosa] completata"<br>
                            <em>Es: "Pulizia banco lavoro completata"</em>
                        </div>
                        <div>
                            <strong>Note:</strong><br>
                            "Note: [descrizione]"<br>
                            <em>Es: "Note: controllare guarnizione porta"</em>
                        </div>
                        <div>
                            <strong>Consegne:</strong><br>
                            "Consegna [fornitore] ricevuta"<br>
                            <em>Es: "Consegna verdure fresche ricevuta"</em>
                        </div>
                    </div>
                    <button id="close-help" class="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        Chiudi
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(voiceUI);
    }

    setupEventListeners() {
        // Pulsante principale
        document.getElementById('voice-main-button').addEventListener('click', () => {
            this.togglePanel();
        });

        // Controlli pannello
        document.getElementById('voice-start').addEventListener('click', () => {
            this.startListening();
        });

        document.getElementById('voice-stop').addEventListener('click', () => {
            this.stopListening();
        });

        document.getElementById('voice-help').addEventListener('click', () => {
            this.showHelp();
        });

        document.getElementById('close-help').addEventListener('click', () => {
            this.hideHelp();
        });

        // Scorciatoia tastiera
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                this.toggleListening();
            }
        });
    }

    initializeCommands() {
        return {
            // Comandi Temperature
            temperature: {
                patterns: [
                    /temperatura\s+(\w+)\s+(\d+(?:[.,]\d+)?)\s*grad[io]/i,
                    /temp\s+(\w+)\s+(\d+(?:[.,]\d+)?)/i,
                    /(\w+)\s+(\d+(?:[.,]\d+)?)\s*grad[io]/i
                ],
                handler: this.handleTemperatureCommand.bind(this)
            },
            
            // Comandi Pulizie
            cleaning: {
                patterns: [
                    /pulizia\s+(.+?)\s+(completata|finita|fatta)/i,
                    /pulito\s+(.+)/i,
                    /completata?\s+pulizia\s+(.+)/i
                ],
                handler: this.handleCleaningCommand.bind(this)
            },
            
            // Note Vocali
            notes: {
                patterns: [
                    /note?\s*:\s*(.+)/i,
                    /annota\s+(.+)/i,
                    /promemoria\s+(.+)/i
                ],
                handler: this.handleNoteCommand.bind(this)
            },
            
            // Comandi Consegne
            delivery: {
                patterns: [
                    /consegna\s+(.+?)\s+(ricevuta|arrivata)/i,
                    /ricevuto\s+(.+)/i,
                    /arrivato\s+(.+)/i
                ],
                handler: this.handleDeliveryCommand.bind(this)
            }
        };
    }

    togglePanel() {
        const panel = document.getElementById('voice-panel');
        panel.classList.toggle('hidden');
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (!this.isSupported) {
            this.showNotification('❌ Riconoscimento vocale non supportato', 'error');
            return;
        }

        if (this.isListening) return;

        try {
            this.isListening = true;
            this.recognition.start();
            this.showNotification('🎤 Ascolto attivo - parla ora', 'info');
        } catch (error) {
            console.error('Errore avvio riconoscimento:', error);
            this.isListening = false;
            this.showNotification('❌ Errore avvio microfono', 'error');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.showNotification('🔇 Ascolto interrotto', 'warning');
        }
    }

    handleVoiceResult(event) {
        let transcript = '';
        let isFinal = false;

        // Estrai trascrizione
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                isFinal = true;
            }
        }

        // Aggiorna UI in tempo reale
        this.updateTranscript(transcript, isFinal);

        // Processa comando solo se finale
        if (isFinal) {
            this.processVoiceCommand(transcript.trim());
        }
    }

    handleVoiceError(error) {
        let message = '❌ Errore riconoscimento vocale';
        
        switch (error) {
            case 'no-speech':
                message = '🔇 Nessun audio rilevato';
                break;
            case 'audio-capture':
                message = '🎤 Problema accesso microfono';
                break;
            case 'not-allowed':
                message = '❌ Permesso microfono negato';
                break;
            case 'network':
                message = '🌐 Problema connessione';
                break;
        }
        
        this.showNotification(message, 'error');
        this.currentMode = 'standby';
        this.updateUI();
    }

    updateTranscript(transcript, isFinal) {
        const transcriptEl = document.getElementById('voice-transcript');
        if (isFinal) {
            transcriptEl.innerHTML = `<strong>Comando:</strong> "${transcript}"`;
            transcriptEl.className = 'bg-blue-50 p-3 rounded-lg mb-3 min-h-12 text-sm border border-blue-200';
        } else {
            transcriptEl.innerHTML = `<em>Ascolto:</em> "${transcript}"`;
            transcriptEl.className = 'bg-yellow-50 p-3 rounded-lg mb-3 min-h-12 text-sm border border-yellow-200';
        }
    }

    updateUI() {
        const icon = document.getElementById('voice-icon');
        const button = document.getElementById('voice-main-button');
        const status = document.getElementById('voice-status');

        switch (this.currentMode) {
            case 'listening':
                icon.textContent = '🔴';
                button.className = 'bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg cursor-pointer transition-all duration-300 mb-4 animate-pulse';
                status.innerHTML = '<span class="inline-block px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">🎤 In ascolto...</span>';
                break;
            case 'processing':
                icon.textContent = '⚙️';
                button.className = 'bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-full shadow-lg cursor-pointer transition-all duration-300 mb-4';
                status.innerHTML = '<span class="inline-block px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">⚙️ Elaborazione...</span>';
                break;
            default:
                icon.textContent = '🎤';
                button.className = 'bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg cursor-pointer transition-all duration-300 mb-4';
                status.innerHTML = '<span class="inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">Pronto all\'ascolto</span>';
        }
    }

    processVoiceCommand(transcript) {
        console.log('🎤 Processando comando:', transcript);
        this.currentMode = 'processing';
        this.updateUI();

        // Cerca pattern corrispondente
        let commandFound = false;

        for (const [commandType, commandConfig] of Object.entries(this.commands)) {
            for (const pattern of commandConfig.patterns) {
                const match = transcript.match(pattern);
                if (match) {
                    console.log(`✅ Comando ${commandType} riconosciuto:`, match);
                    commandConfig.handler(match, transcript);
                    commandFound = true;
                    break;
                }
            }
            if (commandFound) break;
        }

        if (!commandFound) {
            this.handleUnknownCommand(transcript);
        }

        // Ritorna in standby
        setTimeout(() => {
            this.currentMode = 'standby';
            this.updateUI();
        }, 2000);
    }

    // HANDLERS COMANDI SPECIFICI

    handleTemperatureCommand(match, transcript) {
        const location = match[1] || 'Posizione non specificata';
        const temperature = parseFloat(match[2].replace(',', '.'));

        console.log(`🌡️ Comando temperatura: ${location} = ${temperature}°C`);

        // Valida temperatura
        if (isNaN(temperature) || temperature < -50 || temperature > 50) {
            this.showNotification('❌ Temperatura non valida', 'error');
            return;
        }

        // Crea oggetto temperatura
        let temperatureData = {
            location: this.normalizeLocation(location),
            temperature: temperature,
            time: new Date().toLocaleString('it-IT'),
            source: 'voice',
            transcript: transcript
        };

        // Valida con sistema esistente
        if (window.HACCPValidator) {
            const validation = window.HACCPValidator.validateTemperature(temperatureData);
            if (!validation.isValid) {
                this.showNotification(`❌ Validazione fallita: ${validation.errors.join(', ')}`, 'error');
                return;
            }
            temperatureData = validation.sanitized;
        }

        // Salva con sistema sicuro
        if (window.HACCPStorage) {
            window.HACCPStorage.saveData('temperatures', temperatureData).then(result => {
                if (result.success) {
                    this.showNotification(`✅ Temperatura registrata: ${location} ${temperature}°C`, 'success');
                    this.updateTemperatureUI(temperatureData);
                } else {
                    this.showNotification('❌ Errore salvataggio temperatura', 'error');
                }
            });
        } else {
            // Fallback localStorage
            this.saveToLocalStorage('temperatures', temperatureData);
            this.showNotification(`✅ Temperatura registrata: ${location} ${temperature}°C`, 'success');
        }
    }

    handleCleaningCommand(match, transcript) {
        const task = match[1] || 'Attività non specificata';
        const status = match[2] || 'completata';

        console.log(`🧹 Comando pulizia: ${task} = ${status}`);

        const cleaningData = {
            task: this.normalizeText(task),
            assignee: 'Utente Vocale',
            completed: true,
            date: new Date().toLocaleDateString('it-IT'),
            completedAt: new Date().toLocaleString('it-IT'),
            source: 'voice',
            transcript: transcript
        };

        // Salva pulizia
        if (window.HACCPStorage) {
            window.HACCPStorage.saveData('cleaning', cleaningData).then(result => {
                if (result.success) {
                    this.showNotification(`✅ Pulizia registrata: ${task}`, 'success');
                } else {
                    this.showNotification('❌ Errore salvataggio pulizia', 'error');
                }
            });
        } else {
            this.saveToLocalStorage('cleaning', cleaningData);
            this.showNotification(`✅ Pulizia registrata: ${task}`, 'success');
        }
    }

    handleNoteCommand(match, transcript) {
        const noteText = match[1] || transcript;

        console.log(`📝 Comando nota: ${noteText}`);

        const noteData = {
            text: this.normalizeText(noteText),
            timestamp: new Date().toLocaleString('it-IT'),
            source: 'voice',
            transcript: transcript,
            type: 'voice_note'
        };

        // Salva nota
        this.saveToLocalStorage('voice_notes', noteData);
        this.showNotification(`✅ Nota vocale salvata`, 'success');
        
        // Mostra nota nel pannello
        this.showVoiceNote(noteData);
    }

    handleDeliveryCommand(match, transcript) {
        const supplier = match[1] || 'Fornitore non specificato';

        console.log(`📦 Comando consegna: ${supplier}`);

        const deliveryData = {
            supplier: this.normalizeText(supplier),
            timestamp: new Date().toLocaleString('it-IT'),
            status: 'received',
            source: 'voice',
            transcript: transcript
        };

        // Salva consegna
        if (window.HACCPStorage) {
            window.HACCPStorage.saveData('deliveries', deliveryData).then(result => {
                if (result.success) {
                    this.showNotification(`✅ Consegna registrata: ${supplier}`, 'success');
                } else {
                    this.showNotification('❌ Errore salvataggio consegna', 'error');
                }
            });
        } else {
            this.saveToLocalStorage('deliveries', deliveryData);
            this.showNotification(`✅ Consegna registrata: ${supplier}`, 'success');
        }
    }

    handleUnknownCommand(transcript) {
        console.log('❓ Comando non riconosciuto:', transcript);
        
        // Salva comando sconosciuto per miglioramenti futuri
        const unknownCommand = {
            transcript: transcript,
            timestamp: new Date().toLocaleString('it-IT')
        };
        
        this.saveToLocalStorage('unknown_commands', unknownCommand);
        
        this.showNotification('❓ Comando non riconosciuto. Riprova o usa il pannello aiuto.', 'warning');
    }

    // UTILITY FUNCTIONS

    normalizeLocation(location) {
        const locationMap = {
            'frigo': 'Frigorifero',
            'frigorifero': 'Frigorifero',
            'freezer': 'Congelatore',
            'congelatore': 'Congelatore',
            'banco': 'Banco lavoro',
            'forno': 'Forno',
            'cucina': 'Cucina',
            'sala': 'Sala'
        };

        const normalized = location.toLowerCase().trim();
        return locationMap[normalized] || this.capitalizeFirst(location);
    }

    normalizeText(text) {
        return text.trim()
            .replace(/\s+/g, ' ')
            .replace(/^\w/, c => c.toUpperCase());
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    saveToLocalStorage(key, data) {
        try {
            const existing = JSON.parse(localStorage.getItem(`haccp-${key}`) || '[]');
            existing.push({ ...data, id: Date.now() });
            localStorage.setItem(`haccp-${key}`, JSON.stringify(existing));
        } catch (error) {
            console.error('Errore salvataggio localStorage:', error);
        }
    }

    updateTemperatureUI(data) {
        // Aggiorna UI temperature se presente
        const event = new CustomEvent('temperatureAdded', { detail: data });
        document.dispatchEvent(event);
    }

    showVoiceNote(noteData) {
        // Crea popup temporaneo per nota vocale
        const notePopup = document.createElement('div');
        notePopup.className = 'fixed top-4 left-4 bg-blue-100 border border-blue-300 p-4 rounded-lg shadow-lg max-w-sm z-50';
        notePopup.innerHTML = `
            <div class="flex items-start">
                <span class="text-blue-600 mr-2">📝</span>
                <div>
                    <strong class="text-blue-800">Nota vocale:</strong>
                    <p class="text-blue-700 mt-1">${noteData.text}</p>
                    <small class="text-blue-600">${noteData.timestamp}</small>
                </div>
            </div>
        `;

        document.body.appendChild(notePopup);
        
        setTimeout(() => {
            if (notePopup.parentElement) {
                notePopup.remove();
            }
        }, 5000);
    }

    showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-100 border-green-400 text-green-700',
            error: 'bg-red-100 border-red-400 text-red-700',
            warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
            info: 'bg-blue-100 border-blue-400 text-blue-700'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} border px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm`;
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${message}</span>
                <button class="ml-2 opacity-75 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }

    showHelp() {
        document.getElementById('voice-help-modal').classList.remove('hidden');
    }

    hideHelp() {
        document.getElementById('voice-help-modal').classList.add('hidden');
    }

    // API PUBBLICA

    getVoiceStats() {
        return {
            isSupported: this.isSupported,
            isListening: this.isListening,
            currentMode: this.currentMode,
            commandsProcessed: this.commandsProcessed || 0
        };
    }

    getUnknownCommands() {
        try {
            return JSON.parse(localStorage.getItem('haccp-unknown_commands') || '[]');
        } catch {
            return [];
        }
    }

    clearUnknownCommands() {
        localStorage.removeItem('haccp-unknown_commands');
    }
}

// Inizializza controllo vocale quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aspetta che i sistemi di sicurezza siano caricati
    setTimeout(() => {
        window.HACCPVoice = new HACCPVoiceControl();
        console.log('🎤 Sistema Controllo Vocale HACCP attivo!');
        
        // Notifica di benvenuto
        setTimeout(() => {
            if (window.HACCPVoice.isSupported) {
                window.HACCPVoice.showNotification('🎤 Controllo vocale attivo! Premi Ctrl+M o clicca il microfono', 'success');
            } else {
                window.HACCPVoice.showNotification('⚠️ Controllo vocale non supportato in questo browser', 'warning');
            }
        }, 2000);
    }, 1000);
});

console.log('🎤 Modulo Controllo Vocale HACCP caricato - Prima app HACCP vocale al mondo!');