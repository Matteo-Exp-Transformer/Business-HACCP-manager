// SQLite Database Service for Postini App
import * as SQLite from 'expo-sqlite';

class DatabaseService {
  constructor() {
    this.db = null;
  }

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync('postini.db');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        street TEXT NOT NULL,
        number TEXT,
        city TEXT NOT NULL,
        postal_code TEXT,
        latitude REAL,
        longitude REAL,
        notes TEXT,
        route_type TEXT NOT NULL DEFAULT 'A',
        is_completed INTEGER DEFAULT 0,
        completed_at TEXT,
        created_at TEXT NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        start_time TEXT,
        end_time TEXT,
        total_distance REAL DEFAULT 0,
        total_stops INTEGER DEFAULT 0,
        route_type TEXT NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS pois (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT,
        is_active INTEGER DEFAULT 1
      )`,
    ];

    for (const query of queries) {
      await this.db.execAsync(query);
    }
  }

  // Users
  async createUser(user) {
    const result = await this.db.runAsync(
      'INSERT INTO users (username, role, created_at) VALUES (?, ?, ?)',
      [user.username, user.role, user.createdAt]
    );
    return { ...user, id: result.lastInsertRowId };
  }

  async getUserByUsername(username) {
    const result = await this.db.getFirstAsync(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return result;
  }

  async getAllUsers() {
    const result = await this.db.getAllAsync('SELECT * FROM users ORDER BY created_at DESC');
    return result;
  }

  // Addresses
  async createAddress(address) {
    const result = await this.db.runAsync(
      `INSERT INTO addresses (street, number, city, postal_code, latitude, longitude, 
       notes, route_type, is_completed, completed_at, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        address.street,
        address.number,
        address.city,
        address.postalCode,
        address.latitude,
        address.longitude,
        address.notes,
        address.routeType,
        address.isCompleted ? 1 : 0,
        address.completedAt,
        address.createdAt,
      ]
    );
    return { ...address, id: result.lastInsertRowId };
  }

  async getAddressesByRoute(routeType) {
    const result = await this.db.getAllAsync(
      'SELECT * FROM addresses WHERE route_type = ? ORDER BY created_at',
      [routeType]
    );
    return result.map(this.transformAddress);
  }

  async getAllAddresses() {
    const result = await this.db.getAllAsync(
      'SELECT * FROM addresses ORDER BY created_at'
    );
    return result.map(this.transformAddress);
  }

  async updateAddress(id, updates) {
    const setParts = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      const dbKey = this.camelToSnake(key);
      setParts.push(`${dbKey} = ?`);
      values.push(key === 'isCompleted' ? (updates[key] ? 1 : 0) : updates[key]);
    });
    
    values.push(id);
    
    await this.db.runAsync(
      `UPDATE addresses SET ${setParts.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteAddress(id) {
    await this.db.runAsync('DELETE FROM addresses WHERE id = ?', [id]);
  }

  async searchAddresses(query) {
    const result = await this.db.getAllAsync(
      `SELECT * FROM addresses 
       WHERE street LIKE ? OR city LIKE ? OR notes LIKE ?
       ORDER BY created_at`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return result.map(this.transformAddress);
  }

  // Statistics
  async createStatistics(stats) {
    const result = await this.db.runAsync(
      `INSERT INTO statistics (date, start_time, end_time, total_distance, 
       total_stops, route_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        stats.date,
        stats.startTime,
        stats.endTime,
        stats.totalDistance,
        stats.totalStops,
        stats.routeType,
        stats.userId,
      ]
    );
    return { ...stats, id: result.lastInsertRowId };
  }

  async updateStatistics(id, updates) {
    const setParts = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      const dbKey = this.camelToSnake(key);
      setParts.push(`${dbKey} = ?`);
      values.push(updates[key]);
    });
    
    values.push(id);
    
    await this.db.runAsync(
      `UPDATE statistics SET ${setParts.join(', ')} WHERE id = ?`,
      values
    );
  }

  async getStatisticsByDate(date) {
    const result = await this.db.getAllAsync(
      'SELECT * FROM statistics WHERE date = ?',
      [date]
    );
    return result.map(this.transformStatistics);
  }

  // POIs
  async createPOI(poi) {
    const result = await this.db.runAsync(
      'INSERT INTO pois (name, type, latitude, longitude, address, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [poi.name, poi.type, poi.latitude, poi.longitude, poi.address, poi.isActive ? 1 : 0]
    );
    return { ...poi, id: result.lastInsertRowId };
  }

  async getAllPOIs() {
    const result = await this.db.getAllAsync(
      'SELECT * FROM pois WHERE is_active = 1'
    );
    return result.map(this.transformPOI);
  }

  // Helper methods
  transformAddress(dbAddress) {
    return {
      id: dbAddress.id,
      street: dbAddress.street,
      number: dbAddress.number,
      city: dbAddress.city,
      postalCode: dbAddress.postal_code,
      latitude: dbAddress.latitude,
      longitude: dbAddress.longitude,
      notes: dbAddress.notes,
      routeType: dbAddress.route_type,
      isCompleted: dbAddress.is_completed === 1,
      completedAt: dbAddress.completed_at,
      createdAt: dbAddress.created_at,
    };
  }

  transformStatistics(dbStats) {
    return {
      id: dbStats.id,
      date: dbStats.date,
      startTime: dbStats.start_time,
      endTime: dbStats.end_time,
      totalDistance: dbStats.total_distance,
      totalStops: dbStats.total_stops,
      routeType: dbStats.route_type,
      userId: dbStats.user_id,
    };
  }

  transformPOI(dbPOI) {
    return {
      id: dbPOI.id,
      name: dbPOI.name,
      type: dbPOI.type,
      latitude: dbPOI.latitude,
      longitude: dbPOI.longitude,
      address: dbPOI.address,
      isActive: dbPOI.is_active === 1,
    };
  }

  camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

export default new DatabaseService();