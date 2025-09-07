// 🚀 Wi-Fi Kickstart Popup Controller
// Handles all popup interactions and communication with background script

// DOM Elements
const elements = {
  // Settings
  settingsToggle: document.getElementById('settingsToggle'),
  settingsPanel: document.getElementById('settingsPanel'),
  closeSettings: document.getElementById('closeSettings'),
  
  // Quick Actions
  openDashboard: document.getElementById('openDashboard'),
  quickEpicTest: document.getElementById('quickEpicTest'),
  
  // Network Status
  ipAddress: document.getElementById('ipAddress'),
  location: document.getElementById('location'),
  provider: document.getElementById('provider'),
  connectionType: document.getElementById('connectionType'),
  
  // Quick Metrics
  latencyValue: document.getElementById('latencyValue'),
  speedValue: document.getElementById('speedValue'),
  scoreValue: document.getElementById('scoreValue'),
  runQuickTest: document.getElementById('runQuickTest'),
  
  // Advanced Features
  openSettings: document.getElementById('openSettings'),
  exportData: document.getElementById('exportData'),
  clearHistory: document.getElementById('clearHistory'),
  
  // Settings Controls
  darkModeToggle: document.getElementById('darkModeToggle'),
  zenModeToggle: document.getElementById('zenModeToggle'),
  autoTestToggle: document.getElementById('autoTestToggle'),
  defaultTestMode: document.getElementById('defaultTestMode'),
  vpnDetectionToggle: document.getElementById('vpnDetectionToggle'),
  warpDetectionToggle: document.getElementById('warpDetectionToggle'),
  captivePortalToggle: document.getElementById('captivePortalToggle'),
  saveSettings: document.getElementById('saveSettings'),
  resetSettings: document.getElementById('resetSettings'),
  
  // Loading
  loadingOverlay: document.getElementById('loadingOverlay')
};

// State
let currentSettings = {};
let isTestRunning = false;
let lastTestResults = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadNetworkInfo();
  await loadLastTestResults();
  setupEventListeners();
  applyTheme();
});

// Load settings from storage
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['settings', 'theme'], (result) => {
      currentSettings = result.settings || getDefaultSettings();
      
      // Apply settings to UI
      elements.darkModeToggle.checked = currentSettings.darkMode;
      elements.zenModeToggle.checked = currentSettings.zenMode;
      elements.autoTestToggle.checked = currentSettings.autoTest;
      elements.defaultTestMode.value = currentSettings.defaultTestMode;
      elements.vpnDetectionToggle.checked = currentSettings.vpnDetection;
      elements.warpDetectionToggle.checked = currentSettings.warpDetection;
      elements.captivePortalToggle.checked = currentSettings.captivePortal;
      
      // Apply theme
      if (result.theme) {
        document.body.className = `theme-${result.theme}`;
      }
      
      // Apply modes
      if (currentSettings.darkMode) {
        document.body.classList.add('dark-mode');
      }
      if (currentSettings.zenMode) {
        document.body.classList.add('zen-mode');
      }
      
      resolve();
    });
  });
}

// Load network information
async function loadNetworkInfo() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_NETWORK_INFO' });
    if (response.success) {
      const info = response.info;
      
      // Update UI with animation
      updateElementWithAnimation(elements.ipAddress, info.ip || 'Unknown');
      updateElementWithAnimation(elements.location, info.location || 'Unknown');
      updateElementWithAnimation(elements.provider, info.provider || 'Unknown');
      updateElementWithAnimation(elements.connectionType, info.connectionType || 'Unknown');
      
      // Check for WARP/VPN if enabled
      if (currentSettings.warpDetection && info.warpStatus) {
        showNotification(`WARP: ${info.warpStatus}`, 'info');
      }
      if (currentSettings.vpnDetection && info.vpnStatus === 'Detected') {
        showNotification('VPN Detected', 'warning');
      }
    }
  } catch (error) {
    console.error('Failed to load network info:', error);
  }
}

