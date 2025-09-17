// Full Settings Panel JavaScript Integration
(function() {
  'use strict';

  // Settings Configuration Object
  const settingsConfig = {
    // Download Tests
    downloadEnabled: true,
    downloadSizes: ['256KB', '512KB', '1MB', '5MB', '10MB'],
    downloadIterations: 3,
    downloadConnections: 4,
    downloadTimeout: 30,
    
    // Upload Tests
    uploadEnabled: true,
    uploadSizes: ['1MB', '5MB'],
    uploadIterations: 2,
    uploadConnections: 2,
    
    // Latency Tests
    latencyEnabled: true,
    jitterEnabled: true,
    latencySamples: 20,
    latencyInterval: 500,
    
    // Network Tests
    ipv6Testing: true,
    http3Testing: false,
    cdnTesting: true,
    dnsPerformance: true,
    routingEfficiency: false,
    connectionStability: false,
    concurrentTesting: false,
    
    // Gaming Tests
    gamingLatency: true,
    packetLoss: true,
    
    // Interface Settings
    animationsEnabled: true,
    compactMode: false,
    highContrast: false,
    
    // Data Management
    historyRetention: 30,
    maxTestsStored: 100,
    
    // Current State
    isDirty: false,
    currentTheme: 'professional-light'
  };

  // Initialize settings panel
  const panel = document.getElementById('fullSettingsPanel');
  if (!panel) return;

  // State management
  let saveTimeout;
  let isInitialized = false;

  // Initialize everything when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSettings);
  } else {
    initializeSettings();
  }

  function initializeSettings() {
    console.log('🔥 Initializing Full Settings Panel...');
    
    // Wait for theme manager
    if (window.ThemeManager && window.ThemeManager.isInitialized) {
      setupAllEventListeners();
      loadConfiguration();
      applySettingsToUI();
      isInitialized = true;
      console.log('✅ Full Settings Panel initialized!');
    } else {
      setTimeout(initializeSettings, 100);
    }
  }

  // Setup all event listeners
  function setupAllEventListeners() {
    // Navigation
    setupNavigation();
    
    // Search functionality
    setupSearch();
    
    // Settings controls
    setupSettingsControls();
    
    // Theme system
    setupThemeSystem();
    
    // Data management
    setupDataManagement();
    
    // Footer actions
    setupFooterActions();
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Mobile navigation
    setupMobileNavigation();
    
    // Close button
    setupCloseButton();
  }

  // Navigation between categories
  function setupNavigation() {
    const navItems = panel.querySelectorAll('.nav-icon-item');
    const categoryPanels = panel.querySelectorAll('.category-panel');
    
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const category = item.dataset.category;
        
        // Update nav
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Update panels
        categoryPanels.forEach(p => p.classList.remove('active'));
        const targetPanel = panel.querySelector(`#${category}Panel`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  // Search functionality
  function setupSearch() {
    const searchInput = panel.querySelector('#settingsSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        searchSettings(query);
      });
    }
  }

  function searchSettings(query) {
    if (!query) {
      // Show all sections
      panel.querySelectorAll('.settings-section-pro').forEach(section => {
        section.style.display = 'block';
      });
      return;
    }

    panel.querySelectorAll('.settings-section-pro').forEach(section => {
      const text = section.textContent.toLowerCase();
      section.style.display = text.includes(query) ? 'block' : 'none';
    });
  }

  // Settings controls
  function setupSettingsControls() {
    // Collapsible sections
    panel.querySelectorAll('.section-header-pro.collapsible').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.closest('.settings-section-pro');
        const content = section.querySelector('.section-content');
        const icon = header.querySelector('.collapse-icon');
        
        if (header.classList.contains('collapsed')) {
          header.classList.remove('collapsed');
          content.style.display = 'block';
          icon.textContent = '−';
        } else {
          header.classList.add('collapsed');
          content.style.display = 'none';
          icon.textContent = '+';
        }
      });
    });

    // Preset selection
    panel.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        panel.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        showNotification('Preset applied successfully');
      });
    });

    // File size tags
    panel.querySelectorAll('.size-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        if (tag.classList.contains('custom')) {
          const size = prompt('Enter custom file size (e.g., 2GB):');
          if (size) {
            tag.textContent = size;
            tag.classList.add('active');
          }
        } else {
          tag.classList.toggle('active');
          updateFileSizes();
        }
        markUnsaved();
      });
    });

    // Sliders
    panel.querySelectorAll('.modern-slider').forEach(slider => {
      const updateValue = () => {
        const container = slider.closest('.slider-container');
        const valueSpan = container.querySelector('.slider-value');
        if (valueSpan) {
          const value = slider.value;
          const unit = slider.id.includes('Iterations') ? 'iterations' : 
                      slider.id.includes('Connections') ? 'connections' :
                      slider.id.includes('Samples') ? 'samples' :
                      slider.id.includes('Interval') ? 'ms' : '';
          valueSpan.textContent = `${value} ${unit}`;
        }
      };
      
      slider.addEventListener('input', updateValue);
      slider.addEventListener('change', () => {
        updateConfigFromUI();
        markUnsaved();
      });
      updateValue();
    });

    // Toggle switches
    panel.querySelectorAll('.modern-toggle').forEach(toggle => {
      toggle.addEventListener('change', () => {
        updateConfigFromUI();
        markUnsaved();
      });
    });

    // Input fields
    panel.querySelectorAll('.modern-input, .modern-select').forEach(input => {
      input.addEventListener('change', () => {
        updateConfigFromUI();
        markUnsaved();
      });
    });

    // Quick toggles
    panel.querySelectorAll('.quick-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        panel.querySelectorAll('.quick-toggle').forEach(t => t.classList.remove('active'));
        toggle.classList.add('active');
      });
    });
  }

  // Theme system integration
  function setupThemeSystem() {
    // Built-in theme selection
    panel.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        const themeId = card.dataset.theme;
        if (themeId && window.ThemeManager) {
          window.ThemeManager.applyTheme(themeId);
          updateThemeSelection(themeId);
          markUnsaved();
          showNotification(`Theme "${themeId}" applied`);
        }
      });
    });

    // Create custom theme
    const createThemeBtn = panel.querySelector('#createThemeBtn');
    if (createThemeBtn) {
      createThemeBtn.addEventListener('click', () => {
        window.open('../themes/custom-theme-builder/custom-theme-builder.html', '_blank');
      });
    }

    // Import theme
    const importThemeBtn = panel.querySelector('#importThemeBtn');
    const importThemeFile = panel.querySelector('#importThemeFile');
    
    if (importThemeBtn && importThemeFile) {
      importThemeBtn.addEventListener('click', () => {
        importThemeFile.click();
      });

      importThemeFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          importTheme(e.target.files[0]);
        }
      });
    }

    // Export current theme
    const exportThemeBtn = panel.querySelector('#exportCurrentThemeBtn');
    if (exportThemeBtn) {
      exportThemeBtn.addEventListener('click', () => {
        exportCurrentTheme();
      });
    }

    // Reset theme
    const resetThemeBtn = panel.querySelector('#resetThemeBtn');
    if (resetThemeBtn) {
      resetThemeBtn.addEventListener('click', () => {
        if (confirm('Reset to default theme?')) {
          window.ThemeManager.setTheme('professional-light');
          updateThemeSelection('professional-light');
          showNotification('Theme reset to default');
        }
      });
    }
  }

  // Data management
  function setupDataManagement() {
    // Export data
    const exportDataBtn = panel.querySelector('#exportDataBtn');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', exportAllData);
    }

    // Import data
    const importDataBtn = panel.querySelector('#importDataBtn');
    const importDataFile = panel.querySelector('#importDataFile');
    
    if (importDataBtn && importDataFile) {
      importDataBtn.addEventListener('click', () => {
        importDataFile.click();
      });

      importDataFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          importData(e.target.files[0]);
        }
      });
    }

    // Clear data
    const clearOldDataBtn = panel.querySelector('#clearOldDataBtn');
    if (clearOldDataBtn) {
      clearOldDataBtn.addEventListener('click', () => {
        if (confirm('Clear old test data? This cannot be undone.')) {
          clearOldData();
        }
      });
    }

    const clearAllDataBtn = panel.querySelector('#clearAllDataBtn');
    if (clearAllDataBtn) {
      clearAllDataBtn.addEventListener('click', () => {
        if (confirm('⚠️ Clear ALL data? This will delete everything and cannot be undone!')) {
          clearAllData();
        }
      });
    }
  }

  // Footer actions
  function setupFooterActions() {
    // Reset defaults
    const resetDefaultsBtn = panel.querySelector('#resetDefaultsBtn');
    if (resetDefaultsBtn) {
      resetDefaultsBtn.addEventListener('click', () => {
        if (confirm('Reset all settings to defaults?')) {
          resetToDefaults();
        }
      });
    }

    // Import/Export config
    const importConfigBtn = panel.querySelector('#importConfigBtn');
    const exportConfigBtn = panel.querySelector('#exportConfigBtn');
    const importConfigFile = panel.querySelector('#importConfigFile');

    if (importConfigBtn && importConfigFile) {
      importConfigBtn.addEventListener('click', () => {
        importConfigFile.click();
      });

      importConfigFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          importConfiguration(e.target.files[0]);
        }
      });
    }

    if (exportConfigBtn) {
      exportConfigBtn.addEventListener('click', exportConfiguration);
    }

    // Save/Cancel buttons
    const saveBtn = panel.querySelector('#saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveAllSettings);
    }

    const cancelBtn = panel.querySelector('#cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', cancelSettings);
    }
  }

  // Keyboard shortcuts
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (!panel.classList.contains('active')) return;
      
      // Ctrl+S to save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        autoSave();
      }
      
      // Ctrl+/ to focus search
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        const searchInput = panel.querySelector('#settingsSearch');
        if (searchInput) searchInput.focus();
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        closeSettings();
      }
    });
  }

  // Mobile navigation
  function setupMobileNavigation() {
    const navToggle = panel.querySelector('#navToggle');
    const nav = panel.querySelector('.settings-nav-pro');
    
    if (navToggle && nav) {
      navToggle.addEventListener('click', () => {
        nav.classList.toggle('mobile-open');
      });

      // Close nav when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !nav.contains(e.target) && 
            !navToggle.contains(e.target)) {
          nav.classList.remove('mobile-open');
        }
      });
    }
  }

  // Close button
  function setupCloseButton() {
    const closeBtn = panel.querySelector('#closeFullSettings');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeSettings);
    }
  }

  // Configuration management
  function loadConfiguration() {
    try {
      const saved = localStorage.getItem('wifiKickstart_fullSettings');
      if (saved) {
        const config = JSON.parse(saved);
        Object.assign(settingsConfig, config);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  }

  function saveConfiguration() {
    try {
      localStorage.setItem('wifiKickstart_fullSettings', JSON.stringify(settingsConfig));
      console.log('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }

  function applySettingsToUI() {
    // Download settings
    const downloadEnabled = panel.querySelector('#downloadEnabled');
    if (downloadEnabled) downloadEnabled.checked = settingsConfig.downloadEnabled;
    
    const downloadIterations = panel.querySelector('#downloadIterations');
    if (downloadIterations) downloadIterations.value = settingsConfig.downloadIterations;
    
    const downloadConnections = panel.querySelector('#downloadConnections');
    if (downloadConnections) downloadConnections.value = settingsConfig.downloadConnections;
    
    const downloadTimeout = panel.querySelector('#downloadTimeout');
    if (downloadTimeout) downloadTimeout.value = settingsConfig.downloadTimeout;

    // Upload settings
    const uploadEnabled = panel.querySelector('#uploadEnabled');
    if (uploadEnabled) uploadEnabled.checked = settingsConfig.uploadEnabled;
    
    const uploadIterations = panel.querySelector('#uploadIterations');
    if (uploadIterations) uploadIterations.value = settingsConfig.uploadIterations;
    
    const uploadConnections = panel.querySelector('#uploadConnections');
    if (uploadConnections) uploadConnections.value = settingsConfig.uploadConnections;

    // Latency settings
    const latencyEnabled = panel.querySelector('#latencyEnabled');
    if (latencyEnabled) latencyEnabled.checked = settingsConfig.latencyEnabled;
    
    const jitterEnabled = panel.querySelector('#jitterEnabled');
    if (jitterEnabled) jitterEnabled.checked = settingsConfig.jitterEnabled;
    
    const latencySamples = panel.querySelector('#latencySamples');
    if (latencySamples) latencySamples.value = settingsConfig.latencySamples;
    
    const latencyInterval = panel.querySelector('#latencyInterval');
    if (latencyInterval) latencyInterval.value = settingsConfig.latencyInterval;

    // Network settings
    const ipv6Testing = panel.querySelector('#ipv6Testing');
    if (ipv6Testing) ipv6Testing.checked = settingsConfig.ipv6Testing;
    
    const http3Testing = panel.querySelector('#http3Testing');
    if (http3Testing) http3Testing.checked = settingsConfig.http3Testing;
    
    const cdnTesting = panel.querySelector('#cdnTesting');
    if (cdnTesting) cdnTesting.checked = settingsConfig.cdnTesting;
    
    const dnsPerformance = panel.querySelector('#dnsPerformance');
    if (dnsPerformance) dnsPerformance.checked = settingsConfig.dnsPerformance;

    // Interface settings
    const animationsEnabled = panel.querySelector('#animationsEnabled');
    if (animationsEnabled) animationsEnabled.checked = settingsConfig.animationsEnabled;
    
    const compactMode = panel.querySelector('#compactMode');
    if (compactMode) compactMode.checked = settingsConfig.compactMode;
    
    const highContrast = panel.querySelector('#highContrast');
    if (highContrast) highContrast.checked = settingsConfig.highContrast;

    // Data settings
    const historyRetention = panel.querySelector('#historyRetention');
    if (historyRetention) historyRetention.value = settingsConfig.historyRetention;
    
    const maxTestsStored = panel.querySelector('#maxTestsStored');
    if (maxTestsStored) maxTestsStored.value = settingsConfig.maxTestsStored;

    // Update file sizes
    updateFileSizeDisplay();
    
    // Update all slider values
    panel.querySelectorAll('.modern-slider').forEach(slider => {
      slider.dispatchEvent(new Event('input'));
    });
  }

  function updateConfigFromUI() {
    // Download settings
    const downloadEnabled = panel.querySelector('#downloadEnabled');
    if (downloadEnabled) settingsConfig.downloadEnabled = downloadEnabled.checked;
    
    const downloadIterations = panel.querySelector('#downloadIterations');
    if (downloadIterations) settingsConfig.downloadIterations = parseInt(downloadIterations.value);
    
    const downloadConnections = panel.querySelector('#downloadConnections');
    if (downloadConnections) settingsConfig.downloadConnections = parseInt(downloadConnections.value);
    
    const downloadTimeout = panel.querySelector('#downloadTimeout');
    if (downloadTimeout) settingsConfig.downloadTimeout = parseInt(downloadTimeout.value);

    // Upload settings
    const uploadEnabled = panel.querySelector('#uploadEnabled');
    if (uploadEnabled) settingsConfig.uploadEnabled = uploadEnabled.checked;
    
    const uploadIterations = panel.querySelector('#uploadIterations');
    if (uploadIterations) settingsConfig.uploadIterations = parseInt(uploadIterations.value);
    
    const uploadConnections = panel.querySelector('#uploadConnections');
    if (uploadConnections) settingsConfig.uploadConnections = parseInt(uploadConnections.value);

    // Latency settings
    const latencyEnabled = panel.querySelector('#latencyEnabled');
    if (latencyEnabled) settingsConfig.latencyEnabled = latencyEnabled.checked;
    
    const jitterEnabled = panel.querySelector('#jitterEnabled');
    if (jitterEnabled) settingsConfig.jitterEnabled = jitterEnabled.checked;
    
    const latencySamples = panel.querySelector('#latencySamples');
    if (latencySamples) settingsConfig.latencySamples = parseInt(latencySamples.value);
    
    const latencyInterval = panel.querySelector('#latencyInterval');
    if (latencyInterval) settingsConfig.latencyInterval = parseInt(latencyInterval.value);

    // Interface settings
    const animationsEnabled = panel.querySelector('#animationsEnabled');
    if (animationsEnabled) settingsConfig.animationsEnabled = animationsEnabled.checked;
    
    const compactMode = panel.querySelector('#compactMode');
    if (compactMode) settingsConfig.compactMode = compactMode.checked;
    
    const highContrast = panel.querySelector('#highContrast');
    if (highContrast) settingsConfig.highContrast = highContrast.checked;

    // Data settings
    const historyRetention = panel.querySelector('#historyRetention');
    if (historyRetention) settingsConfig.historyRetention = parseInt(historyRetention.value);
    
    const maxTestsStored = panel.querySelector('#maxTestsStored');
    if (maxTestsStored) settingsConfig.maxTestsStored = parseInt(maxTestsStored.value);
  }

  function updateFileSizes() {
    const downloadSizes = [];
    const uploadSizes = [];
    
    panel.querySelectorAll('.size-tag.active').forEach(tag => {
      const size = tag.dataset.size;
      if (size && size !== 'custom') {
        // Determine if it's in download or upload section
        const section = tag.closest('.settings-section-pro');
        const sectionTitle = section.querySelector('h2').textContent;
        
        if (sectionTitle.includes('Download')) {
          downloadSizes.push(size);
        } else if (sectionTitle.includes('Upload')) {
          uploadSizes.push(size);
        }
      }
    });
    
    settingsConfig.downloadSizes = downloadSizes;
    settingsConfig.uploadSizes = uploadSizes;
  }

  function updateFileSizeDisplay() {
    // Update download sizes
    const downloadSection = panel.querySelector('#performancePanel');
    if (downloadSection) {
      const downloadTags = downloadSection.querySelectorAll('.size-tag');
      downloadTags.forEach(tag => {
        const size = tag.dataset.size;
        tag.classList.toggle('active', settingsConfig.downloadSizes.includes(size));
      });
    }
  }

  // Save indicator
  function markUnsaved() {
    settingsConfig.isDirty = true;
    const saveIndicator = panel.querySelector('#saveIndicator');
    
    if (saveIndicator) {
      saveIndicator.textContent = 'Unsaved changes';
      saveIndicator.classList.add('saving');
      saveIndicator.classList.remove('saved');
      
      // Auto-save after 2 seconds of no changes
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(autoSave, 2000);
    }
  }
  
  function autoSave() {
    updateConfigFromUI();
    saveConfiguration();
    
    const saveIndicator = panel.querySelector('#saveIndicator');
    if (saveIndicator) {
      saveIndicator.textContent = 'Saving...';
      
      setTimeout(() => {
        saveIndicator.textContent = 'All changes saved';
        saveIndicator.classList.remove('saving');
        saveIndicator.classList.add('saved');
        settingsConfig.isDirty = false;
      }, 500);
    }
  }

  // Theme management functions
  function updateThemeSelection(themeId) {
    panel.querySelectorAll('.theme-card').forEach(card => {
      card.classList.toggle('active', card.dataset.theme === themeId);
    });
    
    // Update current theme info
    const currentThemeInfo = panel.querySelector('#currentThemeInfo');
    if (currentThemeInfo) {
      const themeName = currentThemeInfo.querySelector('.current-theme-name');
      const themeDesc = currentThemeInfo.querySelector('.current-theme-desc');
      
      // Update based on theme
      const themeData = getThemeDisplayData(themeId);
      if (themeName) themeName.textContent = themeData.name;
      if (themeDesc) themeDesc.textContent = themeData.description;
    }
    
    settingsConfig.currentTheme = themeId;
  }

  function getThemeDisplayData(themeId) {
    const themes = {
      'professional-light': { name: 'Professional Light', description: 'Clean corporate design' },
      'professional-dark': { name: 'Professional Dark', description: 'Professional with dark aesthetics' },
      'epic-light': { name: 'Epic Light', description: 'Cosmic vibes, bright background' },
      'epic-dark': { name: 'Epic Dark', description: 'Deep space gradients' },
      'hacker-light': { name: 'Hacker Light', description: 'Terminal aesthetics' },
      'hacker-dark': { name: 'Hacker Dark', description: 'Matrix green terminal' },
      'gaming-light': { name: 'Gaming Light', description: 'RGB aesthetics' },
      'gaming-dark': { name: 'Gaming Dark', description: 'RGB neon beast mode' }
    };
    
    return themes[themeId] || { name: themeId, description: 'Custom theme' };
  }

  function importTheme(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target.result);
        if (window.ThemeManager && window.ThemeManager.importTheme) {
          window.ThemeManager.importTheme(themeData);
          showNotification('Theme imported successfully!');
        }
      } catch (error) {
        showNotification('Error importing theme: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  function exportCurrentTheme() {
    if (window.ThemeManager && window.ThemeManager.exportCurrentTheme) {
      window.ThemeManager.exportCurrentTheme();
      showNotification('Theme exported successfully!');
    } else {
      showNotification('Theme export not available', 'error');
    }
  }

  // Data management functions
  function exportAllData() {
    try {
      const data = {
        settings: settingsConfig,
        testHistory: JSON.parse(localStorage.getItem('wifiKickstart_testHistory') || '[]'),
        themes: JSON.parse(localStorage.getItem('wifiKickstart_customThemes') || '[]'),
        exportDate: new Date().toISOString(),
        version: '2.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wifi-kickstart-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showNotification('Data exported successfully!');
    } catch (error) {
      showNotification('Error exporting data: ' + error.message, 'error');
    }
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.settings) {
          Object.assign(settingsConfig, data.settings);
          applySettingsToUI();
        }
        
        if (data.testHistory) {
          localStorage.setItem('wifiKickstart_testHistory', JSON.stringify(data.testHistory));
        }
        
        if (data.themes) {
          localStorage.setItem('wifiKickstart_customThemes', JSON.stringify(data.themes));
        }
        
        saveConfiguration();
        showNotification('Data imported successfully!');
        
      } catch (error) {
        showNotification('Error importing data: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  function clearOldData() {
    try {
      const testHistory = JSON.parse(localStorage.getItem('wifiKickstart_testHistory') || '[]');
      const retentionDays = settingsConfig.historyRetention;
      
      if (retentionDays === 0) {
        showNotification('Retention set to forever, no data to clear');
        return;
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const filteredHistory = testHistory.filter(test => {
        return new Date(test.timestamp) > cutoffDate;
      });
      
      localStorage.setItem('wifiKickstart_testHistory', JSON.stringify(filteredHistory));
      
      const deletedCount = testHistory.length - filteredHistory.length;
      showNotification(`Cleared ${deletedCount} old test records`);
      updateDataStats();
      
    } catch (error) {
      showNotification('Error clearing old data: ' + error.message, 'error');
    }
  }

  function clearAllData() {
    try {
      localStorage.removeItem('wifiKickstart_testHistory');
      localStorage.removeItem('wifiKickstart_customThemes');
      
      showNotification('All data cleared successfully');
      updateDataStats();
      
    } catch (error) {
      showNotification('Error clearing data: ' + error.message, 'error');
    }
  }

  function updateDataStats() {
    try {
      const testHistory = JSON.parse(localStorage.getItem('wifiKickstart_testHistory') || '[]');
      const customThemes = JSON.parse(localStorage.getItem('wifiKickstart_customThemes') || '[]');
      
      // Calculate storage usage (rough estimate)
      const historySize = new Blob([JSON.stringify(testHistory)]).size;
      const themesSize = new Blob([JSON.stringify(customThemes)]).size;
      const totalSize = historySize + themesSize;
      
      const testsStored = panel.querySelector('#testsStored');
      if (testsStored) testsStored.textContent = testHistory.length;
      
      const storageUsed = panel.querySelector('#storageUsed');
      if (storageUsed) storageUsed.textContent = `${(totalSize / 1024 / 1024).toFixed(2)} MB`;
      
      // Update sidebar stats
      const totalTestsRun = panel.querySelector('#totalTestsRun');
      if (totalTestsRun) totalTestsRun.textContent = testHistory.length;
      
      const totalDataStored = panel.querySelector('#totalDataStored');
      if (totalDataStored) totalDataStored.textContent = `${(totalSize / 1024 / 1024).toFixed(1)} MB`;
      
      const lastTestTime = panel.querySelector('#lastTestTime');
      if (lastTestTime && testHistory.length > 0) {
        const lastTest = testHistory[testHistory.length - 1];
        const lastDate = new Date(lastTest.timestamp);
        lastTestTime.textContent = lastDate.toLocaleDateString();
      }
      
    } catch (error) {
      console.error('Error updating data stats:', error);
    }
  }

  // Configuration import/export
  function exportConfiguration() {
    try {
      const config = {
        settings: settingsConfig,
        exportDate: new Date().toISOString(),
        version: '2.0'
      };
      
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wifi-kickstart-config-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showNotification('Configuration exported successfully!');
    } catch (error) {
      showNotification('Error exporting configuration: ' + error.message, 'error');
    }
  }

  function importConfiguration(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        
        if (config.settings) {
          Object.assign(settingsConfig, config.settings);
          applySettingsToUI();
          saveConfiguration();
          showNotification('Configuration imported successfully!');
        } else {
          showNotification('Invalid configuration file', 'error');
        }
        
      } catch (error) {
        showNotification('Error importing configuration: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  function resetToDefaults() {
    // Reset to default configuration
    const defaults = {
      downloadEnabled: true,
      downloadSizes: ['256KB', '512KB', '1MB', '5MB', '10MB'],
      downloadIterations: 3,
      downloadConnections: 4,
      downloadTimeout: 30,
      uploadEnabled: true,
      uploadSizes: ['1MB', '5MB'],
      uploadIterations: 2,
      uploadConnections: 2,
      latencyEnabled: true,
      jitterEnabled: true,
      latencySamples: 20,
      latencyInterval: 500,
      ipv6Testing: true,
      http3Testing: false,
      cdnTesting: true,
      dnsPerformance: true,
      routingEfficiency: false,
      connectionStability: false,
      concurrentTesting: false,
      gamingLatency: true,
      packetLoss: true,
      animationsEnabled: true,
      compactMode: false,
      highContrast: false,
      historyRetention: 30,
      maxTestsStored: 100,
      isDirty: false,
      currentTheme: 'professional-light'
    };
    
    Object.assign(settingsConfig, defaults);
    applySettingsToUI();
    saveConfiguration();
    
    // Reset theme
    if (window.ThemeManager) {
      window.ThemeManager.setTheme('professional-light');
    }
    
    showNotification('Settings reset to defaults');
  }

  // Main action functions
  function saveAllSettings() {
    updateConfigFromUI();
    saveConfiguration();
    
    // Apply settings to the application
    if (window.epicEngine) {
      window.epicEngine.updateConfig(settingsConfig);
    }
    
    showNotification('All settings saved successfully!');
    settingsConfig.isDirty = false;
    
    const saveIndicator = panel.querySelector('#saveIndicator');
    if (saveIndicator) {
      saveIndicator.textContent = 'All changes saved';
      saveIndicator.classList.remove('saving');
      saveIndicator.classList.add('saved');
    }
  }

  function cancelSettings() {
    if (settingsConfig.isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        loadConfiguration();
        applySettingsToUI();
        settingsConfig.isDirty = false;
        showNotification('Changes cancelled');
      }
    } else {
      closeSettings();
    }
  }

  function closeSettings() {
    if (settingsConfig.isDirty) {
      if (confirm('You have unsaved changes. Save before closing?')) {
        saveAllSettings();
      }
    }
    
    panel.classList.remove('active');
    
    // Close window if opened in new window/tab
    if (window.opener) {
      window.close();
    }
  }

  // Notification system
  function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = 'settings-notification';
    notif.textContent = message;
    
    if (type === 'error') {
      notif.style.background = '#dc3545';
    } else if (type === 'warning') {
      notif.style.background = '#ffa726';
    }
    
    notif.style.animation = 'slideIn 0.3s ease';
    document.body.appendChild(notif);
    
    setTimeout(() => {
      notif.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  // Show notification/toast
function showNotification(message, type = 'info') {
  // Remove existing toasts
  document.querySelectorAll('.settings-toast').forEach(toast => toast.remove());

  const toast = document.createElement('div');
  toast.className = `settings-toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${getToastIcon(type)}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

function getToastIcon(type) {
  const icons = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type] || icons.info;
}

  // Public API for external access
  window.FullSettingsPanel = {
    isInitialized: () => isInitialized,
    getConfig: () => ({ ...settingsConfig }),
    updateConfig: (newConfig) => {
      Object.assign(settingsConfig, newConfig);
      applySettingsToUI();
      markUnsaved();
    },
    save: saveAllSettings,
    load: loadConfiguration,
    reset: resetToDefaults,
    show: () => panel.classList.add('active'),
    hide: () => panel.classList.remove('active'),
    toggle: () => panel.classList.toggle('active')
  };

  // Initialize data stats on load
  setTimeout(updateDataStats, 1000);

})();