// Authentication Service for local login
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from './database';
import { createUser, USER_ROLES } from '../types';

class AuthService {
  constructor() {
    this.currentUser = null;
  }

  async init() {
    try {
      await this.loadCurrentUser();
      await this.createDefaultUsers();
    } catch (error) {
      console.error('Error initializing auth service:', error);
    }
  }

  async createDefaultUsers() {
    try {
      // Check if admin user exists
      const adminUser = await DatabaseService.getUserByUsername('admin');
      if (!adminUser) {
        await DatabaseService.createUser(
          createUser({
            username: 'admin',
            role: USER_ROLES.ADMIN,
          })
        );
        console.log('Default admin user created');
      }

      // Check if test user exists
      const testUser = await DatabaseService.getUserByUsername('postino');
      if (!testUser) {
        await DatabaseService.createUser(
          createUser({
            username: 'postino',
            role: USER_ROLES.USER,
          })
        );
        console.log('Default test user created');
      }
    } catch (error) {
      console.error('Error creating default users:', error);
    }
  }

  async login(username) {
    try {
      const user = await DatabaseService.getUserByUsername(username);
      if (!user) {
        throw new Error('Utente non trovato');
      }

      this.currentUser = user;
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      this.currentUser = null;
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async loadCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === USER_ROLES.ADMIN;
  }

  async registerUser(username, role = USER_ROLES.USER) {
    try {
      // Check if user already exists
      const existingUser = await DatabaseService.getUserByUsername(username);
      if (existingUser) {
        throw new Error('Utente già esistente');
      }

      const newUser = await DatabaseService.createUser(
        createUser({ username, role })
      );
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      return await DatabaseService.getAllUsers();
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
}

export default new AuthService();