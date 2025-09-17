// 🚀 Wi-Fi Kickstart Popup - Enhanced Logic (Clean & Modular)

// State Management
let isTestRunning = false;
let lastTestResults = null;
let currentSettings = getDefaultSettings();
let connectionTimer = null;

// DOM Elements Cache
const elements = {};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initializePopup);

// 🚀 MAIN INITIALIZATION
async function initializePopup() {
  console.log('🚀 Wi-Fi Kickstart Popup initializing...');
  
  // Cache DOM elements
  cacheElements();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load initial data
  await loadInitialData();
  
  // Start connection monitoring
  startConnectionMonitoring();
  
  console.log('✅ Popup initialized successfully');
}

// 📋 CACHE DOM ELEMENTS
function cacheElements() {
  // Network Status Elements (NEW ENHANCED)
  elements.wifiIcon = document.getElementById('wifiIcon');
  elements.networkName = document.getElementById('networkName');
  elements.networkDetails = document.getElementById('networkDetails');
  
  // Score Elements
  elements.networkScore = document.getElementById('networkScore');
  elements.networkStatus = document.getElementById('networkStatus');
  elements.privacyScore = document.getElementById('privacyScore');
  elements.privacyStatus = document.getElementById('privacyStatus');
  
  // Metric Elements
  elements.downloadSpeed = document.getElementById('downloadSpeed');
  elements.uploadSpeed = document.getElementById('uploadSpeed');
  elements.latencyValue = document.getElementById('latencyValue');
  
  // Action Elements
  elements.runBurstTest = document.getElementById('runBurstTest');
  elements.openDashboard = document.getElementById('openDashboard');
  
  // Settings Elements
  elements.settingsToggle = document.getElementById('settingsToggle');
  elements.settingsPanel = document.getElementById('settingsPanel');
  elements.closeSettings = document.getElementById('closeSettings');
  elements.themeToggle = document.getElementById('themeToggle');
  elements.themePanel = document.getElementById('themePanel');
  elements.closeTheme = document.getElementById('closeTheme');
  
  // Loading Overlay
  elements.loadingOverlay = document.getElementById('loadingOverlay');
  
  // Settings Form Elements
  elements.darkModeToggle = document.getElementById('darkModeToggle');
  elements.zenModeToggle = document.getElementById('zenModeToggle');
  elements.autoTestToggle = document.getElementById('autoTestToggle');
  elements.defaultTestMode = document.getElementById('defaultTestMode');
  elements.vpnDetectionToggle = document.getElementById('vpnDetectionToggle');
  elements.warpDetectionToggle = document.getElementById('warpDetectionToggle');
  elements.captivePortalToggle = document.getElementById('captivePortalToggle');
  elements.saveSettings = document.getElementById('saveSettings');
  elements.resetSettings = document.getElementById('resetSettings');
}

// 🎧 SETUP EVENT LISTENERS
function setupEventListeners() {
  // Main Action Buttons
  if (elements.runBurstTest) {
    elements.runBurstTest.addEventListener('click', runBurstTest);
  }
  
  if (elements.openDashboard) {
    elements.openDashboard.addEventListener('click', openDashboard);
  }
  
  // Settings Panel
  if (elements.settingsToggle) {
    elements.settingsToggle.addEventListener('click', toggleSettings);
  }
  
  if (elements.closeSettings) {
    elements.closeSettings.addEventListener('click', closeSettings);
  }
  
  // Theme Panel
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener('click', toggleThemePanel);
  }
  
  if (elements.closeTheme) {
    elements.closeTheme.addEventListener('click', closeThemePanel);
  }
  
  // Network Status Click (for quick test)
  if (elements.networkName) {
    elements.networkName.addEventListener('click', runQuickConnectivityTest);
  }
  
  // Settings Form Events
  setupSettingsEventListeners();
  
  // Theme Selection Events
  setupThemeEventListeners();
  
  // Keyboard Shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 🎧 SETUP SETTINGS EVENT LISTENERS
