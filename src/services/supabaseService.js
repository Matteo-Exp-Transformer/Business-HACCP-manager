/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo file gestisce i SERVIZI SUPABASE - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo file gestisce CRUD operations e sincronizzazione dati
 * ⚠️ Coordina persistenza critica per compliance HACCP
 * 
 * @fileoverview Servizi Supabase HACCP - Sistema Critico di Persistenza
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Persistenza e Sincronizzazione
 * @version 1.0
 */

import { supabase, TABLES, createCompanyStructure } from '../lib/supabase.js'
import { validateAndSanitizeData, MAINTENANCE_DATA_SCHEMA } from '../utils/dataValidation'

// Importa anche l'URL per il controllo
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'

// Service class for Supabase operations
class SupabaseService {
  constructor() {
    this.companyId = this.getCompanyId()
  }

  // Get or create company ID
  getCompanyId() {
    let companyId = localStorage.getItem('haccp-company-id')
    if (!companyId) {
      companyId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('haccp-company-id', companyId)
    }
    return companyId
  }

  // Generic error handler
  handleError(error, operation) {
    console.error(`❌ Supabase ${operation} error:`, error)
    return {
      success: false,
      error: error.message,
      data: null
    }
  }

  // Generic success handler
  handleSuccess(data, operation) {
    console.log(`✅ Supabase ${operation} success:`, data)
    return {
      success: true,
      error: null,
      data
    }
  }

  // ===== COMPANY OPERATIONS =====
  async createCompany(companyData) {
    try {
      const company = {
        ...createCompanyStructure(this.companyId),
        ...companyData,
        id: this.companyId
      }

      const { data, error } = await supabase
        .from(TABLES.COMPANIES)
        .insert([company])
        .select()

      if (error) throw error
      return this.handleSuccess(data[0], 'createCompany')
    } catch (error) {
      return this.handleError(error, 'createCompany')
    }
  }

