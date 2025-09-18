// 🚀 Wi-Fi Kickstart Popup - Tidied Up Version
// Professional popup interface with auto-save and smart theme handling

// ⚙️ CONFIGURATION & STATE
let isTestRunning = false;
let lastTestResults = null;
let connectionTimer = null;
let currentSettings = {};

// 🔗 ELEMENT REFERENCES
const elements = {
  // Main Controls
  runBurstTest: null,
  openDashboard: null,
  settingsToggle: null,
  closeSettings: null,
  
  // Panels
  settingsPanel: null,
  themePanel: null,
  themeToggle: null,
  closeTheme: null,
  
  // Network Status
  wifiIcon: null,
  networkName: null,
  networkDetails: null,
  
  // Scores
  networkScore: null,
  networkStatus: null,
  privacyScore: null,
  privacyStatus: null,
  networkScoreCard: null,
  privacyScoreCard: null,
  
  // Metrics
  downloadSpeed: null,
  uploadSpeed: null,
  latencyValue: null,
  
  // Settings Toggles - Auto-save
  darkModeToggle: null,
  zenModeToggle: null,
  autoTestToggle: null,
  vpnDetectionToggle: null,
  warpDetectionToggle: null,
  captivePortalToggle: null
};

// 🏁 INITIALIZE ON DOM READY
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Wi-Fi Kickstart Popup initializing...');
  
  // Cache element references
  cacheElements();
  
  // Setup all event listeners
  setupEventListeners();
  
  // Load initial data
  await loadInitialData();
  
  // Start connection monitoring
  startConnectionMonitoring();
  
  console.log('✅ Popup ready!');
});

// 📦 CACHE ELEMENT REFERENCES
function cacheElements() {
  // Main Controls
  elements.runBurstTest = document.getElementById('runBurstTest');
  elements.openDashboard = document.getElementById('openDashboard');
  elements.settingsToggle = document.getElementById('settingsToggle');
  elements.closeSettings = document.getElementById('closeSettings');
  
  // Panels
  elements.settingsPanel = document.getElementById('settingsPanel');
  elements.themePanel = document.getElementById('themePanel');
  elements.themeToggle = document.getElementById('themeToggle');
  elements.closeTheme = document.getElementById('closeTheme');
  
  // Network Status
  elements.wifiIcon = document.getElementById('wifiIcon');
  elements.networkName = document.getElementById('networkName');
  elements.networkDetails = document.getElementById('networkDetails');
  
  // Scores
  elements.networkScore = document.getElementById('networkScore');
  elements.networkStatus = document.getElementById('networkStatus');
  elements.privacyScore = document.getElementById('privacyScore');
  elements.privacyStatus = document.getElementById('privacyStatus');
  elements.networkScoreCard = document.getElementById('networkScoreCard');
  elements.privacyScoreCard = document.getElementById('privacyScoreCard');
  
  // Metrics
  elements.downloadSpeed = document.getElementById('downloadSpeed');
  elements.uploadSpeed = document.getElementById('uploadSpeed');
  elements.latencyValue = document.getElementById('latencyValue');
  
  // Settings Toggles
  elements.darkModeToggle = document.getElementById('darkModeToggle');
  elements.zenModeToggle = document.getElementById('zenModeToggle');
  elements.autoTestToggle = document.getElementById('autoTestToggle');
  elements.vpnDetectionToggle = document.getElementById('vpnDetectionToggle');
  elements.warpDetectionToggle = document.getElementById('warpDetectionToggle');
  elements.captivePortalToggle = document.getElementById('captivePortalToggle');
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
    showToast('Failed to load network info', 'error');
  }
}