function setupSettingsEventListeners() {
  // Toggle Switches
  if (elements.darkModeToggle) {
    elements.darkModeToggle.addEventListener('change', (e) => {
      currentSettings.darkMode = e.target.checked;
      applyThemeMode(e.target.checked ? 'dark' : 'light');
    });
  }
  
  if (elements.zenModeToggle) {
    elements.zenModeToggle.addEventListener('change', (e) => {
      document.body.classList.toggle('zen-mode', e.target.checked);
      currentSettings.zenMode = e.target.checked;
    });
  }
  
  if (elements.autoTestToggle) {
    elements.autoTestToggle.addEventListener('change', (e) => {
      currentSettings.autoTest = e.target.checked;
    });
  }
  
  // Select Dropdowns
  if (elements.defaultTestMode) {
    elements.defaultTestMode.addEventListener('change', (e) => {
      currentSettings.defaultTestMode = e.target.value;
    });
  }
  
  // Privacy/Security Toggles
  if (elements.vpnDetectionToggle) {
    elements.vpnDetectionToggle.addEventListener('change', (e) => {
      currentSettings.vpnDetection = e.target.checked;
    });
  }
  
  if (elements.warpDetectionToggle) {
    elements.warpDetectionToggle.addEventListener('change', (e) => {
      currentSettings.warpDetection = e.target.checked;
    });
  }
  
  if (elements.captivePortalToggle) {
    elements.captivePortalToggle.addEventListener('change', (e) => {
      currentSettings.captivePortal = e.target.checked;
    });
  }
  
  // Action Buttons
  if (elements.saveSettings) {
    elements.saveSettings.addEventListener('click', saveSettings);
  }
  
  if (elements.resetSettings) {
    elements.resetSettings.addEventListener('click', resetSettings);
  }
}

// 🎨 SETUP THEME EVENT LISTENERS
function setupThemeEventListeners() {
  document.querySelectorAll('.theme-option').forEach(button => {
    button.addEventListener('click', (e) => {
      const theme = e.currentTarget.dataset.theme;
      applyTheme(theme);
      saveTheme(theme);
      showToast('Theme applied!', 'success'); // SUCCESS TOAST - ALLOWED
    });
  });
}

// 🔄 LOAD INITIAL DATA
async function loadInitialData() {
  try {
    showLoadingStates();
    
    // Load network info
    await updateNetworkInfo();
    
    // Load last test results if available
    await loadLastTestResults();
    
    // Load user settings
    await loadUserSettings();
    
    // Enable test button
    if (elements.runBurstTest) {
      elements.runBurstTest.disabled = false;
    }
    
  } catch (error) {
    console.error('Failed to load initial data:', error);
    showToast('Failed to load network info', 'error'); // ERROR TOAST - ALLOWED
  }
}

