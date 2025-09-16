// 🔥 EPIC SETTINGS PAGE CONTROLLER - FIXED VERSION
// Manages all configuration options for the epic speed test suite

class SettingsController {
  constructor() {
    this.currentConfig = {};
    this.customPresets = [];
    this.isDirty = false;
    this.activeSection = 'presets';
  }

  // Initialize settings
  async init() {
    console.log('🔥 Initializing Epic Settings...');
    
    // Load current configuration
    await this.loadConfiguration();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Apply current settings to UI
    this.applySettingsToUI();
    
    // Load storage stats
    await this.loadStorageStats();

    // Initialize theme system
    await this.initThemeSystem();
    
    console.log('✅ Settings initialized successfully!');
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
        timeout: 5000
      },
      gamingTests: {
        enabled: true,
        serverRegions: ['auto'],
        protocols: ['tcp', 'udp']
      },
      advancedTests: {
        ipv6Testing: false,
        cdnTesting: true,
        multiThreading: true,
        realTimeMode: false
      },
      servers: {
        auto: true,
        preferred: [],
        custom: []
      },
      monitoring: {
        vpnDetection: true,
        warpDetection: true,
        captivePortal: true
      },
      ui: {
        darkMode: false,
        animations: true,
        compactMode: false
      },
      data: {
        historyRetention: 30,
        maxTestsStored: 100
      }
    };
  }

  // Load configuration
  async loadConfiguration() {
    try {
      const result = await chrome.storage.local.get(['epicConfig', 'customPresets']);
      this.currentConfig = result.epicConfig || this.getDefaultConfig();
      this.customPresets = result.customPresets || [];
    } catch (error) {
      console.error('Failed to load configuration:', error);
      this.currentConfig = this.getDefaultConfig();
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        this.switchSection(e.currentTarget.dataset.section);
      });
    });
    
    // Header buttons
    document.getElementById('backBtn')?.addEventListener('click', () => {
      this.goBack();
    });
    
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectPreset(e.currentTarget.dataset.preset);
      });
    });
    
    // Footer buttons
    document.getElementById('saveAllSettings')?.addEventListener('click', () => {
      this.saveAllSettings();
    });
    
    document.getElementById('applySettings')?.addEventListener('click', () => {
      this.applySettings();
    });
    
    document.getElementById('cancelSettings')?.addEventListener('click', () => {
      this.cancelSettings();
    });
    
    // Track changes
    document.querySelectorAll('input, select').forEach(element => {
      element.addEventListener('change', () => {
        this.isDirty = true;
      });
    });
  }

  // Switch section
  switchSection(section) {
    this.activeSection = section;
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
    });
    
    // Update content
    document.querySelectorAll('.settings-section').forEach(sectionEl => {
      sectionEl.classList.toggle('active', sectionEl.id === `${section}Section`);
    });
  }

  // Select preset
  selectPreset(preset) {
    const presets = {
      quick: {
        downloadTests: { 
          enabled: true,
          fileSizes: ['1MB'], 
          iterations: 1, 
          parallelConnections: 2 
        },
        uploadTests: { 
          enabled: true,
          fileSizes: ['1MB'], 
          iterations: 1, 
          parallelConnections: 1 
        },
        latencyTests: { 
          enabled: true,
          sampleCount: 10 
        },
        gamingTests: { enabled: false },
        advancedTests: { 
          ipv6Testing: false, 
          cdnTesting: false 
        }
      },
      standard: {
        downloadTests: { 
          enabled: true,
          fileSizes: ['1MB', '5MB', '10MB'], 
          iterations: 3, 
          parallelConnections: 4 
        },
        uploadTests: { 
          enabled: true,
          fileSizes: ['1MB', '5MB'], 
          iterations: 2, 
          parallelConnections: 2 
        },
        latencyTests: { 
          enabled: true,
          sampleCount: 20 
        },
        gamingTests: { enabled: true },
        advancedTests: { 
          ipv6Testing: false, 
          cdnTesting: true 
        }
      },
      thorough: {
        downloadTests: { 
          enabled: true,
          fileSizes: ['1MB', '5MB', '10MB', '25MB', '50MB'], 
          iterations: 5, 
          parallelConnections: 8 
        },
        uploadTests: { 
          enabled: true,
          fileSizes: ['1MB', '5MB', '10MB'], 
          iterations: 3, 
          parallelConnections: 4 
        },
        latencyTests: { 
          enabled: true,
          sampleCount: 50 
        },
        gamingTests: { enabled: true },
        advancedTests: { 
          ipv6Testing: true, 
          cdnTesting: true 
        }
      },
      gaming: {
        downloadTests: { 
          enabled: true,
          fileSizes: ['5MB', '10MB'], 
          iterations: 2, 
          parallelConnections: 4 
        },
        uploadTests: { 
          enabled: true,
          fileSizes: ['1MB', '5MB'], 
          iterations: 2, 
          parallelConnections: 2 
        },
        latencyTests: { 
          enabled: true,
          sampleCount: 100 
        },
        gamingTests: { 
          enabled: true,
          serverRegions: ['auto', 'us-east', 'us-west', 'eu-west']
        },
        advancedTests: { 
          ipv6Testing: false, 
          cdnTesting: true 
        }
      }
    };

    if (presets[preset]) {
      this.currentConfig = { ...this.currentConfig, ...presets[preset] };
      this.applySettingsToUI();
      this.isDirty = true;
      
      // Update active preset button
      document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === preset);
      });
      
      this.showToast(`Applied ${preset} preset!`, 'success');
    }
  }

  // Apply settings to UI
  applySettingsToUI() {
    const config = this.currentConfig;
    
    // Download settings
    const downloadEnabled = document.getElementById('downloadEnabled');
    if (downloadEnabled) downloadEnabled.checked = config.downloadTests?.enabled ?? true;
    
    // Upload settings
    const uploadEnabled = document.getElementById('uploadEnabled');
    if (uploadEnabled) uploadEnabled.checked = config.uploadTests?.enabled ?? true;
    
    // Latency settings
    const latencyEnabled = document.getElementById('latencyEnabled');
    if (latencyEnabled) latencyEnabled.checked = config.latencyTests?.enabled ?? true;
    
    // Gaming settings
    const gamingEnabled = document.getElementById('gamingEnabled');
    if (gamingEnabled) gamingEnabled.checked = config.gamingTests?.enabled ?? true;
    
    // Monitoring settings
    const vpnDetection = document.getElementById('vpnDetection');
    if (vpnDetection) vpnDetection.checked = config.monitoring?.vpnDetection ?? true;
    
    const warpDetection = document.getElementById('warpDetection');
    if (warpDetection) warpDetection.checked = config.monitoring?.warpDetection ?? true;
    
    // Appearance settings
    const darkMode = document.getElementById('darkMode');
    if (darkMode) darkMode.checked = config.ui?.darkMode ?? false;
    
    const animations = document.getElementById('animations');
    if (animations) animations.checked = config.ui?.animations ?? true;
    
    const compactMode = document.getElementById('compactMode');
    if (compactMode) compactMode.checked = config.ui?.compactMode ?? false;
  }

  // Load storage stats
  async loadStorageStats() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_TEST_HISTORY' });
      const history = response?.history || [];
      
      const testsStored = document.getElementById('testsStored');
      if (testsStored) testsStored.textContent = history.length;
      
      // Calculate storage size
      const dataStr = JSON.stringify(history);
      const sizeKB = Math.round(new Blob([dataStr]).size / 1024);
      const storageUsed = document.getElementById('storageUsed');
      if (storageUsed) storageUsed.textContent = `${sizeKB} KB`;
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  }

  // Save all settings
  async saveAllSettings() {
    try {
      await chrome.storage.local.set({ 
        epicConfig: this.currentConfig,
        customPresets: this.customPresets 
      });
      
      await chrome.runtime.sendMessage({ 
        type: 'UPDATE_CONFIG',
        config: this.currentConfig
      });
      
      this.isDirty = false;
      this.showToast('All settings saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showToast('Failed to save settings', 'error');
    }
  }

  // Apply settings
  async applySettings() {
    await this.saveAllSettings();
    this.showToast('Settings applied!', 'success');
  }

  // Cancel settings
  cancelSettings() {
    if (this.isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.loadConfiguration();
        this.applySettingsToUI();
        this.isDirty = false;
      }
    } else {
      this.goBack();
    }
  }

  // Go back
  goBack() {
    if (this.isDirty) {
      if (confirm('You have unsaved changes. Save before leaving?')) {
        this.saveAllSettings();
      }
    }
    window.close();
  }

  // ========================================
  // THEME SYSTEM INTEGRATION
  // ========================================

  // Initialize theme system integration
  async initThemeSystem() {
    console.log('🎨 Initializing theme system integration...');
    
    // Wait for ThemeManager to be ready
    if (!window.ThemeManager || !window.ThemeManager.isInitialized) {
      setTimeout(() => this.initThemeSystem(), 100);
      return;
    }

    // Setup theme event listeners
    this.setupThemeEventListeners();
    
    // Load and display themes
    this.loadBuiltinThemes();
    this.loadCustomThemes();
    
    // Update current theme display
    this.updateCurrentThemeDisplay();
    
    // Setup background image handlers
    this.setupBackgroundHandlers();
    
    console.log('✅ Theme system integration initialized!');
  }

  // Setup theme-related event listeners
  setupThemeEventListeners() {
    // Built-in theme selection
    document.querySelectorAll('#builtinThemeGrid .theme-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const themeId = e.currentTarget.dataset.theme;
        this.selectTheme(themeId);
      });
    });

    // Create custom theme button
    document.getElementById('createThemeBtn')?.addEventListener('click', () => {
      this.openCustomThemeBuilder();
    });

    // Import theme button
    document.getElementById('importThemeBtn')?.addEventListener('click', () => {
      document.getElementById('importThemeFile').click();
    });

    // Import theme file
    document.getElementById('importThemeFile')?.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.importTheme(e.target.files[0]);
      }
    });

    // Background upload
    document.getElementById('uploadBackgroundBtn')?.addEventListener('click', () => {
      document.getElementById('backgroundUpload').click();
    });

    document.getElementById('backgroundUpload')?.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.uploadBackground(e.target.files[0]);
      }
    });

    // Background controls
    document.getElementById('changeBackgroundBtn')?.addEventListener('click', () => {
      document.getElementById('backgroundUpload').click();
    });

    document.getElementById('removeBackgroundBtn')?.addEventListener('click', () => {
      this.removeBackground();
    });

    // Background settings sliders
    document.getElementById('bgOpacity')?.addEventListener('input', (e) => {
      this.updateBackgroundSetting('opacity', e.target.value);
    });

    document.getElementById('bgBlur')?.addEventListener('input', (e) => {
      this.updateBackgroundSetting('blur', e.target.value);
    });

    // Export current theme
    document.getElementById('exportCurrentThemeBtn')?.addEventListener('click', () => {
      this.exportCurrentTheme();
    });

    // Reset theme
    document.getElementById('resetThemeBtn')?.addEventListener('click', () => {
      this.resetTheme();
    });

    // Listen for theme changes
    window.addEventListener('themeChanged', (e) => {
      this.onThemeChanged(e.detail);
    });
  }

  // Load and display built-in themes
  loadBuiltinThemes() {
    const themes = window.ThemeManager.getBuiltInThemes();
    const currentTheme = window.ThemeManager.getCurrentTheme();
    
    // Update active state
    document.querySelectorAll('#builtinThemeGrid .theme-card').forEach(card => {
      const isActive = card.dataset.theme === currentTheme.id;
      card.classList.toggle('active', isActive);
    });
  }

  // Load and display custom themes
  loadCustomThemes() {
    const customThemes = window.ThemeManager.customThemes;
    const grid = document.getElementById('customThemesGrid');
    const noThemesEl = document.getElementById('noCustomThemes');
    
    if (!grid) return;

    // Clear existing custom theme cards (keep no-themes placeholder)
    const existingCards = grid.querySelectorAll('.custom-theme-card');
    existingCards.forEach(card => card.remove());

    const hasCustomThemes = Object.keys(customThemes).length > 0;
    
    if (hasCustomThemes) {
      noThemesEl.style.display = 'none';
      
      // Add custom theme cards
      Object.entries(customThemes).forEach(([themeId, theme]) => {
        const card = this.createCustomThemeCard(themeId, theme);
        grid.appendChild(card);
      });
    } else {
      noThemesEl.style.display = 'flex';
    }
  }

  // Create custom theme card
  createCustomThemeCard(themeId, theme) {
    const card = document.createElement('div');
    card.className = 'custom-theme-card';
    card.dataset.theme = themeId;
    
    const currentTheme = window.ThemeManager.getCurrentTheme();
    if (themeId === currentTheme.id) {
      card.classList.add('active');
    }

    // Generate preview gradient
    const gradient = theme.gradients?.primary || 
                    `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`;

    card.innerHTML = `
      <div class="custom-theme-preview" style="background: ${gradient};"></div>
      <div class="custom-theme-name">${theme.name}</div>
      <div class="custom-theme-actions">
        <button class="custom-action-btn edit" data-action="edit" title="Edit Theme">✏️</button>
        <button class="custom-action-btn delete" data-action="delete" title="Delete Theme">🗑️</button>
      </div>
    `;

    // Add event listeners
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-theme-actions')) {
        this.selectTheme(themeId);
      }
    });

    // Action buttons
    card.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
      e.stopPropagation();
      this.editCustomTheme(themeId);
    });

    card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteCustomTheme(themeId, theme.name);
    });

    return card;
  }

  // Select theme
  selectTheme(themeId) {
    // Add transition class
    document.body.classList.add('theme-switching');
    
    // Apply theme
    window.ThemeManager.applyTheme(themeId);
    
    // Update UI
    this.updateThemeSelection(themeId);
    this.updateCurrentThemeDisplay();
    
    // Remove transition class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-switching');
    }, 600);

    const allThemes = { ...window.ThemeManager.getAllThemes().builtin, ...window.ThemeManager.getAllThemes().custom };
    const themeName = allThemes[themeId]?.name || themeId;
    this.showToast(`Theme changed to ${themeName}!`, 'success');
  }

  // Update theme selection UI
  updateThemeSelection(themeId) {
    // Update built-in themes
    document.querySelectorAll('#builtinThemeGrid .theme-card').forEach(card => {
      card.classList.toggle('active', card.dataset.theme === themeId);
    });

    // Update custom themes
    document.querySelectorAll('#customThemesGrid .custom-theme-card').forEach(card => {
      card.classList.toggle('active', card.dataset.theme === themeId);
    });
  }

  // Update current theme display
  updateCurrentThemeDisplay() {
    const currentTheme = window.ThemeManager.getCurrentTheme();
    const infoEl = document.getElementById('currentThemeInfo');
    
    if (!infoEl || !currentTheme.theme) return;

    const nameEl = infoEl.querySelector('.current-theme-name');
    const descEl = infoEl.querySelector('.current-theme-desc');
    const previewEl = infoEl.querySelector('.current-theme-preview');

    if (nameEl) nameEl.textContent = currentTheme.theme.name;
    if (descEl) descEl.textContent = currentTheme.theme.description;
    if (previewEl) {
      const gradient = currentTheme.theme.gradients?.primary || 
                      `linear-gradient(135deg, ${currentTheme.theme.colors.primary} 0%, ${currentTheme.theme.colors.secondary} 100%)`;
      previewEl.style.background = gradient;
    }
  }

  // Setup background handlers
  setupBackgroundHandlers() {
    this.updateBackgroundDisplay();
  }

  // Update background display
  updateBackgroundDisplay() {
    const hasBackground = window.ThemeManager.backgroundImage;
    const noBackgroundEl = document.getElementById('noBackground');
    const previewEl = document.getElementById('backgroundPreview');
    const settingsEl = document.getElementById('backgroundSettings');
    const imageEl = document.getElementById('currentBackgroundImage');

    if (hasBackground) {
      if (noBackgroundEl) noBackgroundEl.style.display = 'none';
      if (previewEl) previewEl.style.display = 'block';
      if (settingsEl) settingsEl.style.display = 'block';
      
      if (imageEl) {
        imageEl.src = window.ThemeManager.backgroundImage;
      }
    } else {
      if (noBackgroundEl) noBackgroundEl.style.display = 'flex';
      if (previewEl) previewEl.style.display = 'none';
      if (settingsEl) settingsEl.style.display = 'none';
    }
  }

  // Open custom theme builder
  openCustomThemeBuilder() {
    const url = chrome.runtime.getURL('../themes/custom-theme-builder/custom-theme-builder.html');
    window.open(url, '_blank', 'width=1200,height=800');
  }

  // Edit custom theme
  editCustomTheme(themeId) {
    const url = chrome.runtime.getURL(`../themes/custom-theme-builder/custom-theme-builder.html?edit=${themeId}`);
    window.open(url, '_blank', 'width=1200,height=800');
  }

  // Delete custom theme
  deleteCustomTheme(themeId, themeName) {
    if (confirm(`Are you sure you want to delete the theme "${themeName}"? This action cannot be undone.`)) {
      const success = window.ThemeManager.deleteCustomTheme(themeId);
      
      if (success) {
        this.loadCustomThemes();
        this.updateCurrentThemeDisplay();
        this.showToast(`Theme "${themeName}" deleted successfully!`, 'success');
      } else {
        this.showToast('Failed to delete theme', 'error');
      }
    }
  }

  // Import theme
  async importTheme(file) {
    try {
      const result = await window.ThemeManager.importTheme(file);
      this.loadCustomThemes();
      this.showToast(`Theme "${result.theme.name}" imported successfully!`, 'success');
      
      // Select the imported theme
      this.selectTheme(result.themeId);
      
    } catch (error) {
      this.showToast(`Failed to import theme: ${error.message}`, 'error');
    }
  }

  // Upload background image
  async uploadBackground(file) {
    try {
      await window.ThemeManager.uploadBackgroundImage(file);
      this.updateBackgroundDisplay();
      this.showToast('Background image uploaded successfully!', 'success');
    } catch (error) {
      this.showToast(`Failed to upload background: ${error.message}`, 'error');
    }
  }

  // Remove background image
  removeBackground() {
    if (confirm('Are you sure you want to remove the background image?')) {
      window.ThemeManager.removeBackgroundImage();
      this.updateBackgroundDisplay();
      this.showToast('Background image removed', 'success');
    }
  }

  // Update background setting
  updateBackgroundSetting(setting, value) {
    const root = document.documentElement;
    
    switch (setting) {
      case 'opacity':
        root.style.setProperty('--background-overlay', value);
        // Update slider display
        const opacityDisplay = document.querySelector('#bgOpacity')?.parentElement?.querySelector('.slider-value');
        if (opacityDisplay) {
          opacityDisplay.textContent = Math.round(value * 100) + '%';
        }
        break;
        
      case 'blur':
        root.style.setProperty('--background-blur', value + 'px');
        // Update slider display
        const blurDisplay = document.querySelector('#bgBlur')?.parentElement?.querySelector('.slider-value');
        if (blurDisplay) {
          blurDisplay.textContent = value + 'px';
        }
        break;
    }

    // Save settings
    window.ThemeManager.themeSettings = {
      ...window.ThemeManager.themeSettings,
      [`background${setting.charAt(0).toUpperCase() + setting.slice(1)}`]: value
    };
    
    chrome.storage.local.set({ 
      themeSettings: window.ThemeManager.themeSettings 
    });
  }

  // Export current theme
  exportCurrentTheme() {
    const currentTheme = window.ThemeManager.getCurrentTheme();
    
    if (currentTheme.theme.isCustom) {
      window.ThemeManager.exportTheme(currentTheme.id);
    } else {
      // Create exportable version of built-in theme
      const exportData = {
        name: currentTheme.theme.name + ' (Copy)',
        description: currentTheme.theme.description,
        colors: currentTheme.theme.colors,
        gradients: currentTheme.theme.gradients,
        version: '1.0',
        exported: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentTheme.theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
      a.click();

      URL.revokeObjectURL(url);
      this.showToast('Theme exported successfully!', 'success');
    }
  }

  // Reset theme to default
  resetTheme() {
    if (confirm('Are you sure you want to reset to the default theme? This will also remove any background image.')) {
      window.ThemeManager.applyTheme('professional-light');
      window.ThemeManager.removeBackgroundImage();
      
      this.updateThemeSelection('professional-light');
      this.updateCurrentThemeDisplay();
      this.updateBackgroundDisplay();
      
      this.showToast('Theme reset to default', 'success');
    }
  }

  // Handle theme change events
  onThemeChanged(detail) {
    this.updateThemeSelection(detail.themeId);
    this.updateCurrentThemeDisplay();
  }

  // Show toast notification
  showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.settings-toast').forEach(toast => toast.remove());

    // Create toast
    const toast = document.createElement('div');
    toast.className = `settings-toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${this.getToastIcon(type)}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    // Add to page
    document.body.appendChild(toast);

    // Show with animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto remove
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  // Get toast icon
  getToastIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }
}

// Initialize settings when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const settings = new SettingsController();
  settings.init();
  
  // Make available globally for inline handlers
  window.settings = settings;
});

// Add toast CSS
const toastCSS = `
.settings-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-lg);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 10000;
  max-width: 350px;
  min-width: 250px;
}

.settings-toast.show {
  transform: translateX(0);
}

.settings-toast.success {
  border-left: 4px solid var(--success);
}

.settings-toast.error {
  border-left: 4px solid var(--error);
}

.settings-toast.warning {
  border-left: 4px solid var(--warning);
}

.settings-toast.info {
  border-left: 4px solid var(--info);
}

.toast-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: var(--transition);
}

.toast-close:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}
`;

// Inject toast CSS if it doesn't exist
if (!document.querySelector('#toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = toastCSS;
  document.head.appendChild(style);
}