// 🌐 UPDATE NETWORK INFO (ENHANCED WITH IPv6 TRUNCATION)
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
    const carrierMap = {
    "CELLCO-PART": "Verizon",
    "VERIZON WIRELESS": "Verizon",
    "T-MOBILE USA": "T-Mobile",
    "AT&T MOBILITY": "AT&T",
    "SPRINT": "Sprint",
    "CRICKET": "Cricket Wireless",
    "BOOST MOBILE": "Boost",
    "GOOGLE VOICE": "Google Voice",
    "VISIBLE": "Visible",
    "MTN": "MTN Group",
    "AIRTEL": "Airtel Africa",
    "VODACOM": "Vodacom",
    "SAFARICOM": "Safaricom",
    "ORANGE": "Orange",
    "LYCAMOBILE": "Lycamobile",
    "JIO": "Reliance Jio",
    "BSNL": "BSNL",
    "SK TELECOM": "SK Telecom",
    // Add more as needed
  };

  // Update Network Name (ISP)
  if (elements.networkName) {
    const rawCarrier = info.isp && info.isp !== 'Unknown ISP' ? info.isp.toUpperCase() : 'UNKNOWN NETWORK';
    const brandName = carrierMap[rawCarrier] || rawCarrier;
    elements.networkName.textContent = brandName;
  }

      
      // Update Network Details with IPv6 truncation and tooltip
      if (elements.networkDetails) {
        if (info.connected) {
          const ip = info.ip && info.ip !== 'Unknown' ? info.ip : 'No IP';
          const uptime = info.uptime || 'Unknown';
          
          // Smart IP truncation for IPv6
          let displayIP = ip;
          let fullIP = ip;
          
          if (ip.includes(':') && ip.length > 20) {
            // IPv6 address - truncate and add tooltip
            displayIP = ip.substring(0, 15) + '...';
            elements.networkDetails.title = `Full IP: ${fullIP} • Visit Dashboard for complete details`;
          } else {
            // IPv4 or short address
            elements.networkDetails.title = `Click network name for quick test`;
          }
          
          elements.networkDetails.textContent = `${displayIP} • UP ${uptime}`;
        } else {
          elements.networkDetails.textContent = 'Disconnected';
          elements.networkDetails.title = 'No network connection';
        }
      }
      
      // Remove pulse animation if it was added
      if (elements.wifiIcon) {
        elements.wifiIcon.classList.remove('pulse');
      }
      
    } else {
      // Fallback for no network info
      updateNetworkDisplayOffline();
    }
    
  } catch (error) {
    console.error('Failed to update network info:', error);
    updateNetworkDisplayOffline();
  }
}

// 📶 UPDATE NETWORK DISPLAY - OFFLINE STATE
function updateNetworkDisplayOffline() {
  if (elements.wifiIcon) {
    elements.wifiIcon.style.color = '#ff4444';
    elements.wifiIcon.classList.remove('connected', 'warning');
    elements.wifiIcon.classList.add('error');
  }
  
  if (elements.networkName) {
    elements.networkName.textContent = 'NO CONNECTION';
  }
  
  if (elements.networkDetails) {
    elements.networkDetails.textContent = 'Check your network';
    elements.networkDetails.title = 'Network connection unavailable';
  }
}

// ⚡ RUN BURST TEST - Always uses quick test for icon clicks
async function runBurstTest() {
  if (isTestRunning) return;
  
  isTestRunning = true;
  showLoadingOverlay(true, 'Running Latency Test...');
  
  // Disable button and show testing state
  if (elements.runBurstTest) {
    elements.runBurstTest.disabled = true;
    elements.runBurstTest.innerHTML = `
      <div class="card-icon">📡</div>
      <div class="card-title">Testing...</div>
    `;
  }
  
  // DON'T reset scores - this is just a latency test
  // showTestingStates(); // Removed - keeps existing metrics visible
  
  try {
    // Always use RUN_QUICK_TEST for the button
    const response = await chrome.runtime.sendMessage({ 
      type: 'RUN_QUICK_TEST'
    });
      
    if (response.success) {
      const result = response.result;
      
      // Update network info immediately
      await updateNetworkInfo();
      
      // Update only latency metric, don't clear other data
      if (elements.latencyValue && result.latency) {
        elements.latencyValue.textContent = result.latency;
        elements.latencyValue.style.color = getLatencyColor(result.latency);
      }
      
      if (result.connected) {
        showToast(`Latency Test: ${result.status} • ${result.latency}ms`, 'success');
      } else {
        showToast('No connection detected', 'warning');
      }
      
    } else {
      throw new Error('Test failed');
    }
    
  } catch (error) {
    console.error('Quick test failed:', error);
    showToast('Test failed - please try again', 'error');
    
    // Reset to error states
    showErrorStates();
    
  } finally {
    isTestRunning = false;
    showLoadingOverlay(false);
    
    // Restore button
    if (elements.runBurstTest) {
      elements.runBurstTest.disabled = false;
      elements.runBurstTest.innerHTML = `
        <div class="card-icon">📡</div>
        <div class="card-title">Latency Test</div>
      `;
    }
  }
}

// 🚀 RUN QUICK CONNECTIVITY TEST (Network Name Click)
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
        showToast(`${result.status} • ${result.latency}ms`, 'success');
      } else {
        showToast('No connection detected', 'warning');
      }
    }
    
  } catch (error) {
    console.error('Quick connectivity test failed:', error);
    showToast('Connection test failed', 'error');
  } finally {
    // Remove pulse animation
    if (elements.wifiIcon) {
      elements.wifiIcon.classList.remove('pulse');
    }
  }
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
    elements.networkName.addEventListener('click', copyIPAddress);
  }
  
  // Settings Form Events with Auto-Save
  setupSettingsEventListeners();
  
  // Theme Selection Events
  setupThemeEventListeners();
  
  // Keyboard Shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 🎧 SETUP SETTINGS EVENT LISTENERS - AUTO-SAVE