// 🌐 UPDATE NETWORK INFO (NEW ENHANCED)
async function updateNetworkInfo() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_NETWORK_INFO' });
    
    if (response.success && response.info) {
      const info = response.info;
      
      // Update WiFi Icon Color
      if (elements.wifiIcon && info.wifiIconColor) {
        elements.wifiIcon.style.color = info.wifiIconColor;
        
        // Add appropriate CSS class
        elements.wifiIcon.classList.remove('connected', 'warning', 'error');
        if (info.connected) {
          if (info.wifiIconColor === '#50c878') {
            elements.wifiIcon.classList.add('connected');
          } else if (info.wifiIconColor === '#ffa500') {
            elements.wifiIcon.classList.add('warning');
          }
        } else {
          elements.wifiIcon.classList.add('error');
        }
      }
      
      // Update Network Name (ISP)
      if (elements.networkName) {
        const networkName = info.isp && info.isp !== 'Unknown ISP' ? 
          info.isp.toUpperCase() : 'UNKNOWN NETWORK';
        elements.networkName.textContent = networkName;
      }
      
      // Update Network Details (IP + Uptime)
      if (elements.networkDetails) {
        if (info.connected) {
          const ip = info.ip && info.ip !== 'Unknown' ? info.ip : 'Loading...';
          const uptime = info.uptime || 'Calculating...';
          elements.networkDetails.innerHTML = `${ip} <span class="separator">•</span> Connected ${uptime}`;
        } else {
          elements.networkDetails.innerHTML = 'Not connected';
        }
      }
      
      // Update latency in quick metrics
      if (elements.latencyValue && info.latency) {
        elements.latencyValue.textContent = info.latency;
        elements.latencyValue.style.color = getLatencyColor(info.latency);
      }
      
      // Update privacy score based on VPN/WARP status
      updatePrivacyScore(info);
      
    } else {
      // Show loading state
      if (elements.networkName) {
        elements.networkName.textContent = 'CHECKING...';
      }
      if (elements.networkDetails) {
        elements.networkDetails.innerHTML = `
          <span class="loading">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
          </span> Analyzing connection...
        `;
      }
    }
    
  } catch (error) {
    console.error('Failed to update network info:', error);
    
    // Show error state
    if (elements.networkName) {
      elements.networkName.textContent = 'CONNECTION ERROR';
    }
    if (elements.networkDetails) {
      elements.networkDetails.textContent = 'Unable to get network info';
    }
    if (elements.wifiIcon) {
      elements.wifiIcon.style.color = '#ff0000';
      elements.wifiIcon.classList.add('error');
    }
  }
}

// 📊 UPDATE PRIVACY SCORE WITH GLOW SYSTEM
function updatePrivacyScore(info) {
  if (!elements.privacyScore || !elements.privacyStatus) return;
  
  let score = 50; // Base score
  let status = 'Checking...';
  
  if (info.vpnStatus === 'Connected') {
    score += 30;
    status = 'VPN Protected';
  } else if (info.warpStatus === 'Connected') {
    score += 25;
    status = 'WARP Protected';
  } else if (info.connected) {
    if (info.wifiIconColor === '#ffa500') {
      score = 30; // Public WiFi warning
      status = 'Public Network';
    } else {
      score = 70; // Private network
      status = 'Private Network';
    }
  } else {
    score = 0;
    status = 'Not Connected';
  }
  
  elements.privacyScore.textContent = Math.max(0, Math.min(100, score));
  elements.privacyScore.style.color = getScoreColor(score);
  elements.privacyStatus.textContent = status;
  
  // 🔥 APPLY GLOW CLASSES TO PRIVACY SCORE CARD
  const privacyScoreCard = document.getElementById('privacyScoreCard');
  if (privacyScoreCard) {
    // Remove existing glow classes
    privacyScoreCard.classList.remove('excellent', 'good', 'needs-work', 'poor');
    
    // Add appropriate glow class
    if (score >= 90) {
      privacyScoreCard.classList.add('excellent');
    } else if (score >= 70) {
      privacyScoreCard.classList.add('good');
    } else if (score >= 50) {
      privacyScoreCard.classList.add('needs-work');
    } else {
      privacyScoreCard.classList.add('poor');
    }
  }
}

// ⚡ RUN BURST TEST
async function runBurstTest() {
  if (isTestRunning) return;
  
  isTestRunning = true;
  showLoadingOverlay(true, 'Running Burst Test...');
  
  // Disable button and show testing state
  if (elements.runBurstTest) {
    elements.runBurstTest.disabled = true;
    elements.runBurstTest.innerHTML = `
      <div class="card-icon">⚡</div>
      <div class="card-title">Testing...</div>
    `;
  }
  
  // Reset scores to show testing state
  showTestingStates();
  
  try {
    const response = await chrome.runtime.sendMessage({ 
      type: 'RUN_NETWORK_TEST',
      mode: currentSettings.defaultTestMode || 'burst'
    });
      
    if (response.success) {
      lastTestResults = response.results;
      
      // Update all UI with new results
      updateTestResults(response.results);
      
      // Update network info after test
      await updateNetworkInfo();
      
      const speed = Math.round(response.results.speed?.download?.average || 0);
      showToast(`Test Complete! ${speed} Mbps download`, 'success'); // SUCCESS TOAST - ALLOWED
      
    } else {
      throw new Error('Test failed');
    }
    
  } catch (error) {
    console.error('Burst test failed:', error);
    showToast('Test failed - please try again', 'error'); // ERROR TOAST - ALLOWED
    
    // Reset to error states
    showErrorStates();
    
  } finally {
    isTestRunning = false;
    showLoadingOverlay(false);
    
    // Restore button with shimmer effect
    if (elements.runBurstTest) {
      elements.runBurstTest.disabled = false;
      elements.runBurstTest.innerHTML = `
        <div class="card-icon">⚡</div>
        <div class="card-title">Burst Test</div>
      `;
    }
  }
}

