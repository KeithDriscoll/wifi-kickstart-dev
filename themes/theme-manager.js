/**
 * 🎨 EPIC THEME MANAGER - Custom Themes + Background Upload System
 * Professional theming engine with live preview and customization
 */

class ThemeManager {
  constructor() {
    this.currentTheme = 'professional-light'; // New default
    this.customThemes = {};
    this.backgroundImage = null;
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    console.log('🎨 Initializing Epic Theme Manager...');
    
    // Load saved themes and settings
    await this.loadSavedData();
    
    // Create theme CSS variables
    this.setupThemeVariables();
    
    // Apply current theme
    this.applyTheme(this.currentTheme);
    
    // Setup event listeners
    this.setupEventListeners();
    
    this.isInitialized = true;
    console.log('✅ Theme Manager initialized!');
  }

  // Load saved themes and preferences
  async loadSavedData() {
    const data = await chrome.storage.local.get([
      'currentTheme',
      'customThemes', 
      'backgroundImage',
      'themeSettings'
    ]);
    
    this.currentTheme = data.currentTheme || 'professional-light';
    this.customThemes = data.customThemes || {};
    this.backgroundImage = data.backgroundImage || null;
    this.themeSettings = data.themeSettings || {};
  }

  // Built-in theme definitions
  getBuiltInThemes() {
    return {
      'professional-light': {
        name: 'Professional Light',
        description: 'Clean corporate design with traditional blues',
        colors: {
          primary: '#2563eb',
          primaryDark: '#1d4ed8', 
          primaryLight: '#3b82f6',
          secondary: '#059669',
          background: '#ffffff',
          surface: '#f8fafc',
          surfaceLight: '#f1f5f9',
          surfaceHover: '#e2e8f0',
          textPrimary: '#1f2937',
          textSecondary: '#6b7280',
          textMuted: '#9ca3af',
          border: 'rgba(0, 0, 0, 0.1)',
          success: '#059669',
          warning: '#d97706',
          error: '#dc2626',
          info: '#2563eb'
        },
        gradients: {
          primary: 'linear-gradient(135deg, #2563eb 0%, #059669 100%)',
          surface: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          epic: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)'
        }
      },

      'professional-dark': {
        name: 'Professional Dark',
        description: 'Professional design with dark aesthetics',
        colors: {
          primary: '#4a90e2',
          primaryDark: '#2c5282',
          primaryLight: '#63a4ff',
          secondary: '#50c878',
          background: '#0f172a',
          surface: '#1e293b',
          surfaceLight: '#334155',
          surfaceHover: '#475569',
          textPrimary: '#f8fafc',
          textSecondary: '#cbd5e1',
          textMuted: '#94a3b8',
          border: 'rgba(255, 255, 255, 0.1)',
          success: '#50c878',
          warning: '#fbbf24',
          error: '#ef4444',
          info: '#4a90e2'
        },
        gradients: {
          primary: 'linear-gradient(135deg, #4a90e2 0%, #50c878 100%)',
          surface: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          epic: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        }
      },

      'epic-light': {
        name: 'Epic Light',
        description: 'Cosmic vibes with bright aesthetics',
        colors: {
          primary: '#6366f1',
          primaryDark: '#4f46e5',
          primaryLight: '#818cf8',
          secondary: '#06b6d4',
          background: '#fafafa',
          surface: '#ffffff',
          surfaceLight: '#f4f4f5',
          surfaceHover: '#e4e4e7',
          textPrimary: '#18181b',
          textSecondary: '#52525b',
          textMuted: '#a1a1aa',
          border: 'rgba(0, 0, 0, 0.1)',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#6366f1'
        },
        gradients: {
          primary: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          surface: 'linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%)',
          epic: 'linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f4f4f5 100%)'
        }
      },

      'epic-dark': {
        name: 'Epic Dark',
        description: 'Deep space gradients with cosmic effects',
        colors: {
          primary: '#4a90e2',
          primaryDark: '#2c5282',
          primaryLight: '#63a4ff',
          secondary: '#50c878',
          background: '#0a0e27',
          surface: '#1a1f3a',
          surfaceLight: '#2d3561',
          surfaceHover: '#3a4570',
          textPrimary: '#e2e8f0',
          textSecondary: '#8892b0',
          textMuted: '#64748b',
          border: 'rgba(255, 255, 255, 0.1)',
          success: '#50c878',
          warning: '#ffa500',
          error: '#ff4444',
          info: '#4a90e2'
        },
        gradients: {
          primary: 'linear-gradient(135deg, #4a90e2 0%, #50c878 100%)',
          surface: 'linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%)',
          epic: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2d1b69 100%)'
        }
      },