function setupSettingsEventListeners() {
  // Smart Dark Mode Toggle
  if (elements.darkModeToggle) {
    elements.darkModeToggle.addEventListener('change', async (e) => {
      await handleSmartDarkModeToggle(e.target.checked);
    });
  }
  
  // Zen Mode Toggle - Auto-save
  if (elements.zenModeToggle) {
    elements.zenModeToggle.addEventListener('change', async (e) => {
      currentSettings.zenMode = e.target.checked;
      document.body.classList.toggle('zen-mode', e.target.checked);
      await autoSaveSettings();
    });
  }
  
  // Auto Test Toggle - Auto-save
  if (elements.autoTestToggle) {
    elements.autoTestToggle.addEventListener('change', async (e) => {
      currentSettings.autoTest = e.target.checked;
      await autoSaveSettings();
    });
  }
  
  // VPN Detection Toggle - Auto-save
  if (elements.vpnDetectionToggle) {
    elements.vpnDetectionToggle.addEventListener('change', async (e) => {
      currentSettings.vpnDetection = e.target.checked;
      await autoSaveSettings();
    });
  }
  
  // WARP Detection Toggle - Auto-save
  if (elements.warpDetectionToggle) {
    elements.warpDetectionToggle.addEventListener('change', async (e) => {
      currentSettings.warpDetection = e.target.checked;
      await autoSaveSettings();
    });
  }
  
  // Captive Portal Toggle - Auto-save
  if (elements.captivePortalToggle) {
    elements.captivePortalToggle.addEventListener('change', async (e) => {
      currentSettings.captivePortal = e.target.checked;
      await autoSaveSettings();
    });
  }
}

// 🌗 SMART DARK MODE TOGGLE
// In popup.js - replace handleSmartDarkModeToggle()
async function handleSmartDarkModeToggle(isDarkMode) {
  await window.ThemeManager.smartToggleDarkMode(isDarkMode);
  
  // Update settings
  currentSettings.darkMode = isDarkMode;
  await autoSaveSettings();
}

// 💾 AUTO-SAVE SETTINGS
async function autoSaveSettings() {
  try {
    await chrome.storage.local.set({ popupSettings: currentSettings });
    console.log('⚡ Settings auto-saved');
  } catch (error) {
    console.error('Failed to auto-save settings:', error);
  }
}