// Load last test results
async function loadLastTestResults() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_TEST_HISTORY' });
    if (response.success && response.history.length > 0) {
      lastTestResults = response.history[0];
      displayQuickMetrics(lastTestResults.results);
    }
  } catch (error) {
    console.error('Failed to load test history:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Settings panel
  elements.settingsToggle.addEventListener('click', () => {
    elements.settingsPanel.classList.add('active');
  });
  
  elements.closeSettings.addEventListener('click', () => {
    elements.settingsPanel.classList.remove('active');
  });
  
  // Quick Actions
  elements.openDashboard.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    window.close();
  });
  
  elements.quickEpicTest.addEventListener('click', runEpicTest);
  elements.runQuickTest.addEventListener('click', runQuickTest);
  
  // Advanced Features
  elements.openSettings.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: 'OPEN_SETTINGS' });
    window.close();
  });
  
  elements.exportData.addEventListener('click', exportData);
  elements.clearHistory.addEventListener('click', clearHistory);
  
  // Settings controls
  elements.darkModeToggle.addEventListener('change', (e) => {
    document.body.classList.toggle('dark-mode', e.target.checked);
    currentSettings.darkMode = e.target.checked;
  });
  
  elements.zenModeToggle.addEventListener('change', (e) => {
    document.body.classList.toggle('zen-mode', e.target.checked);
    currentSettings.zenMode = e.target.checked;
  });
  
  elements.saveSettings.addEventListener('click', saveSettings);
  elements.resetSettings.addEventListener('click', resetSettings);
  
  // Theme selection
  document.querySelectorAll('.theme-option').forEach(button => {
    button.addEventListener('click', (e) => {
      const theme = e.currentTarget.dataset.theme;
      applyTheme(theme);
      saveTheme(theme);
    });
  });
}

// Run Epic Test
async function runEpicTest() {
  if (isTestRunning) return;
  
  isTestRunning = true;
  showLoading('Running Epic Test...');
  
  try {
    const mode = currentSettings.defaultTestMode || 'standard';
    const response = await chrome.runtime.sendMessage({ 
      type: 'RUN_EPIC_TEST',
      mode: mode
    });
    
    if (response.success) {
      lastTestResults = response.results;
      displayQuickMetrics(response.results);
      showNotification(`Test Complete! Score: ${response.results.overallScore}`, 'success');
      
      // Animate the results
      animateTestResults();
    }
  } catch (error) {
    console.error('Epic test failed:', error);
    showNotification('Test failed. Please try again.', 'error');
  } finally {
    isTestRunning = false;
    hideLoading();
  }
}

// Run Quick Test
async function runQuickTest() {
  if (isTestRunning) return;
  
  isTestRunning = true;
  elements.runQuickTest.textContent = 'Testing...';
  elements.runQuickTest.disabled = true;
  
  try {
    const response = await chrome.runtime.sendMessage({ 
      type: 'RUN_EPIC_TEST',
      mode: 'quick'
    });
    
    if (response.success) {
      lastTestResults = response.results;
      displayQuickMetrics(response.results);
      animateTestResults();
    }
  } catch (error) {
    console.error('Quick test failed:', error);
  } finally {
    isTestRunning = false;
    elements.runQuickTest.innerHTML = '<span class="button-icon">🔍</span>Run Quick Test';
    elements.runQuickTest.disabled = false;
  }
}

// Display quick metrics
function displayQuickMetrics(results) {
  if (!results) return;
  
  // Latency
  const latency = results.latency?.overall?.average;
  if (latency) {
    elements.latencyValue.textContent = Math.round(latency);
    elements.latencyValue.style.color = getLatencyColor(latency);
  }
  
  // Speed
  const speed = results.downloadSpeed?.overall?.average;
  if (speed) {
    elements.speedValue.textContent = Math.round(speed);
    elements.speedValue.style.color = getSpeedColor(speed);
  }
  
  // Score
  const score = results.overallScore;
  if (score !== undefined) {
    elements.scoreValue.textContent = score;
    elements.scoreValue.style.color = getScoreColor(score);
  }
}

// Animate test results
function animateTestResults() {
  const metrics = document.querySelectorAll('.metric-value');
  metrics.forEach((metric, index) => {
    metric.style.animation = 'none';
    setTimeout(() => {
      metric.style.animation = 'pulse 0.5s ease';
    }, index * 100);
  });
}