      'hacker-light': {
        name: 'Hacker Light',
        description: 'Terminal aesthetics with light background',
        colors: {
          primary: '#16a085',
          primaryDark: '#138d7a',
          primaryLight: '#1abc9c',
          secondary: '#27ae60',
          background: '#f8f9fa',
          surface: '#ffffff',
          surfaceLight: '#e9ecef',
          surfaceHover: '#dee2e6',
          textPrimary: '#2c3e50',
          textSecondary: '#5a6c7d',
          textMuted: '#95a5a6',
          border: 'rgba(0, 0, 0, 0.1)',
          success: '#27ae60',
          warning: '#f39c12',
          error: '#e74c3c',
          info: '#16a085'
        },
        gradients: {
          primary: 'linear-gradient(135deg, #16a085 0%, #27ae60 100%)',
          surface: 'linear-gradient(135deg, #ffffff 0%, #e9ecef 100%)',
          epic: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #e9ecef 100%)'
        }
      },

      'hacker-dark': {
        name: 'Hacker Dark',
        description: 'Matrix green terminal vibes',
        colors: {
          primary: '#00ff88',
          primaryDark: '#00cc6a',
          primaryLight: '#33ffa3',
          secondary: '#00ffff',
          background: '#000000',
          surface: '#0d1117',
          surfaceLight: '#161b22',
          surfaceHover: '#21262d',
          textPrimary: '#00ff88',
          textSecondary: '#8cc8aa',
          textMuted: '#6e7681',
          border: 'rgba(0, 255, 136, 0.2)',
          success: '#00ff88',
          warning: '#ffff00',
          error: '#ff0066',
          info: '#00ffff'
        },
        gradients: {
          primary: 'linear-gradient(135deg, #00ff88 0%, #00ffff 100%)',
          surface: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
          epic: 'linear-gradient(135deg, #000000 0%, #0d1117 50%, #161b22 100%)'
        }
      },

      'gaming-light': {
        name: 'Gaming Light',
        description: 'RGB aesthetics with bright background',
        colors: {
          primary: '#8b5cf6',
          primaryDark: '#7c3aed',
          primaryLight: '#a78bfa',
          secondary: '#06b6d4',
          background: '#fafafa',
          surface: '#ffffff',
          surfaceLight: '#f4f4f5',
          surfaceHover: '#e4e4e7',
          textPrimary: '#18181b',
          textSecondary: '#52525b',
          textMuted: '#a1a1aa',
          border: 'rgba(0, 0, 0, 0.1)',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#8b5cf6'
        },
        gradients: {
          primary: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
          surface: 'linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%)',
          epic: 'linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f4f4f5 100%)'
        }
      },