// 🎨 SETUP THEME EVENT LISTENERS
function setupThemeEventListeners() {
  document.querySelectorAll('.theme-option').forEach(button => {
    button.addEventListener('click', (e) => {
      const theme = e.currentTarget.dataset.theme;
      applyTheme(theme);
      saveTheme(theme);
      showToast('Theme applied!', 'success');
    });
  });
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

// 🌐 EXTERNAL ACTIONS
async function openDashboard() {
  try {
    await chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    window.close();
  } catch (error) {
    console.error('Failed to open dashboard:', error);
    showToast('Failed to open dashboard', 'error');
  }
}

// 🔧 SETTINGS MANAGEMENT - Simplified (No Save/Reset buttons)
async function loadUserSettings() {
  try {
    const result = await chrome.storage.local.get(['popupSettings']);
    if (result.popupSettings) {
      currentSettings = { ...getDefaultSettings(), ...result.popupSettings };
      updateSettingsUI();
    } else {
      currentSettings = getDefaultSettings();
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
    currentSettings = getDefaultSettings();
  }
}

function getDefaultSettings() {
  return {
    darkMode: false,
    zenMode: false,
    autoTest: false,
    vpnDetection: true,
    warpDetection: true,
    captivePortal: true
  };
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
    if (response && response.success && response.history && response.history.length > 0) {
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
  localStorage.setItem('selectedTheme', themeName);
}

function saveTheme(themeName) {
  chrome.storage.local.set({ selectedTheme: themeName });
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

// 🔄 UPDATE TEST RESULTS UI
function updateTestResults(results) {
  if (!results) return;
  
  // Update download speed
  const downloadSpeed = results.downloadSpeed?.overall?.average || results.speed?.download?.average || 0;
  if (elements.downloadSpeed) {
    elements.downloadSpeed.textContent = Math.round(downloadSpeed);
  }
  
  // Update upload speed
  const uploadSpeed = results.uploadSpeed?.overall?.average || results.speed?.upload?.average || 0;
  if (elements.uploadSpeed) {
    elements.uploadSpeed.textContent = Math.round(uploadSpeed);
  }
  
  // Update latency
  const latency = results.latency?.overall?.average || results.latency?.average || 0;
  if (elements.latencyValue) {
    elements.latencyValue.textContent = Math.round(latency);
  }
  
  // Update network score
  const networkScore = results.overallScore || 0;
  if (elements.networkScore) {
    elements.networkScore.textContent = Math.round(networkScore);
    elements.networkScore.style.color = getScoreColor(networkScore);
  }
  
  if (elements.networkStatus) {
    elements.networkStatus.textContent = getScoreGrade(networkScore);
  }
  
  // Update network score card styling
  updateScoreCardStyling(elements.networkScoreCard, networkScore);
  
  // Update privacy score if available
  const privacyScore = results.privacyScore || results.securityScore || 0;
  if (elements.privacyScore) {
    elements.privacyScore.textContent = Math.round(privacyScore);
    elements.privacyScore.style.color = getScoreColor(privacyScore);
  }
  
  if (elements.privacyStatus) {
    elements.privacyStatus.textContent = getPrivacyStatus(privacyScore);
  }
  
  // Update privacy score card styling
  updateScoreCardStyling(elements.privacyScoreCard, privacyScore);
}

// 🎨 UI STATE HELPERS
function showLoadingStates() {
  if (elements.networkScore) elements.networkScore.textContent = '--';
  if (elements.networkStatus) elements.networkStatus.textContent = 'Loading...';
  if (elements.privacyScore) elements.privacyScore.textContent = '--';
  if (elements.privacyStatus) elements.privacyStatus.textContent = 'Checking...';
  if (elements.downloadSpeed) elements.downloadSpeed.textContent = '--';
  if (elements.uploadSpeed) elements.uploadSpeed.textContent = '--';
  if (elements.latencyValue) elements.latencyValue.textContent = '--';
}

function showTestingStates() {
  if (elements.networkScore) elements.networkScore.textContent = '--';
  if (elements.networkStatus) elements.networkStatus.textContent = 'Testing...';
  if (elements.privacyScore) elements.privacyScore.textContent = '--';
  if (elements.privacyStatus) elements.privacyStatus.textContent = 'Analyzing...';
  if (elements.downloadSpeed) elements.downloadSpeed.textContent = '--';
  if (elements.uploadSpeed) elements.uploadSpeed.textContent = '--';
  if (elements.latencyValue) elements.latencyValue.textContent = '--';
}

function showErrorStates() {
  if (elements.networkScore) {
    elements.networkScore.textContent = '--';
    elements.networkScore.style.color = 'var(--error)';
  }
  if (elements.networkStatus) {
    elements.networkStatus.textContent = 'Test Failed';
  }
  if (elements.privacyScore) {
    elements.privacyScore.textContent = '--';
    elements.privacyScore.style.color = 'var(--error)';
  }
  if (elements.privacyStatus) {
    elements.privacyStatus.textContent = 'Test Failed';
  }
}

// 🎯 LATENCY COLOR HELPER
function getLatencyColor(latency) {
  if (latency <= 50) return 'var(--success, #50c878)';
  if (latency <= 100) return 'var(--warning, #ffa500)';
  return 'var(--error, #ff4444)';
}
function getScoreColor(score) {
  if (score >= 90) return 'var(--success, #50c878)';
  if (score >= 75) return 'var(--warning, #ffa500)';
  if (score >= 50) return 'var(--info, #4a90e2)';
  return 'var(--error, #ff4444)';
}

function getScoreGrade(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 25) return 'Poor';
  return 'Critical';
}

function getPrivacyStatus(score) {
  if (score >= 90) return 'Secure';
  if (score >= 75) return 'Protected';
  if (score >= 50) return 'Moderate';
  return 'At Risk';
}

function updateScoreCardStyling(card, score) {
  if (!card) return;
  
  // Remove existing classes
  card.classList.remove('excellent', 'good', 'needs-work', 'poor');
  
  // Add appropriate class
  if (score >= 90) {
    card.classList.add('excellent');
  } else if (score >= 70) {
    card.classList.add('good');
  } else if (score >= 50) {
    card.classList.add('needs-work');
  } else {
    card.classList.add('poor');
  }
}

// 🍞 TOAST NOTIFICATIONS
function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  // Add to container
  container.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
  
  // Click to dismiss
  toast.addEventListener('click', () => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  });
}

window.showToast = showToast;

// 🎭 LOADING OVERLAY
function showLoadingOverlay(show, message = 'Loading...') {
  let overlay = document.querySelector('.loading-overlay');
  
  if (show) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">${message}</div>
      `;
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  } else {
    if (overlay) {
      overlay.style.display = 'none';
    }
  }
}
async function copyIPAddress() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_NETWORK_INFO' });
    if (response?.success && response.info?.ip && response.info.ip !== 'Unknown') {
      await navigator.clipboard.writeText(response.info.ip);
      showToast(`IP copied: ${response.info.ip}`, 'success');
    }
  } catch (error) {
    showToast('Failed to copy IP', 'error');
  }
}