// 🚀 RUN QUICK CONNECTIVITY TEST (Icon/Network Name Click)
async function runQuickConnectivityTest() {
  if (isTestRunning) return;
  
  try {
    // Add pulse animation to WiFi icon
    if (elements.wifiIcon) {
      elements.wifiIcon.classList.add('pulse');
    }
    
    const response = await chrome.runtime.sendMessage({ type: 'RUN_QUICK_TEST' });
    
    if (response.success) {
      const result = response.result;
      
      // Update network info immediately
      await updateNetworkInfo();
      
      // Show result based on connection status
      if (result.connected) {
        showToast(`${result.status} • ${result.latency}ms`, 'success'); // SUCCESS TOAST - ALLOWED
      } else {
        showToast('No connection detected', 'warning'); // WARNING TOAST - ALLOWED
      }
    }
    
  } catch (error) {
    console.error('Quick test failed:', error);
    showToast('Quick test failed', 'error'); // ERROR TOAST - ALLOWED
    
  } finally {
    // Remove pulse animation
    if (elements.wifiIcon) {
      elements.wifiIcon.classList.remove('pulse');
    }
  }
}

// 📊 UPDATE TEST RESULTS WITH COLOR-CODED GLOW SYSTEM
function updateTestResults(results) {
  // Update download speed
  if (elements.downloadSpeed && results.speed?.download?.average) {
    const speed = Math.round(results.speed.download.average);
    elements.downloadSpeed.textContent = speed;
    elements.downloadSpeed.style.color = getSpeedColor(speed);
  }
  
  // Update upload speed
  if (elements.uploadSpeed && results.speed?.upload?.average) {
    const speed = Math.round(results.speed.upload.average);
    elements.uploadSpeed.textContent = speed;
    elements.uploadSpeed.style.color = getSpeedColor(speed);
  }
  
  // Update latency
  if (elements.latencyValue && results.latency?.overall?.average) {
    const latency = Math.round(results.latency.overall.average);
    elements.latencyValue.textContent = latency;
    elements.latencyValue.style.color = getLatencyColor(latency);
  }
  
  // Update network score WITH GLOW CLASSES
  if (elements.networkScore && results.overallScore) {
    const score = Math.round(results.overallScore);
    elements.networkScore.textContent = score;
    elements.networkScore.style.color = getScoreColor(score);
    
    // 🔥 APPLY GLOW CLASSES TO SCORE CARD
    const networkScoreCard = document.getElementById('networkScoreCard');
    if (networkScoreCard) {
      // Remove existing glow classes
      networkScoreCard.classList.remove('excellent', 'good', 'needs-work', 'poor');
      
      // Add appropriate glow class
      if (score >= 90) {
        networkScoreCard.classList.add('excellent');
      } else if (score >= 70) {
        networkScoreCard.classList.add('good');
      } else if (score >= 50) {
        networkScoreCard.classList.add('needs-work');
      } else {
        networkScoreCard.classList.add('poor');
      }
    }
    
    if (elements.networkStatus) {
      elements.networkStatus.textContent = getScoreText(score);
    }
  }
}

