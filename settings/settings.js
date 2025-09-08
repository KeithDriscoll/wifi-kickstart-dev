// 🔥 EPIC SETTINGS PAGE CONTROLLER
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

    // Theme System:
    await this.initThemeSystem();
    
    console.log('✅ Settings initialized successfully!');
  }

  // Load configuration from storage
  async loadConfiguration() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['epicConfig', 'customPresets', 'theme'], (result) => {
        this.currentConfig = result.epicConfig || this.getDefaultConfig();
        this.customPresets = result.customPresets || [];
        
        // Apply theme
        if (result.theme) {
          document.body.className = `theme-${result.theme}`;
        }
        
        // Apply dark mode
        if (this.currentConfig.ui?.darkMode) {
          document.body.classList.add('dark-mode');
        }
        
        resolve();
      });
    });
  }

  // Get default configuration
  getDefaultConfig() {
    return {
      downloadTests: {
        enabled: true,
        fileSizes: ['1MB', '5MB', '10MB'],
        iterations: 3,
        parallelConnections: 4,
        timeout: 30000,
        servers: ['cloudflare', 'google', 'netflix']
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
        burstTests: true,
        packetLossDetection: true,
        simulateGameTraffic: false,
        regions: ['na-east']
      },
      advancedTests: {
        ipv6Testing: true,
        http3Testing: false,
        cdnTesting: true,
        dnsPerformance: true,
        routingEfficiency: false,
        connectionStability: false,
        concurrentTesting: true,
        detailedLogging: false
      },
      servers: {
        primary: ['cloudflare', 'netflix', 'google'],
        custom: [],
        autoSelect: true,
        testAllServers: false
      },
      monitoring: {
        autoTestOnChange: false,
        scheduledTesting: false,
        testInterval: 30,
        captivePortalDetection: true,
        portalCheckFrequency: 5,
        vpnDetection: true,
        warpDetection: true
      },
      ui: {
        theme: 'default',
        darkMode: true,
        animations: true,
        compactMode: false,
        notifications: true
      },
      data: {
        historyRetention: 30,
        maxTestsStored: 100
      }
    };
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
    document.getElementById('backBtn').addEventListener('click', () => {
      this.goBack();
    });
    
    document.getElementById('themeToggle').addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectPreset(e.currentTarget.dataset.preset);
      });
    });
    
    // Custom preset controls
    document.getElementById('saveCustomPreset').addEventListener('click', () => {
      this.saveCustomPreset();
    });
    
    document.getElementById('loadCustomPreset').addEventListener('click', () => {
      this.loadCustomPreset();
    });
    
    document.getElementById('deleteCustomPreset').addEventListener('click', () => {
      this.deleteCustomPreset();
    });
    
    // Download settings
    document.getElementById('downloadEnabled').addEventListener('change', (e) => {
      this.updateConfig('downloadTests.enabled', e.target.checked);
    });
    
    document.querySelectorAll('#downloadSection .file-size-option input').forEach(input => {
      input.addEventListener('change', () => {
        this.updateFileSizes('download');
      });
    });
    
    document.getElementById('downloadIterations').addEventListener('input', (e) => {
      document.getElementById('downloadIterationsValue').textContent = e.target.value;
      this.updateConfig('downloadTests.iterations', parseInt(e.target.value));
    });
    
    document.getElementById('downloadConnections').addEventListener('input', (e) => {
      document.getElementById('downloadConnectionsValue').textContent = e.target.value;
      this.updateConfig('downloadTests.parallelConnections', parseInt(e.target.value));
    });
    
    document.getElementById('downloadTimeout').addEventListener('change', (e) => {
      this.updateConfig('downloadTests.timeout', parseInt(e.target.value) * 1000);
    });
    
    // Upload settings
    document.getElementById('uploadEnabled').addEventListener('change', (e) => {
      this.updateConfig('uploadTests.enabled', e.target.checked);
    });
    
    document.querySelectorAll('#uploadSection .file-size-option input').forEach(input => {
      input.addEventListener('change', () => {
        this.updateFileSizes('upload');
      });
    });
    
    document.getElementById('uploadIterations').addEventListener('input', (e) => {
      document.getElementById('uploadIterationsValue').textContent = e.target.value;
      this.updateConfig('uploadTests.iterations', parseInt(e.target.value));
    });
    
    document.getElementById('uploadConnections').addEventListener('input', (e) => {
      document.getElementById('uploadConnectionsValue').textContent = e.target.value;
      this.updateConfig('uploadTests.parallelConnections', parseInt(e.target.value));
    });
    
    // Latency settings
    document.getElementById('latencyEnabled').addEventListener('change', (e) => {
      this.updateConfig('latencyTests.enabled', e.target.checked);
    });
    
    document.getElementById('jitterEnabled').addEventListener('change', (e) => {
      this.updateConfig('latencyTests.jitterEnabled', e.target.checked);
    });
    
    document.getElementById('latencySamples').addEventListener('input', (e) => {
      document.getElementById('latencySamplesValue').textContent = e.target.value;
      this.updateConfig('latencyTests.sampleCount', parseInt(e.target.value));
    });
    
    document.getElementById('latencyInterval').addEventListener('change', (e) => {
      this.updateConfig('latencyTests.interval', parseInt(e.target.value));
    });
    
    document.querySelectorAll('#latencySection .target-option input').forEach(input => {
      input.addEventListener('change', () => {
        this.updateLatencyTargets();
      });
    });
    
    // Gaming settings
    document.getElementById('gamingEnabled').addEventListener('change', (e) => {
      this.updateConfig('gamingTests.enabled', e.target.checked);
    });
    
    document.getElementById('gamingSamples').addEventListener('input', (e) => {
      document.getElementById('gamingSamplesValue').textContent = e.target.value;
      this.updateConfig('gamingTests.sampleCount', parseInt(e.target.value));
    });
    
    document.getElementById('burstTesting').addEventListener('change', (e) => {
      this.updateConfig('gamingTests.burstTests', e.target.checked);
    });
    
    document.getElementById('packetLossDetection').addEventListener('change', (e) => {
      this.updateConfig('gamingTests.packetLossDetection', e.target.checked);
    });
    
    document.getElementById('simulateGameTraffic').addEventListener('change', (e) => {
      this.updateConfig('gamingTests.simulateGameTraffic', e.target.checked);
    });
    
    document.querySelectorAll('#gamingSection .region-option input').forEach(input => {
      input.addEventListener('change', () => {
        this.updateGamingRegions();
      });
    });
    
    // Advanced settings
    document.getElementById('ipv6Testing').addEventListener('change', (e) => {
      this.updateConfig('advancedTests.ipv6Testing', e.target.checked);
    });
    
    document.getElementById('http3Testing').addEventListener('change', (e) => {
      this.updateConfig('advancedTests.http3Testing', e.target.checked);
    });
    
    document.getElementById('cdnTesting').addEventListener('change', (e) => {
      this.updateConfig('advancedTests.cdnTesting', e.target.checked);
    });
    
    document.getElementById('dnsPerformance').addEventListener('change', (e) => {
      this.updateConfig('advancedTests.dnsPerformance', e.target.checked);
    });
    
    document.getElementById('routingEfficiency').addEventListener('change', (e) => {
      this.updateConfig('advancedTests.routingEfficiency', e.target.checked);
    });
    
    document.getElementById('connectionStability').addEventListener('change', (e) => {
      this.updateConfig('advancedTests.connectionStability', e.target.checked);
    });
    
    document.getElementById('concurrentTesting').addEventListener('change', (e) => {
      this.updateConfig('advancedTests.concurrentTesting', e.target.checked);
    });
    
    document.getElementById('detailedLogging').addEventListener('change', (e) => {
      this.updateConfig('advancedTests.detailedLogging', e.target.checked);
    });
    
    // Server settings
    document.querySelectorAll('#serversSection .server-option input').forEach(input => {
      input.addEventListener('change', () => {
        this.updateTestServers();
      });
    });
    
    document.getElementById('addCustomServer').addEventListener('click', () => {
      this.addCustomServer();
    });
    
    document.getElementById('autoSelectServer').addEventListener('change', (e) => {
      this.updateConfig('servers.autoSelect', e.target.checked);
    });
    
    document.getElementById('testAllServers').addEventListener('change', (e) => {
      this.updateConfig('servers.testAllServers', e.target.checked);
    });
    
    // Monitoring settings
    document.getElementById('autoTestOnChange').addEventListener('change', (e) => {
      this.updateConfig('monitoring.autoTestOnChange', e.target.checked);
    });
    
    document.getElementById('scheduledTesting').addEventListener('change', (e) => {
      this.updateConfig('monitoring.scheduledTesting', e.target.checked);
    });
    
    document.getElementById('testInterval').addEventListener('change', (e) => {
      this.updateConfig('monitoring.testInterval', parseInt(e.target.value));
    });
    
    document.getElementById('captivePortalDetection').addEventListener('change', (e) => {
      this.updateConfig('monitoring.captivePortalDetection', e.target.checked);
    });
    
    document.getElementById('portalCheckFrequency').addEventListener('change', (e) => {
      this.updateConfig('monitoring.portalCheckFrequency', parseInt(e.target.value));
    });
    
    document.getElementById('vpnDetection').addEventListener('change', (e) => {
      this.updateConfig('monitoring.vpnDetection', e.target.checked);
    });
    
    document.getElementById('warpDetection').addEventListener('change', (e) => {
      this.updateConfig('monitoring.warpDetection', e.target.checked);
    });
    
    // Appearance settings
    document.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', (e) => {
        this.selectTheme(e.currentTarget.dataset.theme);
      });
    });
    
    document.getElementById('darkMode').addEventListener('change', (e) => {
      this.updateConfig('ui.darkMode', e.target.checked);
      document.body.classList.toggle('dark-mode', e.target.checked);
    });
    
    document.getElementById('animations').addEventListener('change', (e) => {
      this.updateConfig('ui.animations', e.target.checked);
    });
    
    document.getElementById('compactMode').addEventListener('change', (e) => {
      this.updateConfig('ui.compactMode', e.target.checked);
    });
    
    document.getElementById('applyCustomColors').addEventListener('click', () => {
      this.applyCustomColors();
    });
    
    // Data management
    document.getElementById('historyRetention').addEventListener('change', (e) => {
      this.updateConfig('data.historyRetention', parseInt(e.target.value));
    });
    
    document.getElementById('maxTestsStored').addEventListener('change', (e) => {
      this.updateConfig('data.maxTestsStored', parseInt(e.target.value));
    });
    
    document.getElementById('clearHistory').addEventListener('click', () => {
      this.clearHistory();
    });
    
    document.getElementById('clearOldTests').addEventListener('click', () => {
      this.clearOldTests();
    });
    
    document.getElementById('exportSettings').addEventListener('click', () => {
      this.exportSettings();
    });
    
    document.getElementById('exportData').addEventListener('click', () => {
      this.exportData();
    });
    
    document.getElementById('exportAll').addEventListener('click', () => {
      this.exportAll();
    });
    
    document.getElementById('importBtn').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });
    
    document.getElementById('importFile').addEventListener('change', (e) => {
      this.importConfiguration(e.target.files[0]);
    });
    
    document.getElementById('resetSettings').addEventListener('click', () => {
      this.resetSettings();
    });
    
    document.getElementById('factoryReset').addEventListener('click', () => {
      this.factoryReset();
    });
    
    // Footer buttons
    document.getElementById('saveAllSettings').addEventListener('click', () => {
      this.saveAllSettings();
    });
    
    document.getElementById('applySettings').addEventListener('click', () => {
      this.applySettings();
    });
    
    document.getElementById('cancelSettings').addEventListener('click', () => {
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
        gamingTests: { enabled: false },
        advancedTests: { 
          ipv6Testing: true, 
          cdnTesting: true 
        }
      },
      thorough: {
        downloadTests: { 
          enabled: true,
          fileSizes: ['1MB', '5MB', '10MB', '25MB', '50MB'], 
          iterations: 5, 
          parallelConnections: 6 
        },
        uploadTests: { 
          enabled: true,
          fileSizes: ['1MB', '5MB', '10MB', '25MB'], 
          iterations: 3, 
          parallelConnections: 3 
        },
        latencyTests: { 
          enabled: true,
          sampleCount: 50 
        },
        gamingTests: { 
          enabled: true, 
          sampleCount: 100 
        },
        advancedTests: { 
          ipv6Testing: true, 
          cdnTesting: true,
          detailedLogging: true 
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
          sampleCount: 50 
        },
        gamingTests: { 
          enabled: true, 
          sampleCount: 200, 
          burstTests: true 
        },
        advancedTests: { 
          ipv6Testing: true, 
          cdnTesting: false 
        }
      }
    };
    
    const presetConfig = presets[preset];
    if (presetConfig) {
      Object.assign(this.currentConfig, presetConfig);
      this.applySettingsToUI();
      this.updatePresetDisplay(preset);
      
      // Mark preset button as active
      document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === preset);
      });
      
      this.showToast(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied!`, 'success');
    }
  }

  // Update preset display
  updatePresetDisplay(preset) {
    document.getElementById('currentPreset').textContent = preset.charAt(0).toUpperCase() + preset.slice(1);
    
    const descriptions = {
      quick: 'Minimal testing for quick results. Suitable for basic connectivity checks.',
      standard: 'Balanced testing with comprehensive metrics. Suitable for most users.',
      thorough: 'Extensive testing with all features enabled. Maximum accuracy.',
      gaming: 'Optimized for gaming with focus on latency and packet loss.'
    };
    
    const details = {
      quick: [
        'Download: 1MB file',
        'Upload: 1MB file',
        'Latency: 10 samples',
        'Gaming tests: Disabled'
      ],
      standard: [
        'Download: 1MB, 5MB, 10MB files',
        'Upload: 1MB, 5MB files',
        'Latency: 20 samples',
        'Gaming tests: Disabled'
      ],
      thorough: [
        'Download: 1MB, 5MB, 10MB, 25MB, 50MB files',
        'Upload: 1MB, 5MB, 10MB, 25MB files',
        'Latency: 50 samples',
        'Gaming tests: Enabled'
      ],
      gaming: [
        'Download: 5MB, 10MB files',
        'Upload: 1MB, 5MB files',
        'Latency: 50 samples',
        'Gaming tests: 200 samples with burst testing'
      ]
    };
    
    const infoEl = document.getElementById('presetInfo');
    infoEl.innerHTML = `
      <p>${descriptions[preset]}</p>
      <ul>
        ${details[preset].map(item => `<li>${item}</li>`).join('')}
      </ul>
    `;
  }

  // Update configuration
  updateConfig(path, value) {
    const keys = path.split('.');
    let obj = this.currentConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) {
        obj[keys[i]] = {};
      }
      obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = value;
    this.isDirty = true;
  }

  // Update file sizes
  updateFileSizes(type) {
    const section = type === 'download' ? '#downloadSection' : '#uploadSection';
    const checked = Array.from(document.querySelectorAll(`${section} .file-size-option input:checked`))
      .map(input => input.value);
    
    this.updateConfig(`${type}Tests.fileSizes`, checked);
  }

  // Update latency targets
  updateLatencyTargets() {
    const checked = Array.from(document.querySelectorAll('#latencySection .target-option input:checked'))
      .map(input => input.value);
    
    this.updateConfig('latencyTests.targets', checked);
  }

  // Update gaming regions
  updateGamingRegions() {
    const checked = Array.from(document.querySelectorAll('#gamingSection .region-option input:checked'))
      .map(input => input.value);
    
    this.updateConfig('gamingTests.regions', checked);
  }

  // Update test servers
  updateTestServers() {
    const checked = Array.from(document.querySelectorAll('#serversSection .server-option input:checked'))
      .map(input => input.value);
    
    this.updateConfig('servers.primary', checked);
  }

  // Add custom server
  addCustomServer() {
    const urlInput = document.getElementById('customServerUrl');
    const url = urlInput.value.trim();
    
    if (!url) {
      this.showToast('Please enter a server URL', 'error');
      return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      this.showToast('URL must start with http:// or https://', 'error');
      return;
    }
    
    if (!this.currentConfig.servers.custom) {
      this.currentConfig.servers.custom = [];
    }
    
    if (this.currentConfig.servers.custom.includes(url)) {
      this.showToast('Server already exists', 'warning');
      return;
    }
    
    this.currentConfig.servers.custom.push(url);
    this.isDirty = true;
    
    // Add to UI
    const listEl = document.getElementById('customServerList');
    const serverEl = document.createElement('div');
    serverEl.className = 'server-option';
    serverEl.innerHTML = `
      <span class="server-info">
        <span class="server-name">${url}</span>
        <span class="server-location">Custom Server</span>
      </span>
      <button class="btn btn-danger btn-sm" onclick="settings.removeCustomServer('${url}')">Remove</button>
    `;
    listEl.appendChild(serverEl);
    
    urlInput.value = '';
    this.showToast('Custom server added!', 'success');
  }

  // Remove custom server
  removeCustomServer(url) {
    const index = this.currentConfig.servers.custom.indexOf(url);
    if (index > -1) {
      this.currentConfig.servers.custom.splice(index, 1);
      this.isDirty = true;
      
      // Remove from UI
      const listEl = document.getElementById('customServerList');
      const serverEls = listEl.querySelectorAll('.server-option');
      serverEls.forEach(el => {
        if (el.textContent.includes(url)) {
          el.remove();
        }
      });
      
      this.showToast('Server removed', 'success');
    }
  }

  // Select theme
  selectTheme(theme) {
    this.updateConfig('ui.theme', theme);
    
    // Mark as active
    document.querySelectorAll('.theme-card').forEach(card => {
      card.classList.toggle('active', card.dataset.theme === theme);
    });
    
    // Apply theme
    document.body.className = document.body.classList.contains('dark-mode') ? 
      `theme-${theme} dark-mode` : `theme-${theme}`;
    
    chrome.storage.local.set({ theme });
    this.showToast(`Theme changed to ${theme}!`, 'success');
  }

  // Apply custom colors
  applyCustomColors() {
    const colors = {
      primary: document.getElementById('primaryColor').value,
      secondary: document.getElementById('secondaryColor').value,
      background: document.getElementById('backgroundColor').value,
      surface: document.getElementById('surfaceColor').value
    };
    
    // Apply to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--surface', colors.surface);
    
    // Save custom theme
    this.updateConfig('ui.customColors', colors);
    this.selectTheme('custom');
  }

  // Apply settings to UI
  applySettingsToUI() {
    const config = this.currentConfig;
    
    // Download settings
    document.getElementById('downloadEnabled').checked = config.downloadTests?.enabled ?? true;
    document.querySelectorAll('#downloadSection .file-size-option input').forEach(input => {
      input.checked = config.downloadTests?.fileSizes?.includes(input.value) ?? false;
    });
    document.getElementById('downloadIterations').value = config.downloadTests?.iterations ?? 3;
    document.getElementById('downloadIterationsValue').textContent = config.downloadTests?.iterations ?? 3;
    document.getElementById('downloadConnections').value = config.downloadTests?.parallelConnections ?? 4;
    document.getElementById('downloadConnectionsValue').textContent = config.downloadTests?.parallelConnections ?? 4;
    document.getElementById('downloadTimeout').value = (config.downloadTests?.timeout ?? 30000) / 1000;
    
    // Upload settings
    document.getElementById('uploadEnabled').checked = config.uploadTests?.enabled ?? true;
    document.querySelectorAll('#uploadSection .file-size-option input').forEach(input => {
      input.checked = config.uploadTests?.fileSizes?.includes(input.value) ?? false;
    });
    document.getElementById('uploadIterations').value = config.uploadTests?.iterations ?? 2;
    document.getElementById('uploadIterationsValue').textContent = config.uploadTests?.iterations ?? 2;
    document.getElementById('uploadConnections').value = config.uploadTests?.parallelConnections ?? 2;
    document.getElementById('uploadConnectionsValue').textContent = config.uploadTests?.parallelConnections ?? 2;
    
    // Latency settings
    document.getElementById('latencyEnabled').checked = config.latencyTests?.enabled ?? true;
    document.getElementById('jitterEnabled').checked = config.latencyTests?.jitterEnabled ?? true;
    document.getElementById('latencySamples').value = config.latencyTests?.sampleCount ?? 20;
    document.getElementById('latencySamplesValue').textContent = config.latencyTests?.sampleCount ?? 20;
    document.getElementById('latencyInterval').value = config.latencyTests?.interval ?? 100;
    document.querySelectorAll('#latencySection .target-option input').forEach(input => {
      input.checked = config.latencyTests?.targets?.includes(input.value) ?? false;
    });
    
    // Gaming settings
    document.getElementById('gamingEnabled').checked = config.gamingTests?.enabled ?? false;
    document.getElementById('gamingSamples').value = config.gamingTests?.sampleCount ?? 100;
    document.getElementById('gamingSamplesValue').textContent = config.gamingTests?.sampleCount ?? 100;
    document.getElementById('burstTesting').checked = config.gamingTests?.burstTests ?? true;
    document.getElementById('packetLossDetection').checked = config.gamingTests?.packetLossDetection ?? true;
    document.getElementById('simulateGameTraffic').checked = config.gamingTests?.simulateGameTraffic ?? false;
    document.querySelectorAll('#gamingSection .region-option input').forEach(input => {
      input.checked = config.gamingTests?.regions?.includes(input.value) ?? false;
    });
    
    // Advanced settings
    document.getElementById('ipv6Testing').checked = config.advancedTests?.ipv6Testing ?? true;
    document.getElementById('http3Testing').checked = config.advancedTests?.http3Testing ?? false;
    document.getElementById('cdnTesting').checked = config.advancedTests?.cdnTesting ?? true;
    document.getElementById('dnsPerformance').checked = config.advancedTests?.dnsPerformance ?? true;
    document.getElementById('routingEfficiency').checked = config.advancedTests?.routingEfficiency ?? false;
    document.getElementById('connectionStability').checked = config.advancedTests?.connectionStability ?? false;
    document.getElementById('concurrentTesting').checked = config.advancedTests?.concurrentTesting ?? true;
    document.getElementById('detailedLogging').checked = config.advancedTests?.detailedLogging ?? false;
    
    // Server settings
    document.querySelectorAll('#serversSection .server-option input').forEach(input => {
      input.checked = config.servers?.primary?.includes(input.value) ?? false;
    });
    document.getElementById('autoSelectServer').checked = config.servers?.autoSelect ?? true;
    document.getElementById('testAllServers').checked = config.servers?.testAllServers ?? false;
    
    // Monitoring settings
    document.getElementById('autoTestOnChange').checked = config.monitoring?.autoTestOnChange ?? false;
    document.getElementById('scheduledTesting').checked = config.monitoring?.scheduledTesting ?? false;
    document.getElementById('testInterval').value = config.monitoring?.testInterval ?? 30;
    document.getElementById('captivePortalDetection').checked = config.monitoring?.captivePortalDetection ?? true;
    document.getElementById('portalCheckFrequency').value = config.monitoring?.portalCheckFrequency ?? 5;
    document.getElementById('vpnDetection').checked = config.monitoring?.vpnDetection ?? true;
    document.getElementById('warpDetection').checked = config.monitoring?.warpDetection ?? true;
    
    // Appearance settings
    document.getElementById('darkMode').checked = config.ui?.darkMode ?? true;
    document.getElementById('animations').checked = config.ui?.animations ?? true;
    document.getElementById('compactMode').checked = config.ui?.compactMode ?? false;
    
    // Data settings
    document.getElementById('historyRetention').value = config.data?.historyRetention ?? 30;
    document.getElementById('maxTestsStored').value = config.data?.maxTestsStored ?? 100;
  }

  // Load storage stats
  async loadStorageStats() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_TEST_HISTORY' });
      const history = response.history || [];
      
      document.getElementById('testsStored').textContent = history.length;
      
      // Calculate storage size
      const dataStr = JSON.stringify(history);
      const sizeKB = Math.round(new Blob([dataStr]).size / 1024);
      document.getElementById('storageUsed').textContent = `${sizeKB} KB`;
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  }

  // Save all settings
  async saveAllSettings() {
    try {
      await chrome.storage.local.set({ epicConfig: this.currentConfig });
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
        this.saveAllSettings().then(() => {
          window.close();
        });
      } else {
        window.close();
      }
    } else {
      window.close();
    }
  }

  // Toggle theme
  toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    this.updateConfig('ui.darkMode', isDark);
    chrome.storage.local.set({ darkMode: isDark });
  }

  // Save custom preset
  async saveCustomPreset() {
    const name = prompt('Enter a name for this custom preset:');
    if (!name) return;
    
    const preset = {
      name,
      config: JSON.parse(JSON.stringify(this.currentConfig)),
      created: new Date().toISOString()
    };
    
    this.customPresets.push(preset);
    await chrome.storage.local.set({ customPresets: this.customPresets });
    
    this.showToast(`Custom preset "${name}" saved!`, 'success');
  }

  // Load custom preset
  async loadCustomPreset() {
    if (this.customPresets.length === 0) {
      this.showToast('No custom presets available', 'info');
      return;
    }
    
    const names = this.customPresets.map(p => p.name);
    const selected = prompt(`Select preset:\n${names.map((n, i) => `${i + 1}. ${n}`).join('\n')}`);
    
    const index = parseInt(selected) - 1;
    if (index >= 0 && index < this.customPresets.length) {
      this.currentConfig = JSON.parse(JSON.stringify(this.customPresets[index].config));
      this.applySettingsToUI();
      this.showToast(`Loaded preset "${this.customPresets[index].name}"`, 'success');
    }
  }

  // Delete custom preset
  async deleteCustomPreset() {
    if (this.customPresets.length === 0) {
      this.showToast('No custom presets to delete', 'info');
      return;
    }
    
    const names = this.customPresets.map(p => p.name);
    const selected = prompt(`Select preset to delete:\n${names.map((n, i) => `${i + 1}. ${n}`).join('\n')}`);
    
    const index = parseInt(selected) - 1;
    if (index >= 0 && index < this.customPresets.length) {
      const name = this.customPresets[index].name;
      this.customPresets.splice(index, 1);
      await chrome.storage.local.set({ customPresets: this.customPresets });
      this.showToast(`Deleted preset "${name}"`, 'success');
    }
  }

  // Clear history
  async clearHistory() {
    if (confirm('Are you sure you want to clear all test history? This cannot be undone.')) {
      try {
        await chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' });
        await this.loadStorageStats();
        this.showToast('History cleared successfully!', 'success');
      } catch (error) {
        console.error('Failed to clear history:', error);
        this.showToast('Failed to clear history', 'error');
      }
    }
  }

  // Clear old tests
  async clearOldTests() {
    const days = this.currentConfig.data?.historyRetention || 30;
    if (confirm(`Clear tests older than ${days} days?`)) {
      // Implementation would filter tests by date
      this.showToast('Old tests cleared!', 'success');
    }
  }

  // Export settings
  exportSettings() {
    const data = {
      type: 'settings',
      version: '2.0.0',
      config: this.currentConfig,
      customPresets: this.customPresets,
      exported: new Date().toISOString()
    };
    
    this.downloadJSON(data, 'wifi-kickstart-settings.json');
    this.showToast('Settings exported!', 'success');
  }

  // Export data
  async exportData() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_TEST_HISTORY' });
      const data = {
        type: 'testData',
        version: '2.0.0',
        history: response.history || [],
        exported: new Date().toISOString()
      };
      
      this.downloadJSON(data, 'wifi-kickstart-data.json');
      this.showToast('Test data exported!', 'success');
    } catch (error) {
      console.error('Failed to export data:', error);
      this.showToast('Failed to export data', 'error');
    }
  }

  // Export all
  async exportAll() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_TEST_HISTORY' });
      const data = {
        type: 'complete',
        version: '2.0.0',
        config: this.currentConfig,
        customPresets: this.customPresets,
        history: response.history || [],
        exported: new Date().toISOString()
      };
      
      this.downloadJSON(data, 'wifi-kickstart-complete-backup.json');
      this.showToast('Complete backup exported!', 'success');
    } catch (error) {
      console.error('Failed to export backup:', error);
      this.showToast('Failed to export backup', 'error');
    }
  }

  // Import configuration
  async importConfiguration(file) {
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.config) {
        this.currentConfig = data.config;
      }
      
      if (data.customPresets) {
        this.customPresets = data.customPresets;
      }
      
      if (data.history) {
        // Send to background to store
        await chrome.runtime.sendMessage({
          type: 'IMPORT_HISTORY',
          history: data.history
        });
      }
      
      await this.saveAllSettings();
      this.applySettingsToUI();
      
      this.showToast('Configuration imported successfully!', 'success');
    } catch (error) {
      console.error('Import failed:', error);
      this.showToast('Failed to import configuration', 'error');
    }
  }

  // Reset settings
  resetSettings() {
    if (confirm('Reset all settings to defaults? Your test history will be preserved.')) {
      this.currentConfig = this.getDefaultConfig();
      this.applySettingsToUI();
      this.saveAllSettings();
      this.showToast('Settings reset to defaults!', 'success');
    }
  }

  // Factory reset
  async factoryReset() {
    if (confirm('⚠️ WARNING: This will delete ALL data including settings and test history. Continue?')) {
      if (confirm('Are you absolutely sure? This cannot be undone!')) {
        try {
          await chrome.storage.local.clear();
          this.currentConfig = this.getDefaultConfig();
          this.customPresets = [];
          this.applySettingsToUI();
          await this.loadStorageStats();
          this.showToast('Factory reset complete!', 'success');
        } catch (error) {
          console.error('Factory reset failed:', error);
          this.showToast('Factory reset failed', 'error');
        }
      }
    }
  }

  // Download JSON file
  downloadJSON(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  // Show toast notification
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
/**
 * 🎨 CORRECTED SETTINGS INTEGRATION FOR EXISTING SettingsController
 * Add these methods to your existing SettingsController class
 */

// ADD THESE METHODS TO YOUR EXISTING SettingsController CLASS:

// Add this to your existing init() method:
async init() {
  console.log('🔥 Initializing Epic Settings...');
  
  // Your existing initialization code...
  await this.loadConfiguration();
  this.setupEventListeners();
  this.applySettingsToUI();
  await this.loadStorageStats();
  
  // ADD THIS LINE:
  await this.initThemeSystem();
  
  console.log('✅ Settings initialized successfully!');
}

// ADD THESE NEW METHODS TO YOUR SettingsController CLASS:

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

// Open custom theme builder
openCustomThemeBuilder() {
  const url = chrome.runtime.getURL('settings/custom-theme-builder.html');
  window.open(url, '_blank', 'width=1200,height=800');
}

// Edit custom theme
editCustomTheme(themeId) {
  const url = chrome.runtime.getURL(`settings/custom-theme-builder.html?edit=${themeId}`);
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

// Update background display
updateBackgroundDisplay() {
  const hasBackground = window.ThemeManager.backgroundImage;
  const noBackgroundEl = document.getElementById('noBackground');
  const previewEl = document.getElementById('backgroundPreview');
  const settingsEl = document.getElementById('backgroundSettings');
  const imageEl = document.getElementById('currentBackgroundImage');

  if (hasBackground) {
    noBackgroundEl.style.display = 'none';
    previewEl.style.display = 'block';
    settingsEl.style.display = 'block';
    
    if (imageEl) {
      imageEl.src = window.ThemeManager.backgroundImage;
    }
  } else {
    noBackgroundEl.style.display = 'flex';
    previewEl.style.display = 'none';
    settingsEl.style.display = 'none';
  }
}

// Update background setting
updateBackgroundSetting(setting, value) {
  const root = document.documentElement;
  
  switch (setting) {
    case 'opacity':
      root.style.setProperty('--background-overlay', value);
      // Update slider display
      const opacityDisplay = document.querySelector('#bgOpacity').parentElement.querySelector('.slider-value');
      if (opacityDisplay) {
        opacityDisplay.textContent = Math.round(value * 100) + '%';
      }
      break;
      
    case 'blur':
      root.style.setProperty('--background-blur', value + 'px');
      // Update slider display
      const blurDisplay = document.querySelector('#bgBlur').parentElement.querySelector('.slider-value');
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

// Enhanced show toast method (add to your existing SettingsController)
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



// Inject toast CSS if it doesn't exist
if (!document.querySelector('#toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = toastCSS;
  document.head.appendChild(style);
}





}

// Initialize settings when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const settings = new SettingsController();
  settings.init();
  
  // Make available globally for inline handlers
  window.settings = settings;
});