      'gaming-dark': {
        name: 'Gaming Dark',
        description: 'RGB neon beast mode',
        colors: {
          primary: '#9c88ff',
          primaryDark: '#8c7ae6',
          primaryLight: '#baacff',
          secondary: '#ff6b9d',
          background: '#1a1a2e',
          surface: '#16213e',
          surfaceLight: '#0f3460',
          surfaceHover: '#1e3a5f',
          textPrimary: '#ffffff',
          textSecondary: '#c7d2fe',
          textMuted: '#94a3b8',
          border: 'rgba(255, 255, 255, 0.1)',
          success: '#4ade80',
          warning: '#fbbf24',
          error: '#f87171',
          info: '#9c88ff'
        },
        gradients: {
          primary: 'linear-gradient(135deg, #9c88ff 0%, #ff6b9d 100%)',
          surface: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)',
          epic: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        }
      }
    };
  }

  // Setup CSS custom properties
  setupThemeVariables() {
    const root = document.documentElement;
    const themes = this.getBuiltInThemes();
    
    // Create CSS variables for each theme
    Object.entries(themes).forEach(([themeId, theme]) => {
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${themeId}-${key}`, value);
      });
      
      Object.entries(theme.gradients).forEach(([key, value]) => {
        root.style.setProperty(`--${themeId}-gradient-${key}`, value);
      });
    });
  }

  // Apply theme
  applyTheme(themeId) {
    const themes = this.getBuiltInThemes();
    const customThemes = this.customThemes;
    
    let theme = themes[themeId] || customThemes[themeId];
    
    if (!theme) {
      console.warn(`Theme ${themeId} not found, falling back to professional-light`);
      theme = themes['professional-light'];
      themeId = 'professional-light';
    }

    const root = document.documentElement;
    
    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Apply gradients
    Object.entries(theme.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value);
    });

    // Apply background image if set
    if (this.backgroundImage) {
      this.applyBackgroundImage();
    }

    // Update body class
    document.body.className = `theme-${themeId}`;
    
    // Save current theme
    this.currentTheme = themeId;
    chrome.storage.local.set({ currentTheme: themeId });
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { themeId, theme } 
    }));

    console.log(`🎨 Applied theme: ${theme.name}`);
  }

  // Create custom theme
  createCustomTheme(name, colors, gradients) {
    const themeId = `custom-${Date.now()}`;
    
    const customTheme = {
      name,
      description: 'Custom theme',
      isCustom: true,
      created: new Date().toISOString(),
      colors: { ...colors },
      gradients: { ...gradients }
    };
    
    this.customThemes[themeId] = customTheme;
    
    // Save to storage
    chrome.storage.local.set({ 
      customThemes: this.customThemes 
    });
    
    console.log(`🎨 Created custom theme: ${name}`);
    return themeId;
  }

  // Delete custom theme
  deleteCustomTheme(themeId) {
    if (this.customThemes[themeId]) {
      delete this.customThemes[themeId];
      
      // Save to storage
      chrome.storage.local.set({ 
        customThemes: this.customThemes 
      });
      
      // Switch to default if current theme was deleted
      if (this.currentTheme === themeId) {
        this.applyTheme('professional-light');
      }
      
      console.log(`🗑️ Deleted custom theme: ${themeId}`);
      return true;
    }
    return false;
  }

  // Upload background image
  async uploadBackgroundImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file'));
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image file too large. Maximum size is 5MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        
        // Save to storage
        this.backgroundImage = imageData;
        chrome.storage.local.set({ backgroundImage: imageData });
        
        // Apply immediately
        this.applyBackgroundImage();
        
        console.log('🖼️ Background image uploaded and applied');
        resolve(imageData);
      };
      
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  // Apply background image
  applyBackgroundImage() {
    if (!this.backgroundImage) return;
    
    const root = document.documentElement;
    root.style.setProperty('--background-image', `url(${this.backgroundImage})`);
    
    // Apply overlay for readability
    const overlay = this.themeSettings.backgroundOverlay || 0.7;
    root.style.setProperty('--background-overlay', overlay);
  }

  // Remove background image
  removeBackgroundImage() {
    this.backgroundImage = null;
    chrome.storage.local.remove('backgroundImage');
    
    const root = document.documentElement;
    root.style.removeProperty('--background-image');
    root.style.removeProperty('--background-overlay');
    
    console.log('🗑️ Background image removed');
  }

  // Export theme
  exportTheme(themeId) {
    const themes = { ...this.getBuiltInThemes(), ...this.customThemes };
    const theme = themes[themeId];
    
    if (!theme) {
      throw new Error('Theme not found');
    }
    
    const exportData = {
      name: theme.name,
      description: theme.description,
      colors: theme.colors,
      gradients: theme.gradients,
      version: '1.0',
      exported: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log(`📤 Exported theme: ${theme.name}`);
  }

  // Import theme
  async importTheme(file) {
    return new Promise((resolve, reject) => {
      if (!file || file.type !== 'application/json') {
        reject(new Error('Please select a valid JSON theme file'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const themeData = JSON.parse(e.target.result);
          
          // Validate theme structure
          if (!themeData.name || !themeData.colors || !themeData.gradients) {
            throw new Error('Invalid theme file format');
          }
          
          // Create the imported theme
          const themeId = this.createCustomTheme(
            themeData.name,
            themeData.colors,
            themeData.gradients
          );
          
          console.log(`📥 Imported theme: ${themeData.name}`);
          resolve({ themeId, theme: themeData });
          
        } catch (error) {
          reject(new Error('Failed to parse theme file: ' + error.message));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read theme file'));
      reader.readAsText(file);
    });
  }

  // Setup event listeners
  setupEventListeners() {
    // Listen for storage changes from other instances
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.currentTheme) {
        this.currentTheme = changes.currentTheme.newValue;
        this.applyTheme(this.currentTheme);
      }
      
      if (changes.customThemes) {
        this.customThemes = changes.customThemes.newValue || {};
      }
      
      if (changes.backgroundImage) {
        this.backgroundImage = changes.backgroundImage.newValue;
        if (this.backgroundImage) {
          this.applyBackgroundImage();
        } else {
          this.removeBackgroundImage();
        }
      }
    });
  }

  // Get all available themes
  getAllThemes() {
    return {
      builtin: this.getBuiltInThemes(),
      custom: this.customThemes
    };
  }

  // Get current theme info
  getCurrentTheme() {
    const allThemes = { ...this.getBuiltInThemes(), ...this.customThemes };
    return {
      id: this.currentTheme,
      theme: allThemes[this.currentTheme]
    };
  }

  // 🌗 ADD THESE METHODS TO THE ThemeManager CLASS
// Drop this code right before the closing } of the ThemeManager class

  // 🔍 CHECK IF THEME EXISTS (built-in + custom)
  themeExists(themeId) {
    const builtInThemes = this.getBuiltInThemes();
    if (builtInThemes[themeId]) {
      return true;
    }
    
    if (this.customThemes[themeId]) {
      return true;
    }
    
    return false;
  }

  // 🌓 CHECK IF THEME IS DARK VARIANT
  isThemeDark(themeId) {
    return themeId.endsWith('-dark');
  }

  // 🔄 GET THEME VARIANT (light ↔ dark)
  getThemeVariant(themeId, wantDark = true) {
    if (wantDark) {
      // Want dark version
      if (themeId.endsWith('-light')) {
        return themeId.replace('-light', '-dark');
      } else if (!themeId.endsWith('-dark')) {
        return `${themeId}-dark`;
      }
      return themeId; // Already dark
    } else {
      // Want light version  
      if (themeId.endsWith('-dark')) {
        return themeId.replace('-dark', '-light');
      } else if (!themeId.endsWith('-light')) {
        return `${themeId}-light`;
      }
      return themeId; // Already light
    }
  }

  // 🌗 SMART DARK MODE TOGGLE (main function)
  async smartToggleDarkMode(isDarkMode, showToast = true) {
    try {
      const currentTheme = this.currentTheme;
      console.log(`🌗 Smart toggle: ${currentTheme} → ${isDarkMode ? 'dark' : 'light'} mode`);
      
      // Get the target theme variant
      const targetTheme = this.getThemeVariant(currentTheme, isDarkMode);
      
      // Check if target theme exists
      if (!this.themeExists(targetTheme)) {
        const variantType = isDarkMode ? 'dark' : 'light';
        const message = `No ${variantType} variant available for ${this.getThemeDisplayName(currentTheme)}`;
        
        if (showToast && window.showToast) {
          window.showToast(message, 'warning');
        }
        
        console.warn(`❌ ${message}`);
        return { success: false, message };
      }
      
      // Apply the new theme
      this.applyTheme(targetTheme);
      
      // Success message
      const targetDisplayName = this.getThemeDisplayName(targetTheme);
      const successMessage = `Switched to ${targetDisplayName}`;
      
      if (showToast && window.showToast) {
        window.showToast(successMessage, 'success');
      }
      
      console.log(`✅ Theme switched: ${currentTheme} → ${targetTheme}`);
      return { success: true, theme: targetTheme, message: successMessage };
      
    } catch (error) {
      console.error('Failed to handle smart dark mode toggle:', error);
      const errorMessage = 'Failed to switch theme';
      
      if (showToast && window.showToast) {
        window.showToast(errorMessage, 'error');
      }
      
      return { success: false, message: errorMessage, error };
    }
  }

  // 📝 GET THEME DISPLAY NAME
  getThemeDisplayName(themeId) {
    const builtInThemes = this.getBuiltInThemes();
    const theme = builtInThemes[themeId] || this.customThemes[themeId];
    
    if (theme && theme.name) {
      return theme.name;
    }
    
    // Fallback: make ID readable
    return themeId
      .replace('-', ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  // 🔄 SYNC DARK MODE STATE (for UI toggles)
  getCurrentThemeDarkMode() {
    return this.isThemeDark(this.currentTheme);
  }
}

// Global instance
window.ThemeManager = new ThemeManager();