// Export data
async function exportData() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_TEST_HISTORY' });
    if (response.success) {
      const dataStr = JSON.stringify(response.history, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `wifi-kickstart-data-${new Date().toISOString()}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      showNotification('Data exported successfully!', 'success');
    }
  } catch (error) {
    console.error('Export failed:', error);
    showNotification('Export failed. Please try again.', 'error');
  }
}

// Clear history
async function clearHistory() {
  if (confirm('Are you sure you want to clear all test history?')) {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' });
      if (response.success) {
        elements.latencyValue.textContent = '--';
        elements.speedValue.textContent = '--';
        elements.scoreValue.textContent = '--';
        showNotification('History cleared!', 'success');
      }
    } catch (error) {
      console.error('Clear history failed:', error);
      showNotification('Failed to clear history.', 'error');
    }
  }
}

// Save settings
async function saveSettings() {
  currentSettings = {
    darkMode: elements.darkModeToggle.checked,
    zenMode: elements.zenModeToggle.checked,
    autoTest: elements.autoTestToggle.checked,
    defaultTestMode: elements.defaultTestMode.value,
    vpnDetection: elements.vpnDetectionToggle.checked,
    warpDetection: elements.warpDetectionToggle.checked,
    captivePortal: elements.captivePortalToggle.checked
  };
  
  chrome.storage.local.set({ settings: currentSettings }, () => {
    showNotification('Settings saved!', 'success');
    elements.settingsPanel.classList.remove('active');
  });
  
  // Update background config
  await chrome.runtime.sendMessage({ 
    type: 'UPDATE_CONFIG',
    config: { ui: currentSettings }
  });
}

// Reset settings
function resetSettings() {
  if (confirm('Reset all settings to defaults?')) {
    currentSettings = getDefaultSettings();
    chrome.storage.local.set({ settings: currentSettings }, () => {
      loadSettings();
      showNotification('Settings reset to defaults!', 'info');
    });
  }
}

// Apply theme
function applyTheme(theme) {
  if (!theme) return;
  
  // Remove existing theme classes
  document.body.classList.remove('theme-ocean', 'theme-sunset', 'theme-forest');
  
  // Add new theme class
  if (theme !== 'default') {
    document.body.classList.add(`theme-${theme}`);
  }
  
  // Mark active theme button
  document.querySelectorAll('.theme-option').forEach(button => {
    button.classList.toggle('active', button.dataset.theme === theme);
  });
}

// Save theme
function saveTheme(theme) {
  chrome.storage.local.set({ theme }, () => {
    showNotification(`Theme changed to ${theme}!`, 'success');
  });
}

// Show loading overlay
function showLoading(text = 'Loading...') {
  elements.loadingOverlay.querySelector('.loading-text').textContent = text;
  elements.loadingOverlay.classList.add('active');
}

// Hide loading overlay
function hideLoading() {
  elements.loadingOverlay.classList.remove('active');
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'success' ? 'var(--success)' : 
                  type === 'error' ? 'var(--error)' : 
                  type === 'warning' ? 'var(--warning)' : 'var(--primary)'};
    color: white;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    z-index: 400;
    animation: slideIn 0.3s ease;
    box-shadow: var(--shadow-lg);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Update element with animation
function updateElementWithAnimation(element, value) {
  element.style.animation = 'fadeOut 0.2s ease';
  setTimeout(() => {
    element.textContent = value;
    element.style.animation = 'fadeIn 0.2s ease';
  }, 200);
}

// Get color based on latency
function getLatencyColor(latency) {
  if (latency < 20) return 'var(--success)';
  if (latency < 50) return 'var(--primary)';
  if (latency < 100) return 'var(--warning)';
  return 'var(--error)';
}

// Get color based on speed
function getSpeedColor(speed) {
  if (speed >= 100) return 'var(--success)';
  if (speed >= 50) return 'var(--primary)';
  if (speed >= 25) return 'var(--warning)';
  return 'var(--error)';
}

// Get color based on score
function getScoreColor(score) {
  if (score >= 90) return 'var(--success)';
  if (score >= 70) return 'var(--primary)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--error)';
}

// Get default settings
function getDefaultSettings() {
  return {
    darkMode: true,
    zenMode: false,
    autoTest: false,
    defaultTestMode: 'standard',
    vpnDetection: true,
    warpDetection: true,
    captivePortal: true
  };
}

// Add fade animations to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    to { opacity: 0; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .notification {
    animation: slideIn 0.3s ease;
  }
`;
document.head.appendChild(style);