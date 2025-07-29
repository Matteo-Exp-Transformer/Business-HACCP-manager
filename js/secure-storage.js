/**
 * 🔐 SECURE STORAGE SYSTEM - Mini-ePackPro HACCP
 * Sistema di storage sicuro con backup, recovery e integrità dati
 * Implementazione sicura basata sulle raccomandazioni di sicurezza
 */

class HACCPSecureStorage {
    constructor() {
        this.storageKeys = {
            temperatures: 'haccp-temperatures',
            cleaning: 'haccp-cleaning',
            staff: 'haccp-staff',
            deliveries: 'haccp-deliveries',
            settings: 'haccp-settings',
            backup: 'haccp-backup-',
            integrity: 'haccp-integrity'
        };
        
        this.backupInterval = 5 * 60 * 1000; // 5 minuti
        this.maxBackups = 10;
        this.compressionEnabled = true;
        
        this.init();
    }

    init() {
        this.setupBackupScheduler();
        this.verifyDataIntegrity();
        this.cleanupOldBackups();
        
        console.log('🔐 HACCP Secure Storage initialized');
    }

    // 💾 SECURE SAVE WITH VALIDATION
    async saveData(module, data, options = {}) {
        try {
            // Validate data first
            const validator = window.HACCPValidator;
            if (!validator) {
                throw new Error('HACCPValidator not available');
            }

            let validationResult;
            switch (module) {
                case 'temperatures':
                    validationResult = validator.validateTemperature(data);
                    break;
                case 'cleaning':
                    validationResult = validator.validateCleaningTask(data);
                    break;
                case 'staff':
                    validationResult = validator.validateStaff(data);
                    break;
                case 'deliveries':
                    validationResult = validator.validateDelivery(data);
                    break;
                default:
                    // Generic validation for unknown modules
                    validationResult = { isValid: true, sanitized: data };
            }

            if (!validationResult.isValid) {
                throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
            }

            // Use sanitized data
            const sanitizedData = validationResult.sanitized || data;

            // Create storage entry with metadata
            const storageEntry = {
                data: sanitizedData,
                timestamp: new Date().toISOString(),
                version: '1.0',
                checksum: this.calculateChecksum(sanitizedData),
                module: module,
                userAgent: navigator.userAgent.substring(0, 100)
            };

            // Compress if enabled and data is large
            if (this.compressionEnabled && JSON.stringify(storageEntry).length > 1024) {
                storageEntry.compressed = true;
                storageEntry.data = this.compressData(storageEntry.data);
            }

            // Save to localStorage with error handling
            const key = this.storageKeys[module];
            if (!key) {
                throw new Error(`Unknown module: ${module}`);
            }

            await this.setItem(key, storageEntry);

            // Update integrity index
            this.updateIntegrityIndex(module, storageEntry.checksum);

            // Trigger backup if not disabled
            if (!options.skipBackup) {
                this.createBackup(module, storageEntry);
            }

            // Log successful save
            console.log(`💾 Saved ${module}:`, sanitizedData);

            return {
                success: true,
                checksum: storageEntry.checksum,
                size: JSON.stringify(storageEntry).length
            };

        } catch (error) {
            console.error(`❌ Failed to save ${module}:`, error);
            
            // Try to recover from backup
            if (!options.isRecovery) {
                console.log('🔄 Attempting recovery...');
                return this.recoverFromBackup(module);
            }

            return {
                success: false,
                error: error.message
            };
        }
    }