// 🎨 UI STATE HELPERS
function showLoadingStates() {
  const loadingElements = [
    elements.networkScore,
    elements.privacyScore,
    elements.downloadSpeed,
    elements.uploadSpeed,
    elements.latencyValue
  ];
  
  loadingElements.forEach(element => {
    if (element) {
      element.textContent = '--';
      element.style.color = 'var(--text-secondary)';
    }
  });
  
  if (elements.networkStatus) {
    elements.networkStatus.textContent = 'Analyzing...';
  }
  if (elements.privacyStatus) {
    elements.privacyStatus.textContent = 'Checking...';
  }
}

function showTestingStates() {
  if (elements.networkScore) {
    elements.networkScore.textContent = '--';
    elements.networkScore.style.color = 'var(--primary)';
  }
  if (elements.networkStatus) {
    elements.networkStatus.textContent = 'Testing...';
  }
}

function showErrorStates() {
  if (elements.networkScore) {
    elements.networkScore.textContent = '--';
    elements.networkScore.style.color = 'var(--error)';
  }
  if (elements.networkStatus) {
    elements.networkStatus.textContent = 'Test Failed';
  }
}

// 🎭 PANEL CONTROLS
function toggleSettings() {
  if (elements.settingsPanel) {
    const isActive = elements.settingsPanel.classList.contains('active');
    elements.settingsPanel.classList.toggle('active', !isActive);
    
    // Close theme panel if open
    if (elements.themePanel) {
      elements.themePanel.classList.remove('active');
    }
  }
}

function closeSettings() {
  if (elements.settingsPanel) {
    elements.settingsPanel.classList.remove('active');
  }
}

function toggleThemePanel() {
  if (elements.themePanel) {
    const isActive = elements.themePanel.classList.contains('active');
    elements.themePanel.classList.toggle('active', !isActive);
  }
}

function closeThemePanel() {
  if (elements.themePanel) {
    elements.themePanel.classList.remove('active');
  }
}

// 🌐 EXTERNAL ACTIONS - SINGLE openDashboard FUNCTION
async function openDashboard() {
  try {
    await chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    window.close();
  } catch (error) {
    console.error('Failed to open dashboard:', error);
    showToast('Failed to open dashboard', 'error'); // ERROR TOAST - ALLOWED
  }
}

// 🔧 SETTINGS MANAGEMENT
async function saveSettings() {
  try {
    await chrome.storage.local.set({ popupSettings: currentSettings });
    showToast('Settings saved!', 'success'); // SUCCESS TOAST - ALLOWED
  } catch (error) {
    console.error('Failed to save settings:', error);
    showToast('Failed to save settings', 'error'); // ERROR TOAST - ALLOWED
  }
}

async function resetSettings() {
  if (confirm('Reset all settings to defaults?')) {
    try {
      currentSettings = getDefaultSettings();
      await chrome.storage.local.set({ popupSettings: currentSettings });
      updateSettingsUI();
      showToast('Settings reset to defaults', 'success'); // SUCCESS TOAST - ALLOWED
    } catch (error) {
      console.error('Failed to reset settings:', error);
      showToast('Failed to reset settings', 'error'); // ERROR TOAST - ALLOWED
    }
  }
}

