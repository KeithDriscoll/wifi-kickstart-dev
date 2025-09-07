// 🚀 Wi-Fi Kickstart - Storage Management Module
// Handles all data persistence and storage operations

export class StorageManager {
  constructor() {
    this.STORAGE_KEYS = {
      CONFIG: 'epicConfig',
      TEST_HISTORY: 'testHistory',
      CUSTOM_PRESETS: 'customPresets',
      THEME: 'theme',
      DARK_MODE: 'darkMode',
      DASHBOARD_SETTINGS: 'dashboardSettings',
      NETWORK_INFO: 'lastNetworkInfo',
      SECTION_ORDER: 'sectionOrder',
      CHART_ORDER: 'chartOrder',
      CUSTOM_SERVERS: 'customServers',
      USER_PREFERENCES: 'userPreferences',
      CACHE: 'dataCache'
    };
    
    this.MAX_HISTORY_SIZE = 1000;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  // Initialize storage
  async init() {
    // Check storage quota
    const quota = await this.getStorageQuota();
    console.log('Storage quota:', quota);
    
    // Clean old data
    await this.cleanOldData();
    
    return true;
  }

  // Get storage quota
  async getStorageQuota() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentUsed: (estimate.usage / estimate.quota) * 100
      };
    }
    return null;
  }

  // Save data to storage
  async save(key, data) {
    return new Promise((resolve, reject) => {
      try {
        const saveData = {};
        saveData[key] = data;
        
        chrome.storage.local.set(saveData, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(true);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Load data from storage
  async load(key) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result[key]);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Load multiple keys
  async loadMultiple(keys) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Remove data from storage
  async remove(key) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.remove([key], () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(true);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Clear all storage
  async clear() {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(true);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Save test result
  async saveTestResult(result) {
    try {
      // Load existing history
      let history = await this.load(this.STORAGE_KEYS.TEST_HISTORY) || [];
      
      // Create history entry
      const entry = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        ...result
      };
      
      // Add to beginning of array
      history.unshift(entry);
      
      // Limit history size
      if (history.length > this.MAX_HISTORY_SIZE) {
        history = history.slice(0, this.MAX_HISTORY_SIZE);
      }
      
      // Save back to storage
      await this.save(this.STORAGE_KEYS.TEST_HISTORY, history);
      
      // Update statistics
      await this.updateStatistics(history);
      
      return entry;
    } catch (error) {
      console.error('Failed to save test result:', error);
      throw error;
    }
  }

  // Load test history
  async loadTestHistory(limit = 100, offset = 0) {
    try {
      const history = await this.load(this.STORAGE_KEYS.TEST_HISTORY) || [];
      return history.slice(offset, offset + limit);
    } catch (error) {
      console.error('Failed to load test history:', error);
      return [];
    }
  }

  // Clear test history
  async clearTestHistory() {
    try {
      await this.remove(this.STORAGE_KEYS.TEST_HISTORY);
      await this.remove('testStatistics');
      return true;
    } catch (error) {
      console.error('Failed to clear test history:', error);
      throw error;
    }
  }

  // Clean old test data
  async cleanOldData(daysToKeep = 30) {
    try {
      const history = await this.load(this.STORAGE_KEYS.TEST_HISTORY) || [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const filteredHistory = history.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate > cutoffDate;
      });
      
      if (filteredHistory.length < history.length) {
        await this.save(this.STORAGE_KEYS.TEST_HISTORY, filteredHistory);
        console.log(`Cleaned ${history.length - filteredHistory.length} old test entries`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clean old data:', error);
      return false;
    }
  }

  // Save configuration
  async saveConfig(config) {
    try {
      await this.save(this.STORAGE_KEYS.CONFIG, config);
      
      // Backup config with timestamp
      const backup = {
        config,
        timestamp: new Date().toISOString()
      };
      await this.save('configBackup', backup);
      
      return true;
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  }

  // Load configuration
  async loadConfig() {
    try {
      const config = await this.load(this.STORAGE_KEYS.CONFIG);
      return config || this.getDefaultConfig();
    } catch (error) {
      console.error('Failed to load config:', error);
      return this.getDefaultConfig();
    }
  }

  // Save custom preset
  async saveCustomPreset(name, config) {
    try {
      const presets = await this.load(this.STORAGE_KEYS.CUSTOM_PRESETS) || [];
      
      const preset = {
        id: this.generateId(),
        name,
        config,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
      
      // Check if preset with same name exists
      const existingIndex = presets.findIndex(p => p.name === name);
      if (existingIndex >= 0) {
        preset.created = presets[existingIndex].created;
        presets[existingIndex] = preset;
      } else {
        presets.push(preset);
      }
      
      await this.save(this.STORAGE_KEYS.CUSTOM_PRESETS, presets);
      return preset;
    } catch (error) {
      console.error('Failed to save custom preset:', error);
      throw error;
    }
  }

  // Load custom presets
  async loadCustomPresets() {
    try {
      return await this.load(this.STORAGE_KEYS.CUSTOM_PRESETS) || [];
    } catch (error) {
      console.error('Failed to load custom presets:', error);
      return [];
    }
  }

  // Delete custom preset
  async deleteCustomPreset(id) {
    try {
      const presets = await this.load(this.STORAGE_KEYS.CUSTOM_PRESETS) || [];
      const filtered = presets.filter(p => p.id !== id);
      await this.save(this.STORAGE_KEYS.CUSTOM_PRESETS, filtered);
      return true;
    } catch (error) {
      console.error('Failed to delete custom preset:', error);
      throw error;
    }
  }

  // Save theme
  async saveTheme(theme) {
    try {
      await this.save(this.STORAGE_KEYS.THEME, theme);
      return true;
    } catch (error) {
      console.error('Failed to save theme:', error);
      throw error;
    }
  }

  // Load theme
  async loadTheme() {
    try {
      return await this.load(this.STORAGE_KEYS.THEME) || 'default';
    } catch (error) {
      console.error('Failed to load theme:', error);
      return 'default';
    }
  }

  // Cache data with expiration
  async cacheData(key, data, duration = this.CACHE_DURATION) {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        expires: Date.now() + duration
      };
      
      const cache = await this.load(this.STORAGE_KEYS.CACHE) || {};
      cache[key] = cacheEntry;
      
      await this.save(this.STORAGE_KEYS.CACHE, cache);
      return true;
    } catch (error) {
      console.error('Failed to cache data:', error);
      return false;
    }
  }

  // Get cached data
  async getCachedData(key) {
    try {
      const cache = await this.load(this.STORAGE_KEYS.CACHE) || {};
      const entry = cache[key];
      
      if (!entry) return null;
      
      // Check if expired
      if (Date.now() > entry.expires) {
        delete cache[key];
        await this.save(this.STORAGE_KEYS.CACHE, cache);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  // Clear cache
  async clearCache() {
    try {
      await this.remove(this.STORAGE_KEYS.CACHE);
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  // Update statistics
  async updateStatistics(history) {
    try {
      const stats = {
        totalTests: history.length,
        averageScore: 0,
        averageDownload: 0,
        averageUpload: 0,
        averageLatency: 0,
        bestScore: 0,
        worstScore: 100,
        lastTest: history[0]?.timestamp || null,
        firstTest: history[history.length - 1]?.timestamp || null
      };
      
      if (history.length > 0) {
        let totalScore = 0;
        let totalDownload = 0;
        let totalUpload = 0;
        let totalLatency = 0;
        let validTests = 0;
        
        history.forEach(test => {
          if (test.results) {
            validTests++;
            const score = test.results.overallScore || 0;
            totalScore += score;
            
            if (score > stats.bestScore) stats.bestScore = score;
            if (score < stats.worstScore) stats.worstScore = score;
            
            totalDownload += test.results.downloadSpeed?.overall?.average || 0;
            totalUpload += test.results.uploadSpeed?.overall?.average || 0;
            totalLatency += test.results.latency?.overall?.average || 0;
          }
        });
        
        if (validTests > 0) {
          stats.averageScore = Math.round(totalScore / validTests);
          stats.averageDownload = Math.round(totalDownload / validTests);
          stats.averageUpload = Math.round(totalUpload / validTests);
          stats.averageLatency = Math.round(totalLatency / validTests);
        }
      }
      
      await this.save('testStatistics', stats);
      return stats;
    } catch (error) {
      console.error('Failed to update statistics:', error);
      return null;
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      return await this.load('testStatistics') || {
        totalTests: 0,
        averageScore: 0,
        averageDownload: 0,
        averageUpload: 0,
        averageLatency: 0,
        bestScore: 0,
        worstScore: 0,
        lastTest: null,
        firstTest: null
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      return null;
    }
  }

  // Export all data
  async exportAllData() {
    try {
      const data = await this.loadMultiple([
        this.STORAGE_KEYS.CONFIG,
        this.STORAGE_KEYS.TEST_HISTORY,
        this.STORAGE_KEYS.CUSTOM_PRESETS,
        this.STORAGE_KEYS.THEME,
        this.STORAGE_KEYS.DASHBOARD_SETTINGS,
        this.STORAGE_KEYS.CUSTOM_SERVERS,
        'testStatistics'
      ]);
      
      return {
        version: '2.0.0',
        exported: new Date().toISOString(),
        data
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  // Import data
  async importData(importedData) {
    try {
      if (!importedData.data) {
        throw new Error('Invalid import data format');
      }
      
      const data = importedData.data;
      
      // Import each data type
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
          await this.save(key, value);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  // Generate unique ID
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get default configuration
  getDefaultConfig() {
    return {
      downloadTests: {
        enabled: true,
        fileSizes: ['1MB', '5MB', '10MB'],
        iterations: 3,
        parallelConnections: 4,
        timeout: 30000
      },
      uploadTests: {
        enabled: true,
        fileSizes: ['1MB', '5MB'],
        iterations: 2,
        parallelConnections: 2,
        timeout: 30000
      },
      latencyTests: {
        enabled: true,
        sampleCount: 20,
        targets: ['google', 'cloudflare'],
        interval: 100
      },
      gamingTests: {
        enabled: false,
        sampleCount: 100,
        burstTests: true
      },
      advancedTests: {
        ipv6Testing: true,
        cdnTesting: true,
        dnsPerformance: true,
        connectionStability: false,
        concurrentTesting: true,
        detailedLogging: false
      },
      ui: {
        theme: 'default',
        darkMode: true,
        animations: true,
        compactMode: false,
        notifications: true
      }
    };
  }

  // Monitor storage changes
  setupStorageListener(callback) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        callback(changes);
      }
    });
  }

  // Get storage size
  async getStorageSize() {
    try {
      const data = await chrome.storage.local.get(null);
      const dataStr = JSON.stringify(data);
      const sizeBytes = new Blob([dataStr]).size;
      
      return {
        bytes: sizeBytes,
        kilobytes: sizeBytes / 1024,
        megabytes: sizeBytes / (1024 * 1024),
        formatted: this.formatBytes(sizeBytes)
      };
    } catch (error) {
      console.error('Failed to get storage size:', error);
      return null;
    }
  }

  // Format bytes
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// Create singleton instance
export const Storage = new StorageManager();