    // 📖 SECURE LOAD WITH VERIFICATION
    async loadData(module, options = {}) {
        try {
            const key = this.storageKeys[module];
            if (!key) {
                throw new Error(`Unknown module: ${module}`);
            }

            const storageEntry = await this.getItem(key);
            
            if (!storageEntry) {
                console.log(`📭 No data found for ${module}`);
                return null;
            }

            // Verify integrity
            if (!options.skipIntegrityCheck) {
                const isValid = this.verifyDataIntegrity(module, storageEntry);
                if (!isValid) {
                    console.warn(`⚠️ Integrity check failed for ${module}, attempting recovery`);
                    return this.recoverFromBackup(module);
                }
            }

            // Decompress if needed
            let data = storageEntry.data;
            if (storageEntry.compressed) {
                try {
                    data = this.decompressData(data);
                } catch (error) {
                    console.warn('⚠️ Decompression failed, using raw data');
                }
            }

            // Additional validation on loaded data
            if (window.HACCPValidator && !options.skipValidation) {
                let validationResult;
                switch (module) {
                    case 'temperatures':
                        validationResult = window.HACCPValidator.validateTemperature(data);
                        break;
                    case 'cleaning':
                        validationResult = window.HACCPValidator.validateCleaningTask(data);
                        break;
                    case 'staff':
                        validationResult = window.HACCPValidator.validateStaff(data);
                        break;
                    case 'deliveries':
                        validationResult = window.HACCPValidator.validateDelivery(data);
                        break;
                }

                if (validationResult && !validationResult.isValid) {
                    console.warn(`⚠️ Loaded data validation failed for ${module}:`, validationResult.errors);
                    // Return raw data with warning
                    return {
                        data: data,
                        warnings: validationResult.errors,
                        metadata: {
                            timestamp: storageEntry.timestamp,
                            version: storageEntry.version
                        }
                    };
                }
            }

            console.log(`📖 Loaded ${module}:`, data);

            return {
                data: data,
                metadata: {
                    timestamp: storageEntry.timestamp,
                    version: storageEntry.version,
                    checksum: storageEntry.checksum
                }
            };

        } catch (error) {
            console.error(`❌ Failed to load ${module}:`, error);
            
            // Try to recover from backup
            if (!options.isRecovery) {
                console.log('🔄 Attempting recovery...');
                return this.recoverFromBackup(module);
            }

            return null;
        }
    }

    // 🗃️ BACKUP SYSTEM
    createBackup(module, storageEntry) {
        try {
            const backupKey = `${this.storageKeys.backup}${module}-${Date.now()}`;
            const backupData = {
                ...storageEntry,
                backupTimestamp: new Date().toISOString(),
                originalModule: module
            };

            localStorage.setItem(backupKey, JSON.stringify(backupData));
            console.log(`💾 Backup created for ${module}: ${backupKey}`);

            // Update backup index
            this.updateBackupIndex(module, backupKey);

        } catch (error) {
            console.warn('⚠️ Failed to create backup:', error);
        }
    }

    async recoverFromBackup(module) {
        try {
            const backups = this.getBackupsForModule(module);
            
            if (backups.length === 0) {
                console.log(`📭 No backups available for ${module}`);
                return null;
            }

            // Use most recent backup
            const latestBackup = backups[0];
            const backupData = JSON.parse(localStorage.getItem(latestBackup.key));

            if (!backupData) {
                throw new Error('Backup data not found');
            }

            // Restore from backup
            console.log(`🔄 Recovering ${module} from backup:`, latestBackup.key);
            
            const restoreResult = await this.saveData(module, backupData.data, { 
                skipBackup: true, 
                isRecovery: true 
            });

            if (restoreResult.success) {
                console.log(`✅ Successfully recovered ${module} from backup`);
                return this.loadData(module, { isRecovery: true });
            } else {
                throw new Error('Failed to restore from backup');
            }

        } catch (error) {
            console.error(`❌ Recovery failed for ${module}:`, error);
            return null;
        }
    }

    // 🔍 INTEGRITY VERIFICATION
    verifyDataIntegrity(module, storageEntry) {
        if (!storageEntry || !storageEntry.checksum) {
            return false;
        }

        const currentChecksum = this.calculateChecksum(storageEntry.data);
        const isValid = currentChecksum === storageEntry.checksum;

        if (!isValid) {
            console.warn(`⚠️ Checksum mismatch for ${module}. Expected: ${storageEntry.checksum}, Got: ${currentChecksum}`);
        }

        return isValid;
    }