  async getCompany() {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMPANIES)
        .select('*')
        .eq('id', this.companyId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return this.handleSuccess(data, 'getCompany')
    } catch (error) {
      return this.handleError(error, 'getCompany')
    }
  }

  // ===== USERS OPERATIONS =====
  async saveUsers(users) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .upsert(users.map(user => ({
          ...user,
          company_id: this.companyId,
          updated_at: new Date().toISOString()
        })))
        .select()

      if (error) throw error
      return this.handleSuccess(data, 'saveUsers')
    } catch (error) {
      return this.handleError(error, 'saveUsers')
    }
  }

  async getUsers() {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('company_id', this.companyId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return this.handleSuccess(data || [], 'getUsers')
    } catch (error) {
      return this.handleError(error, 'getUsers')
    }
  }

  // ===== DEPARTMENTS OPERATIONS =====
  async saveDepartments(departments) {
    try {
      const { data, error } = await supabase
        .from(TABLES.DEPARTMENTS)
        .upsert(departments.map(dept => ({
          ...dept,
          company_id: this.companyId,
          updated_at: new Date().toISOString()
        })))
        .select()

      if (error) throw error
      return this.handleSuccess(data, 'saveDepartments')
    } catch (error) {
      return this.handleError(error, 'saveDepartments')
    }
  }

  async getDepartments() {
    try {
      const { data, error } = await supabase
        .from(TABLES.DEPARTMENTS)
        .select('*')
        .eq('company_id', this.companyId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return this.handleSuccess(data || [], 'getDepartments')
    } catch (error) {
      return this.handleError(error, 'getDepartments')
    }
  }

  // ===== STAFF OPERATIONS =====
  async saveStaff(staff) {
    try {
      const { data, error } = await supabase
        .from(TABLES.STAFF)
        .upsert(staff.map(member => ({
          ...member,
          company_id: this.companyId,
          updated_at: new Date().toISOString()
        })))
        .select()

      if (error) throw error
      return this.handleSuccess(data, 'saveStaff')
    } catch (error) {
      return this.handleError(error, 'saveStaff')
    }
  }

  async getStaff() {
    try {
      const { data, error } = await supabase
        .from(TABLES.STAFF)
        .select('*')
        .eq('company_id', this.companyId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return this.handleSuccess(data || [], 'getStaff')
    } catch (error) {
      return this.handleError(error, 'getStaff')
    }
  }

  // ===== REFRIGERATORS OPERATIONS =====
  async saveRefrigerators(refrigerators) {
    try {
      const { data, error } = await supabase
        .from(TABLES.REFRIGERATORS)
        .upsert(refrigerators.map(ref => ({
          ...ref,
          company_id: this.companyId,
          updated_at: new Date().toISOString()
        })))
        .select()

      if (error) throw error
      return this.handleSuccess(data, 'saveRefrigerators')
    } catch (error) {
      return this.handleError(error, 'saveRefrigerators')
    }
  }

  async getRefrigerators() {
    try {
      const { data, error } = await supabase
        .from(TABLES.REFRIGERATORS)
        .select('*')
        .eq('company_id', this.companyId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return this.handleSuccess(data || [], 'getRefrigerators')
    } catch (error) {
      return this.handleError(error, 'getRefrigerators')
    }
  }

  // ===== TEMPERATURES OPERATIONS =====
  async saveTemperatures(temperatures) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TEMPERATURES)
        .upsert(temperatures.map(temp => ({
          ...temp,
          company_id: this.companyId,
          updated_at: new Date().toISOString()
        })))
        .select()

      if (error) throw error
      return this.handleSuccess(data, 'saveTemperatures')
    } catch (error) {
      return this.handleError(error, 'saveTemperatures')
    }
  }

  async getTemperatures() {
    try {
      const { data, error } = await supabase
        .from(TABLES.TEMPERATURES)
        .select('*')
        .eq('company_id', this.companyId)
        .order('timestamp', { ascending: false })

      if (error) throw error
      return this.handleSuccess(data || [], 'getTemperatures')
    } catch (error) {
      return this.handleError(error, 'getTemperatures')
    }
  }

  // ===== CLEANING OPERATIONS =====
  async saveCleaning(cleaning) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLEANING)
        .upsert(cleaning.map(task => ({
          ...task,
          company_id: this.companyId,
          updated_at: new Date().toISOString()
        })))
        .select()

      if (error) throw error
      return this.handleSuccess(data, 'saveCleaning')
    } catch (error) {
      return this.handleError(error, 'saveCleaning')
    }
  }

  async getCleaning() {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLEANING)
        .select('*')
        .eq('company_id', this.companyId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return this.handleSuccess(data || [], 'getCleaning')
    } catch (error) {
      return this.handleError(error, 'getCleaning')
    }
  }

  // ===== INVENTORY OPERATIONS =====
  async saveInventory(inventory) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INVENTORY)
        .upsert(inventory.map(item => ({
          ...item,
          company_id: this.companyId,
          updated_at: new Date().toISOString()
        })))
        .select()

      if (error) throw error
      return this.handleSuccess(data, 'saveInventory')
    } catch (error) {
      return this.handleError(error, 'saveInventory')
    }
  }

  async getInventory() {
    try {
      const { data, error } = await supabase
        .from(TABLES.INVENTORY)
        .select('*')
        .eq('company_id', this.companyId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return this.handleSuccess(data || [], 'getInventory')
    } catch (error) {
      return this.handleError(error, 'getInventory')
    }
  }

  // ===== ONBOARDING OPERATIONS =====
  async saveOnboarding(onboardingData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ONBOARDING)
        .upsert([{
          id: this.companyId,
          company_id: this.companyId,
          data: onboardingData,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      return this.handleSuccess(data[0], 'saveOnboarding')
    } catch (error) {
      return this.handleError(error, 'saveOnboarding')
    }
  }

  async getOnboarding() {
    try {
      const { data, error } = await supabase
        .from(TABLES.ONBOARDING)
        .select('*')
        .eq('company_id', this.companyId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return this.handleSuccess(data, 'getOnboarding')
    } catch (error) {
      return this.handleError(error, 'getOnboarding')
    }
  }

  // ===== MAINTENANCE TASKS OPERATIONS =====
  async saveMaintenanceTasks(maintenanceTasks) {
    try {
      // Valida e sanitizza ogni task prima del salvataggio
      const validatedTasks = [];
      for (const task of maintenanceTasks) {
        const validation = validateAndSanitizeData(task, MAINTENANCE_DATA_SCHEMA, 'task di manutenzione');
        if (validation.isValid) {
          validatedTasks.push(validation.sanitizedData);
        } else {
          console.error('❌ Task di manutenzione non valido:', validation.errors);
          throw new Error(`Task non valido: ${validation.errors.join(', ')}`);
        }
      }

      // Controlla se Supabase è configurato correttamente
      if (!supabase || supabaseUrl.includes('your-project.supabase.co')) {
        console.warn('⚠️ Supabase non configurato, salvataggio in localStorage');
        // Salva in localStorage come fallback
        const existingTasks = JSON.parse(localStorage.getItem('haccp-maintenance-tasks') || '[]');
        const newTasks = validatedTasks.map(task => ({
          ...task,
          company_id: this.companyId,
          updated_at: new Date().toISOString()
        }));
        const updatedTasks = [...existingTasks.filter(t => 
          !validatedTasks.some(mt => mt.conservation_point_id === t.conservation_point_id)
        ), ...newTasks];
        localStorage.setItem('haccp-maintenance-tasks', JSON.stringify(updatedTasks));
        return this.handleSuccess(newTasks, 'saveMaintenanceTasks (localStorage)');
      }

      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_TASKS)
        .upsert(validatedTasks.map(task => ({
          ...task,
          company_id: this.companyId,
          updated_at: new Date().toISOString()
        })))
        .select()

      if (error) throw error
      return this.handleSuccess(data, 'saveMaintenanceTasks')
    } catch (error) {
      return this.handleError(error, 'saveMaintenanceTasks')
    }
  }

  async getMaintenanceTasks() {
    try {
      // Controlla se Supabase è configurato correttamente
      if (!supabase || supabaseUrl.includes('your-project.supabase.co')) {
        console.warn('⚠️ Supabase non configurato, caricamento da localStorage');
        const tasks = JSON.parse(localStorage.getItem('haccp-maintenance-tasks') || '[]');
        console.log('🔍 Tasks raw from localStorage:', tasks.length, 'task');
        console.log('🔍 Company ID corrente:', this.companyId);
        const filteredTasks = tasks.filter(task => task.company_id === this.companyId);
        console.log('🔍 Tasks filtrati per company_id:', filteredTasks.length, 'task');
        return this.handleSuccess(filteredTasks, 'getMaintenanceTasks (localStorage)');
      }

      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_TASKS)
        .select('*')
        .eq('company_id', this.companyId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return this.handleSuccess(data || [], 'getMaintenanceTasks')
    } catch (error) {
      return this.handleError(error, 'getMaintenanceTasks')
    }
  }

  async getMaintenanceTasksByConservationPoint(conservationPointId) {
    try {
      // Controlla se Supabase è configurato correttamente
      if (!supabase || supabaseUrl.includes('your-project.supabase.co')) {
        console.warn('⚠️ Supabase non configurato, caricamento da localStorage');
        const tasks = JSON.parse(localStorage.getItem('haccp-maintenance-tasks') || '[]');
        const filteredTasks = tasks.filter(task => 
          task.company_id === this.companyId && 
          task.conservation_point_id === conservationPointId
        );
        return this.handleSuccess(filteredTasks, 'getMaintenanceTasksByConservationPoint (localStorage)');
      }

      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_TASKS)
        .select('*')
        .eq('company_id', this.companyId)
        .eq('conservation_point_id', conservationPointId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return this.handleSuccess(data || [], 'getMaintenanceTasksByConservationPoint')
    } catch (error) {
      return this.handleError(error, 'getMaintenanceTasksByConservationPoint')
    }
  }

  async deleteMaintenanceTasksByConservationPoint(conservationPointId) {
    try {
      // Controlla se Supabase è configurato correttamente
      if (!supabase || supabaseUrl.includes('your-project.supabase.co')) {
        console.warn('⚠️ Supabase non configurato, eliminazione da localStorage');
        const tasks = JSON.parse(localStorage.getItem('haccp-maintenance-tasks') || '[]');
        const filteredTasks = tasks.filter(task => 
          !(task.company_id === this.companyId && task.conservation_point_id === conservationPointId)
        );
        localStorage.setItem('haccp-maintenance-tasks', JSON.stringify(filteredTasks));
        return this.handleSuccess(filteredTasks, 'deleteMaintenanceTasksByConservationPoint (localStorage)');
      }

      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_TASKS)
        .delete()
        .eq('company_id', this.companyId)
        .eq('conservation_point_id', conservationPointId)

      if (error) throw error
      return this.handleSuccess(data, 'deleteMaintenanceTasksByConservationPoint')
    } catch (error) {
      return this.handleError(error, 'deleteMaintenanceTasksByConservationPoint')
    }
  }

  // ===== MIGRATION FROM LOCALSTORAGE =====
  async migrateFromLocalStorage() {
    try {
      console.log('🔄 Starting migration from localStorage to Supabase...')
      
      // Get all localStorage data
      const localData = {
        users: JSON.parse(localStorage.getItem('haccp-users') || '[]'),
        departments: JSON.parse(localStorage.getItem('haccp-departments') || '[]'),
        staff: JSON.parse(localStorage.getItem('haccp-staff') || '[]'),
        refrigerators: JSON.parse(localStorage.getItem('haccp-refrigerators') || '[]'),
        temperatures: JSON.parse(localStorage.getItem('haccp-temperatures') || '[]'),
        cleaning: JSON.parse(localStorage.getItem('haccp-cleaning') || '[]'),
        products: JSON.parse(localStorage.getItem('haccp-products') || '[]'),
        onboarding: JSON.parse(localStorage.getItem('haccp-onboarding') || 'null')
      }

      // Create company if it doesn't exist
      const companyResult = await this.getCompany()
      if (!companyResult.success || !companyResult.data) {
        await this.createCompany({
          name: 'Migrated Company',
          type: 'pizzeria'
        })
      }

      // Migrate each data type
      const migrations = []
      
      if (localData.users.length > 0) {
        migrations.push(this.saveUsers(localData.users))
      }
      if (localData.departments.length > 0) {
        migrations.push(this.saveDepartments(localData.departments))
      }
      if (localData.staff.length > 0) {
        migrations.push(this.saveStaff(localData.staff))
      }
      if (localData.refrigerators.length > 0) {
        migrations.push(this.saveRefrigerators(localData.refrigerators))
      }
      if (localData.temperatures.length > 0) {
        migrations.push(this.saveTemperatures(localData.temperatures))
      }
      if (localData.cleaning.length > 0) {
        migrations.push(this.saveCleaning(localData.cleaning))
      }
      if (localData.products.length > 0) {
        migrations.push(this.saveInventory(localData.products))
      }
      if (localData.onboarding) {
        migrations.push(this.saveOnboarding(localData.onboarding))
      }

      // Execute all migrations
      const results = await Promise.all(migrations)
      
      // Check if all migrations succeeded
      const failedMigrations = results.filter(r => !r.success)
      if (failedMigrations.length > 0) {
        console.error('❌ Some migrations failed:', failedMigrations)
        return this.handleError(new Error('Migration failed'), 'migrateFromLocalStorage')
      }

      // Clear localStorage after successful migration
      const keysToRemove = [
        'haccp-users',
        'haccp-departments', 
        'haccp-staff',
        'haccp-refrigerators',
        'haccp-temperatures',
        'haccp-cleaning',
        'haccp-products',
        'haccp-onboarding'
      ]
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      console.log('✅ Migration completed successfully!')
      return this.handleSuccess(results, 'migrateFromLocalStorage')
      
    } catch (error) {
      return this.handleError(error, 'migrateFromLocalStorage')
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService()
export default supabaseService
