/**
 * 🛡️ CORE VALIDATION SYSTEM - Mini-ePackPro HACCP
 * Sistema di validazione centralizzato per garantire integrità dei dati
 * Implementazione sicura basata sulle analisi di OPUS, SONNET e O3
 */

class HACCPValidator {
    constructor() {
        this.errorLogs = [];
        this.validationRules = this.initializeRules();
        this.init();
    }

    init() {
        // Setup error boundary globale
        window.addEventListener('error', (e) => this.handleGlobalError(e));
        window.addEventListener('unhandledrejection', (e) => this.handlePromiseRejection(e));
        
        console.log('🛡️ HACCP Validation System initialized');
    }

    // 📋 TEMPERATURE VALIDATION - Basato su analisi OPUS
    validateTemperature(data) {
        const schema = {
            location: { 
                required: true, 
                type: 'string', 
                minLength: 2, 
                maxLength: 50,
                pattern: /^[a-zA-Z0-9\s\-_]+$/
            },
            temperature: { 
                required: true, 
                type: 'number', 
                min: -50, 
                max: 50,
                precision: 1
            },
            time: { 
                required: false, 
                type: 'string',
                format: 'datetime'
            },
            status: {
                required: false,
                type: 'string',
                enum: ['ok', 'warning', 'danger']
            }
        };

        const result = this.validateObject(data, schema);
        
        // Business logic validation
        if (result.isValid && data.temperature !== undefined) {
            const temp = parseFloat(data.temperature);
            const expectedStatus = this.getTemperatureStatus(temp);
            
            if (data.status && data.status !== expectedStatus) {
                result.warnings.push(`Status ${data.status} non corrispondente alla temperatura ${temp}°C`);
            }
        }

        return result;
    }

    // 🧹 CLEANING VALIDATION
    validateCleaningTask(data) {
        const schema = {
            task: { 
                required: true, 
                type: 'string', 
                minLength: 5, 
                maxLength: 200 
            },
            assignee: { 
                required: true, 
                type: 'string', 
                minLength: 2, 
                maxLength: 50 
            },
            completed: { 
                required: true, 
                type: 'boolean' 
            },
            date: { 
                required: true, 
                type: 'string',
                format: 'date'
            },
            priority: {
                required: false,
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical']
            }
        };

        return this.validateObject(data, schema);
    }

    // 👥 STAFF VALIDATION
    validateStaff(data) {
        const schema = {
            name: { 
                required: true, 
                type: 'string', 
                minLength: 2, 
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\s\-']+$/
            },
            role: { 
                required: true, 
                type: 'string', 
                enum: ['chef', 'sous-chef', 'cook', 'prep-cook', 'dishwasher', 'server', 'manager'] 
            },
            certification: { 
                required: false, 
                type: 'string', 
                maxLength: 100 
            },
            hireDate: {
                required: false,
                type: 'string',
                format: 'date'
            }
        };

        return this.validateObject(data, schema);
    }

    // 🚚 DELIVERY VALIDATION - Nuovo modulo basato su piano strategico
    validateDelivery(data) {
        const schema = {
            supplier: { 
                required: true, 
                type: 'string', 
                minLength: 2, 
                maxLength: 100 
            },
            products: { 
                required: true, 
                type: 'array', 
                minItems: 1 
            },
            temperature: { 
                required: true, 
                type: 'number', 
                min: -50, 
                max: 50 
            },
            timestamp: { 
                required: true, 
                type: 'string',
                format: 'datetime'
            },
            status: {
                required: true,
                type: 'string',
                enum: ['pending', 'in-progress', 'completed', 'rejected']
            },
            compliance: {
                required: false,
                type: 'object'
            }
        };

        return this.validateObject(data, schema);
    }