async function loadUserSettings() {
  try {
    const result = await chrome.storage.local.get(['popupSettings']);
    if (result.popupSettings) {
      currentSettings = { ...getDefaultSettings(), ...result.popupSettings };
      updateSettingsUI();
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

function updateSettingsUI() {
  // Update toggle switches
  if (elements.darkModeToggle) {
    elements.darkModeToggle.checked = currentSettings.darkMode;
  }
  if (elements.zenModeToggle) {
    elements.zenModeToggle.checked = currentSettings.zenMode;
  }
  if (elements.autoTestToggle) {
    elements.autoTestToggle.checked = currentSettings.autoTest;
  }
  if (elements.vpnDetectionToggle) {
    elements.vpnDetectionToggle.checked = currentSettings.vpnDetection;
  }
  if (elements.warpDetectionToggle) {
    elements.warpDetectionToggle.checked = currentSettings.warpDetection;
  }
  if (elements.captivePortalToggle) {
    elements.captivePortalToggle.checked = currentSettings.captivePortal;
  }
  
  // Update select dropdown
  if (elements.defaultTestMode) {
    elements.defaultTestMode.value = currentSettings.defaultTestMode;
  }
  
  // Apply zen mode if enabled
  document.body.classList.toggle('zen-mode', currentSettings.zenMode);
}

// ⏰ CONNECTION MONITORING
function startConnectionMonitoring() {
  // Update network info every 10 seconds
  connectionTimer = setInterval(updateNetworkInfo, 10000);
}

async function loadLastTestResults() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_TEST_HISTORY' });
    if (response.success && response.history && response.history.length > 0) {
      const lastTest = response.history[0];
      if (lastTest.results) {
        lastTestResults = lastTest.results;
        updateTestResults(lastTest.results);
      }
    }
  } catch (error) {
    console.error('Failed to load last test results:', error);
  }
}

// 🎨 THEME HELPERS
function applyTheme(themeName) {
  // Theme application logic would go here
  // For now, just store the preference
  localStorage.setItem('selectedTheme', themeName);
}

function saveTheme(themeName) {
  chrome.storage.local.set({ selectedTheme: themeName });
}

function applyThemeMode(mode) {
  document.body.classList.toggle('dark-mode', mode === 'dark');
  document.body.classList.toggle('light-mode', mode === 'light');
}

// ⌨️ KEYBOARD SHORTCUTS
function handleKeyboardShortcuts(event) {
  // Ctrl/Cmd + Enter = Run test
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    if (!isTestRunning) {
      runBurstTest();
    }
  }
  
  // Escape = Close panels
  if (event.key === 'Escape') {
    closeSettings();
    closeThemePanel();
  }
  
  // Ctrl/Cmd + , = Open settings
  if ((event.ctrlKey || event.metaKey) && event.key === ',') {
    event.preventDefault();
    toggleSettings();
  }
}

// 🍞 TOAST NOTIFICATIONS (SUCCESS/ERROR/WARNING ONLY!)
function showToast(message, type = 'info') {
  // Remove existing toasts
  document.querySelectorAll('.toast-notification').forEach(toast => toast.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}

// 🔄 LOADING OVERLAY
function showLoadingOverlay(show, text = 'Loading...') {
  if (elements.loadingOverlay) {
    elements.loadingOverlay.classList.toggle('active', show);
    
    const loadingText = elements.loadingOverlay.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = text;
    }
  }
}

// 🎨 COLOR HELPERS
function getLatencyColor(latency) {
  if (latency < 20) return '#50c878'; // Green
  if (latency < 50) return '#4a90e2'; // Blue
  if (latency < 100) return '#ffa500'; // Orange
  return '#ff4444'; // Red
}

function getSpeedColor(speed) {
  if (speed >= 100) return '#50c878'; // Green
  if (speed >= 50) return '#4a90e2'; // Blue  
  if (speed >= 25) return '#ffa500'; // Orange
  return '#ff4444'; // Red
}

function getScoreColor(score) {
  if (score >= 90) return '#50c878'; // Green
  if (score >= 70) return '#4a90e2'; // Blue
  if (score >= 50) return '#ffa500'; // Orange
  return '#ff4444'; // Red
}

function getScoreText(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

// ⚙️ DEFAULT SETTINGS
function getDefaultSettings() {
  return {
    darkMode: true,
    zenMode: false,
    autoTest: false,
    defaultTestMode: 'burst',
    vpnDetection: true,
    warpDetection: true,
    captivePortal: true
  };
}

// 🧹 CLEANUP
window.addEventListener('beforeunload', () => {
  if (connectionTimer) {
    clearInterval(connectionTimer);
  }
});

console.log('🚀 Wi-Fi Kickstart Popup Script Loaded - Clean & Modular!');