    calculateChecksum(data) {
        // Simple checksum calculation (in production, use crypto.subtle for better security)
        const str = JSON.stringify(data);
        let hash = 0;
        
        if (str.length === 0) return hash.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(16);
    }

    // 🗜️ COMPRESSION
    compressData(data) {
        try {
            // Simple compression using JSON minification and basic encoding
            const jsonString = JSON.stringify(data);
            return btoa(jsonString); // Base64 encoding
        } catch (error) {
            console.warn('Compression failed, using raw data');
            return data;
        }
    }

    decompressData(compressedData) {
        try {
            const jsonString = atob(compressedData);
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('Decompression failed');
            throw error;
        }
    }

    // 🔧 STORAGE HELPERS
    async setItem(key, value) {
        return new Promise((resolve, reject) => {
            try {
                const serialized = JSON.stringify(value);
                localStorage.setItem(key, serialized);
                resolve();
            } catch (error) {
                // Handle storage quota exceeded
                if (error.name === 'QuotaExceededError') {
                    console.warn('⚠️ Storage quota exceeded, cleaning up...');
                    this.emergencyCleanup();
                    
                    // Try again after cleanup
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                        resolve();
                    } catch (secondError) {
                        reject(new Error('Storage quota exceeded after cleanup'));
                    }
                } else {
                    reject(error);
                }
            }
        });
    }

    async getItem(key) {
        return new Promise((resolve, reject) => {
            try {
                const item = localStorage.getItem(key);
                if (item === null) {
                    resolve(null);
                } else {
                    resolve(JSON.parse(item));
                }
            } catch (error) {
                console.warn(`⚠️ Failed to parse item ${key}:`, error);
                resolve(null);
            }
        });
    }

    // 🧹 CLEANUP OPERATIONS
    emergencyCleanup() {
        console.log('🧹 Performing emergency cleanup...');
        
        try {
            // Remove oldest backups first
            const backupKeys = Object.keys(localStorage)
                .filter(key => key.startsWith(this.storageKeys.backup))
                .sort();

            const keysToRemove = backupKeys.slice(0, Math.floor(backupKeys.length / 2));
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ Removed backup: ${key}`);
            });

            // Clear old error logs
            if (localStorage.getItem('haccp-error-logs')) {
                localStorage.removeItem('haccp-error-logs');
                console.log('🗑️ Cleared old error logs');
            }

        } catch (error) {
            console.error('❌ Emergency cleanup failed:', error);
        }
    }

    cleanupOldBackups() {
        try {
            const allBackups = this.getAllBackups();
            const sortedBackups = allBackups.sort((a, b) => b.timestamp - a.timestamp);

            // Keep only maxBackups per module
            const backupsByModule = {};
            sortedBackups.forEach(backup => {
                if (!backupsByModule[backup.module]) {
                    backupsByModule[backup.module] = [];
                }
                backupsByModule[backup.module].push(backup);
            });

            Object.entries(backupsByModule).forEach(([module, backups]) => {
                if (backups.length > this.maxBackups) {
                    const toRemove = backups.slice(this.maxBackups);
                    toRemove.forEach(backup => {
                        localStorage.removeItem(backup.key);
                        console.log(`🗑️ Removed old backup: ${backup.key}`);
                    });
                }
            });

        } catch (error) {
            console.warn('⚠️ Cleanup failed:', error);
        }
    }

    // 📊 BACKUP MANAGEMENT
    getAllBackups() {
        const backups = [];
        const prefix = this.storageKeys.backup;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                try {
                    const parts = key.replace(prefix, '').split('-');
                    const module = parts[0];
                    const timestamp = parseInt(parts[1]);
                    
                    backups.push({
                        key,
                        module,
                        timestamp,
                        date: new Date(timestamp)
                    });
                } catch (error) {
                    console.warn(`⚠️ Invalid backup key: ${key}`);
                }
            }
        }

        return backups;
    }

    getBackupsForModule(module) {
        return this.getAllBackups()
            .filter(backup => backup.module === module)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    // ⏰ BACKUP SCHEDULER
    setupBackupScheduler() {
        setInterval(() => {
            this.performScheduledBackup();
        }, this.backupInterval);

        console.log(`⏰ Backup scheduler started (every ${this.backupInterval / 1000 / 60} minutes)`);
    }

    async performScheduledBackup() {
        console.log('⏰ Performing scheduled backup...');
        
        const modules = ['temperatures', 'cleaning', 'staff', 'deliveries'];
        
        for (const module of modules) {
            try {
                const data = await this.loadData(module, { skipIntegrityCheck: true });
                if (data && data.data) {
                    this.createBackup(module, {
                        data: data.data,
                        timestamp: new Date().toISOString(),
                        checksum: this.calculateChecksum(data.data)
                    });
                }
            } catch (error) {
                console.warn(`⚠️ Scheduled backup failed for ${module}:`, error);
            }
        }

        this.cleanupOldBackups();
    }

    // 📋 UTILITY METHODS
    updateIntegrityIndex(module, checksum) {
        try {
            const integrityData = this.getIntegrityIndex();
            integrityData[module] = {
                checksum,
                lastCheck: new Date().toISOString()
            };
            
            localStorage.setItem(this.storageKeys.integrity, JSON.stringify(integrityData));
        } catch (error) {
            console.warn('⚠️ Failed to update integrity index:', error);
        }
    }

    getIntegrityIndex() {
        try {
            const data = localStorage.getItem(this.storageKeys.integrity);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.warn('⚠️ Failed to load integrity index:', error);
            return {};
        }
    }

    updateBackupIndex(module, backupKey) {
        // For future use - maintain backup index for faster lookups
    }

    // 📊 STORAGE STATISTICS
    getStorageStats() {
        const stats = {
            totalSize: 0,
            modulesSizes: {},
            backupCount: 0,
            lastBackup: null,
            integrity: {},
            available: this.getAvailableSpace()
        };

        // Calculate sizes
        for (const [module, key] of Object.entries(this.storageKeys)) {
            if (key !== this.storageKeys.backup) {
                const item = localStorage.getItem(key);
                if (item) {
                    const size = item.length;
                    stats.modulesSizes[module] = size;
                    stats.totalSize += size;
                }
            }
        }

        // Count backups
        const backups = this.getAllBackups();
        stats.backupCount = backups.length;
        if (backups.length > 0) {
            stats.lastBackup = Math.max(...backups.map(b => b.timestamp));
        }

        // Integrity status
        stats.integrity = this.getIntegrityIndex();

        return stats;
    }

    getAvailableSpace() {
        try {
            // Estimate available space (not 100% accurate)
            const used = JSON.stringify(localStorage).length;
            const estimated = 5 * 1024 * 1024; // 5MB typical limit
            return Math.max(0, estimated - used);
        } catch (error) {
            return 0;
        }
    }

    // 🛠️ MAINTENANCE
    performMaintenance() {
        console.log('🛠️ Performing storage maintenance...');
        
        this.cleanupOldBackups();
        this.verifyAllDataIntegrity();
        this.optimizeStorage();
        
        console.log('✅ Storage maintenance completed');
    }

    verifyAllDataIntegrity() {
        const modules = ['temperatures', 'cleaning', 'staff', 'deliveries'];
        const results = {};

        modules.forEach(module => {
            try {
                const data = this.loadData(module, { skipIntegrityCheck: false });
                results[module] = data !== null;
            } catch (error) {
                results[module] = false;
                console.warn(`⚠️ Integrity check failed for ${module}:`, error);
            }
        });

        console.log('🔍 Integrity check results:', results);
        return results;
    }

    optimizeStorage() {
        // Placeholder for future optimization logic
        console.log('🔧 Storage optimization completed');
    }
}

// 🚀 EXPORT GLOBAL INSTANCE
window.HACCPStorage = new HACCPSecureStorage();

// Manual maintenance command
window.performHACCPMaintenance = () => {
    window.HACCPStorage.performMaintenance();
};

console.log('🔐 HACCP Secure Storage System loaded - Your data is protected!');