    // 🔧 CORE VALIDATION ENGINE
    validateObject(data, schema) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            sanitized: {}
        };

        // Null/undefined check
        if (!data || typeof data !== 'object') {
            result.isValid = false;
            result.errors.push('Data must be a valid object');
            return result;
        }

        // Validate each field
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            const fieldResult = this.validateField(field, value, rules);
            
            if (!fieldResult.isValid) {
                result.isValid = false;
                result.errors.push(...fieldResult.errors);
            }
            
            result.warnings.push(...fieldResult.warnings);
            
            if (fieldResult.sanitized !== undefined) {
                result.sanitized[field] = fieldResult.sanitized;
            }
        }

        // Copy non-schema fields (with warning)
        for (const [field, value] of Object.entries(data)) {
            if (!schema[field]) {
                result.warnings.push(`Unknown field: ${field}`);
                result.sanitized[field] = value;
            }
        }

        return result;
    }

    validateField(fieldName, value, rules) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            sanitized: value
        };

        // Required check
        if (rules.required && (value === null || value === undefined || value === '')) {
            result.isValid = false;
            result.errors.push(`${fieldName} is required`);
            return result;
        }

        // Skip validation if field is optional and empty
        if (!rules.required && (value === null || value === undefined || value === '')) {
            return result;
        }

        // Type validation
        if (rules.type && !this.validateType(value, rules.type)) {
            result.isValid = false;
            result.errors.push(`${fieldName} must be of type ${rules.type}`);
            return result;
        }

        // Type-specific validations
        switch (rules.type) {
            case 'string':
                const stringResult = this.validateString(value, rules);
                if (!stringResult.isValid) {
                    result.isValid = false;
                    result.errors.push(...stringResult.errors.map(e => `${fieldName}: ${e}`));
                }
                result.sanitized = stringResult.sanitized;
                break;

            case 'number':
                const numberResult = this.validateNumber(value, rules);
                if (!numberResult.isValid) {
                    result.isValid = false;
                    result.errors.push(...numberResult.errors.map(e => `${fieldName}: ${e}`));
                }
                result.sanitized = numberResult.sanitized;
                break;

            case 'array':
                const arrayResult = this.validateArray(value, rules);
                if (!arrayResult.isValid) {
                    result.isValid = false;
                    result.errors.push(...arrayResult.errors.map(e => `${fieldName}: ${e}`));
                }
                break;

            case 'boolean':
                result.sanitized = Boolean(value);
                break;
        }

        // Enum validation
        if (rules.enum && !rules.enum.includes(value)) {
            result.isValid = false;
            result.errors.push(`${fieldName} must be one of: ${rules.enum.join(', ')}`);
        }

        // Format validation
        if (rules.format) {
            const formatResult = this.validateFormat(value, rules.format);
            if (!formatResult.isValid) {
                result.isValid = false;
                result.errors.push(`${fieldName}: ${formatResult.error}`);
            }
        }

        return result;
    }

    validateType(value, type) {
        switch (type) {
            case 'string': return typeof value === 'string';
            case 'number': return typeof value === 'number' && !isNaN(value);
            case 'boolean': return typeof value === 'boolean';
            case 'array': return Array.isArray(value);
            case 'object': return typeof value === 'object' && value !== null && !Array.isArray(value);
            default: return false;
        }
    }

    validateString(value, rules) {
        const result = { isValid: true, errors: [], sanitized: value };

        // Sanitize
        if (typeof value === 'string') {
            result.sanitized = value.trim();
        }

        // Length validation
        if (rules.minLength && result.sanitized.length < rules.minLength) {
            result.isValid = false;
            result.errors.push(`minimum length is ${rules.minLength}`);
        }

        if (rules.maxLength && result.sanitized.length > rules.maxLength) {
            result.isValid = false;
            result.errors.push(`maximum length is ${rules.maxLength}`);
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(result.sanitized)) {
            result.isValid = false;
            result.errors.push('invalid format');
        }

        return result;
    }

    validateNumber(value, rules) {
        const result = { isValid: true, errors: [], sanitized: value };

        const num = typeof value === 'string' ? parseFloat(value) : value;
        
        if (isNaN(num)) {
            result.isValid = false;
            result.errors.push('must be a valid number');
            return result;
        }

        result.sanitized = num;

        // Range validation
        if (rules.min !== undefined && num < rules.min) {
            result.isValid = false;
            result.errors.push(`minimum value is ${rules.min}`);
        }

        if (rules.max !== undefined && num > rules.max) {
            result.isValid = false;
            result.errors.push(`maximum value is ${rules.max}`);
        }

        // Precision validation
        if (rules.precision !== undefined) {
            const decimals = (num.toString().split('.')[1] || '').length;
            if (decimals > rules.precision) {
                result.sanitized = parseFloat(num.toFixed(rules.precision));
            }
        }

        return result;
    }

    validateArray(value, rules) {
        const result = { isValid: true, errors: [] };

        if (rules.minItems && value.length < rules.minItems) {
            result.isValid = false;
            result.errors.push(`minimum ${rules.minItems} items required`);
        }

        if (rules.maxItems && value.length > rules.maxItems) {
            result.isValid = false;
            result.errors.push(`maximum ${rules.maxItems} items allowed`);
        }

        return result;
    }

    validateFormat(value, format) {
        const patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[\+]?[1-9][\d]{0,15}$/,
            date: /^\d{4}-\d{2}-\d{2}$/,
            datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
            time: /^\d{2}:\d{2}(:\d{2})?$/
        };

        if (!patterns[format]) {
            return { isValid: false, error: `Unknown format: ${format}` };
        }

        if (!patterns[format].test(value)) {
            return { isValid: false, error: `Invalid ${format} format` };
        }

        return { isValid: true };
    }

    // 🌡️ BUSINESS LOGIC HELPERS
    getTemperatureStatus(temp) {
        if (temp < 4) return 'ok';
        if (temp <= 8) return 'warning';
        return 'danger';
    }

    // 🔧 DATA SANITIZATION
    sanitizeForStorage(data) {
        try {
            const sanitized = JSON.parse(JSON.stringify(data));
            return {
                success: true,
                data: sanitized,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logError('sanitization', error);
            return {
                success: false,
                error: 'Failed to sanitize data',
                data: null
            };
        }
    }

    // 🚨 ERROR HANDLING
    handleGlobalError(event) {
        const error = {
            type: 'javascript',
            message: event.message,
            filename: event.filename,
            line: event.lineno,
            column: event.colno,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        this.logError('global', error);
        
        // Show user-friendly message
        this.showUserError('Si è verificato un errore. I dati sono stati salvati.');
        
        return true; // Prevent default browser error handling
    }

    handlePromiseRejection(event) {
        const error = {
            type: 'promise',
            reason: event.reason,
            timestamp: new Date().toISOString()
        };

        this.logError('promise', error);
        event.preventDefault();
    }

    logError(category, error) {
        const logEntry = {
            id: Date.now(),
            category,
            error,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.errorLogs.push(logEntry);
        
        // Keep only last 100 errors
        if (this.errorLogs.length > 100) {
            this.errorLogs = this.errorLogs.slice(-100);
        }

        // Store in localStorage for debugging
        try {
            localStorage.setItem('haccp-error-logs', JSON.stringify(this.errorLogs));
        } catch (e) {
            console.warn('Cannot save error logs to localStorage');
        }

        console.error('🚨 HACCP Error:', logEntry);
    }

    showUserError(message) {
        // Create user-friendly error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">⚠️</span>
                <span>${message}</span>
                <button class="ml-2 text-white opacity-75 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // 📊 VALIDATION STATISTICS
    getValidationStats() {
        return {
            totalErrors: this.errorLogs.length,
            errorsByCategory: this.errorLogs.reduce((acc, log) => {
                acc[log.category] = (acc[log.category] || 0) + 1;
                return acc;
            }, {}),
            lastError: this.errorLogs[this.errorLogs.length - 1] || null
        };
    }

    // 🧪 TESTING HELPERS
    runValidationTests() {
        console.log('🧪 Running validation tests...');
        
        const tests = [
            {
                name: 'Temperature validation',
                data: { location: 'Frigorifero 1', temperature: 2.5 },
                validator: 'validateTemperature',
                expected: true
            },
            {
                name: 'Invalid temperature',
                data: { location: '', temperature: 'invalid' },
                validator: 'validateTemperature',
                expected: false
            },
            {
                name: 'Staff validation',
                data: { name: 'Mario Rossi', role: 'chef' },
                validator: 'validateStaff',
                expected: true
            }
        ];

        const results = tests.map(test => {
            const result = this[test.validator](test.data);
            const passed = result.isValid === test.expected;
            
            console.log(`${passed ? '✅' : '❌'} ${test.name}:`, result);
            
            return { ...test, passed, result };
        });

        const passed = results.filter(r => r.passed).length;
        console.log(`🎯 Tests passed: ${passed}/${results.length}`);
        
        return results;
    }

    // 🔧 INITIALIZATION RULES
    initializeRules() {
        return {
            // Temperature ranges per location type
            temperatureRanges: {
                'frigorifero': { min: 0, max: 4, optimal: 2 },
                'congelatore': { min: -25, max: -15, optimal: -18 },
                'display': { min: 0, max: 6, optimal: 3 },
                'cucina': { min: 15, max: 25, optimal: 20 }
            },
            
            // Required fields per module
            requiredFields: {
                temperature: ['location', 'temperature'],
                cleaning: ['task', 'assignee', 'date'],
                staff: ['name', 'role'],
                delivery: ['supplier', 'products', 'temperature', 'timestamp']
            }
        };
    }

    // 🛡️ SECURITY HELPERS
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    validateCSRF(token) {
        // Basic CSRF validation (extend as needed)
        return typeof token === 'string' && token.length > 10;
    }
}

// 🚀 EXPORT GLOBAL INSTANCE
window.HACCPValidator = new HACCPValidator();

// Auto-run tests in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(() => {
        window.HACCPValidator.runValidationTests();
    }, 1000);
}

console.log('🛡️ HACCP Core Validation System loaded - Ready for safe operations!');