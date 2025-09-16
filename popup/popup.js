// 🚀 Wi-Fi Kickstart Popup Controller
// Handles all popup interactions and communication with background script

// DOM Elements
const elements = {
  // IP Address & Tooltip
  ipAddressContainer: document.getElementById('ipAddressContainer'),
  ipTooltip: document.getElementById('ipTooltip'),
  
  // Settings
  settingsToggle: document.getElementById('settingsToggle'),
  settingsPanel: document.getElementById('settingsPanel'),
  closeSettings: document.getElementById('closeSettings'),
  
  // Theme Panel
  themeToggle: document.getElementById('themeToggle'),
  themePanel: document.getElementById('themePanel'),
  closeTheme: document.getElementById('closeTheme'),
  
  // Quick Actions
  openDashboard: document.getElementById('openDashboard'),
  runBurstTest: document.getElementById('runBurstTest'),
  
  // Diagnostic Scores
  networkScoreCard: document.getElementById('networkScoreCard'),
  privacyScoreCard: document.getElementById('privacyScoreCard'),
  networkScore: document.getElementById('networkScore'),
  privacyScore: document.getElementById('privacyScore'),
  networkStatus: document.getElementById('networkStatus'),
  privacyStatus: document.getElementById('privacyStatus'),
  
  // Network Status (FIXED IDs)
  connectionStatus: document.getElementById('connectionStatus'),
  ipAddress: document.getElementById('ipAddress'),
  location: document.getElementById('location'),
  latencyValue: document.getElementById('latencyValue'),
  vpnStatus: document.getElementById('vpnStatus'),
  warpStatus: document.getElementById('warpStatus'),
  
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
let connectionStartTime = null;
let connectionTimer = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadNetworkInfo();
  await loadLastTestResults();
  setupEventListeners();
  applyTheme();
  startConnectionTimer();
});

// Connection Timer Functions
function startConnectionTimer() {
  connectionStartTime = new Date();
  updateConnectionTimer();
  
  // Update every second
  connectionTimer = setInterval(updateConnectionTimer, 1000);
}

function updateConnectionTimer() {
  if (!connectionStartTime) return;
  
  const now = new Date();
  const diff = now - connectionStartTime;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  const timeString = `Online: ${hours}h${minutes.toString().padStart(2, '0')}m${seconds.toString().padStart(2, '0')}s`;
  
  if (elements.connectionStatus) {
    elements.connectionStatus.textContent = timeString;
    elements.connectionStatus.style.color = 'var(--success)';
  }
}

function resetConnectionTimer() {
  connectionStartTime = new Date();
}

// Load settings from storage
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['settings', 'theme'], (result) => {
      currentSettings = result.settings || getDefaultSettings();
      
      // Apply settings to UI
      if (elements.darkModeToggle) elements.darkModeToggle.checked = currentSettings.darkMode;
      if (elements.zenModeToggle) elements.zenModeToggle.checked = currentSettings.zenMode;
      if (elements.autoTestToggle) elements.autoTestToggle.checked = currentSettings.autoTest;
      if (elements.defaultTestMode) elements.defaultTestMode.value = currentSettings.defaultTestMode;
      if (elements.vpnDetectionToggle) elements.vpnDetectionToggle.checked = currentSettings.vpnDetection;
      if (elements.warpDetectionToggle) elements.warpDetectionToggle.checked = currentSettings.warpDetection;
      if (elements.captivePortalToggle) elements.captivePortalToggle.checked = currentSettings.captivePortal;
      
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
      
      // Store full IP for tooltip
      if (elements.ipAddress && info.ip) {
        elements.ipAddress.dataset.fullIp = info.ip;
        // Truncate IPv6 addresses for display
        if (info.ip.includes(':') && info.ip.length > 20) {
          elements.ipAddress.textContent = info.ip.substring(0, 15) + '...';
        }
      }
      
      updateElementWithAnimation(elements.location, info.location || 'Unknown');
      updateElementWithAnimation(elements.latencyValue, info.latency ? `${Math.round(info.latency)}ms` : 'Testing...');
      
      // Update VPN/WARP status with better fallbacks
      updateStatusWithColor(elements.vpnStatus, info.vpnStatus || 'Not Detected');
      updateStatusWithColor(elements.warpStatus, info.warpStatus || 'Not Active');
      
      // Update diagnostic scores based on network info
      updateDiagnosticScores(info);
      
      // Reset connection timer when network changes
      resetConnectionTimer();
      
      // Only show notifications if user wants them
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

// Update diagnostic scores
function updateDiagnosticScores(networkInfo, testResults = null) {
  // Calculate Network Score (placeholder algorithm)
  let networkScore = calculateNetworkScore(networkInfo, testResults);
  let privacyScore = calculatePrivacyScore(networkInfo);
  
  // Update Network Score
  if (elements.networkScore) elements.networkScore.textContent = networkScore;
  if (elements.networkStatus) elements.networkStatus.textContent = getScoreDescription(networkScore);
  if (elements.networkScoreCard) updateScoreCardStyle(elements.networkScoreCard, networkScore);
  
  // Update Privacy Score
  if (elements.privacyScore) elements.privacyScore.textContent = privacyScore;
  if (elements.privacyStatus) elements.privacyStatus.textContent = getScoreDescription(privacyScore);
  if (elements.privacyScoreCard) updateScoreCardStyle(elements.privacyScoreCard, privacyScore);
}

// Calculate Network Score (placeholder - you'll improve this later)
function calculateNetworkScore(networkInfo, testResults) {
  let score = 50; // Base score
  
  if (testResults) {
    // Speed component (40% weight)
    const speed = testResults.downloadSpeed?.overall?.average || 0;
    if (speed >= 100) score += 30;
    else if (speed >= 50) score += 20;
    else if (speed >= 25) score += 10;
    
    // Latency component (30% weight)
    const latency = testResults.latency?.overall?.average || 999;
    if (latency < 20) score += 25;
    else if (latency < 50) score += 15;
    else if (latency < 100) score += 5;
    
    // Overall test score (30% weight)
    if (testResults.overallScore) {
      score += (testResults.overallScore * 0.3);
    }
  } else {
    // Basic network info scoring
    if (networkInfo.connectionType && networkInfo.connectionType !== 'Unknown') score += 10;
    if (networkInfo.ip && networkInfo.ip !== 'Unknown') score += 10;
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

// Calculate Privacy Score (placeholder - you'll improve this later)
function calculatePrivacyScore(networkInfo) {
  let score = 30; // Base score (assume poor privacy by default)
  
  // VPN Status (50% weight)
  if (networkInfo.vpnStatus === 'Connected' || networkInfo.vpnStatus === 'Detected') {
    score += 40;
  }
  
  // WARP Status (30% weight)
  if (networkInfo.warpStatus === 'On' || networkInfo.warpStatus === 'Connected') {
    score += 25;
  }
  
  // Basic security checks (20% weight)
  if (networkInfo.ip && !networkInfo.ip.startsWith('192.168.')) {
    score += 5; // Not on local network
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

// Get score description
function getScoreDescription(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
}

// Update score card styling
function updateScoreCardStyle(card, score) {
  // Remove existing classes
  card.classList.remove('excellent', 'good', 'needs-work', 'poor');
  
  // Add appropriate class
  if (score >= 80) card.classList.add('excellent');
  else if (score >= 60) card.classList.add('good');
  else if (score >= 40) card.classList.add('needs-work');
  else card.classList.add('poor');
}

// Update status with color coding
function updateStatusWithColor(element, status) {
  if (!element) return;
  
  element.textContent = status;
  
  // Color code based on status
  if (status.includes('Connected') || status.includes('On') || status.includes('Detected')) {
    element.style.color = 'var(--success)';
  } else if (status.includes('Off') || status.includes('Not')) {
    element.style.color = 'var(--warning)';
  } else {
    element.style.color = 'var(--text-primary)';
  }
}

// Load last test results
async function loadLastTestResults() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_TEST_HISTORY' });
    if (response.success && response.history.length > 0) {
      lastTestResults = response.history[0];
      // Update diagnostic scores with test results
      updateDiagnosticScores({}, lastTestResults.results);
    }
  } catch (error) {
    console.error('Failed to load test history:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // IP Address tooltip functionality  
  if (elements.ipAddress) {
    elements.ipAddress.addEventListener('click', copyToClipboard);
    elements.ipAddress.addEventListener('mouseenter', showFullIP);
    elements.ipAddress.addEventListener('mouseleave', hideTooltip);
  }

  // Settings panel
  if (elements.settingsToggle) {
    elements.settingsToggle.addEventListener('click', () => {
      if (elements.settingsPanel) elements.settingsPanel.classList.add('active');
    });
  }
  
  if (elements.closeSettings) {
    elements.closeSettings.addEventListener('click', () => {
      if (elements.settingsPanel) elements.settingsPanel.classList.remove('active');
    });
  }
  
  // Theme panel
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener('click', () => {
      if (elements.themePanel) elements.themePanel.classList.add('active');
    });
  }
  
  if (elements.closeTheme) {
    elements.closeTheme.addEventListener('click', () => {
      if (elements.themePanel) elements.themePanel.classList.remove('active');
    });
  }
  
  // Quick Actions
  if (elements.openDashboard) {
    elements.openDashboard.addEventListener('click', async () => {
      await chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
      window.close();
    });
  }
  
  // Burst Test Button
  if (elements.runBurstTest) {
    elements.runBurstTest.addEventListener('click', runBurstTest);
  }
  
  // Settings controls
  if (elements.darkModeToggle) {
    elements.darkModeToggle.addEventListener('change', (e) => {
      document.body.classList.toggle('dark-mode', e.target.checked);
      currentSettings.darkMode = e.target.checked;
    });
  }
  
  if (elements.zenModeToggle) {
    elements.zenModeToggle.addEventListener('change', (e) => {
      document.body.classList.toggle('zen-mode', e.target.checked);
      currentSettings.zenMode = e.target.checked;
    });
  }
  
  if (elements.saveSettings) {
    elements.saveSettings.addEventListener('click', saveSettings);
  }
  
  if (elements.resetSettings) {
    elements.resetSettings.addEventListener('click', resetSettings);
  }
  
  // Theme selection
  document.querySelectorAll('.theme-option').forEach(button => {
    button.addEventListener('click', (e) => {
      const theme = e.currentTarget.dataset.theme;
      applyTheme(theme);
      saveTheme(theme);
    });
  });
}

// Run Burst Test
async function runBurstTest() {
  if (isTestRunning) return;
  
  isTestRunning = true;
  if (elements.runBurstTest) {
    elements.runBurstTest.textContent = 'Testing...';
    elements.runBurstTest.disabled = true;
  }
  
  // Update scores to show testing state
  if (elements.networkScore) elements.networkScore.textContent = '--';
  if (elements.networkStatus) elements.networkStatus.textContent = 'Testing...';
  
  try {
    const response = await chrome.runtime.sendMessage({ 
      type: 'RUN_NETWORK_TEST',
      mode: 'burst'
    });
      
    if (response.success) {
      lastTestResults = response.results;
      
      // Update diagnostic scores with new test results
      const networkInfo = await getNetworkInfo();
      updateDiagnosticScores(networkInfo, response.results);
      
      const speed = Math.round(response.results.downloadSpeed?.overall?.average || 0);
      showNotification(`Burst Complete! ${speed} Mbps`, 'success');
    }
  } catch (error) {
    console.error('Burst test failed:', error);
    showNotification('Burst test failed. Please try again.', 'error');
    
    // Reset scores on error
    if (elements.networkScore) elements.networkScore.textContent = '--';
    if (elements.networkStatus) elements.networkStatus.textContent = 'Test Failed';
  } finally {
    isTestRunning = false;
    if (elements.runBurstTest) {
      elements.runBurstTest.innerHTML = '<div class="card-icon">⚡</div><div class="card-content"><div class="card-title">Burst Test</div></div>';
      elements.runBurstTest.disabled = false;
    }
  }
}

// Helper to get current network info
async function getNetworkInfo() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_NETWORK_INFO' });
    return response.success ? response.info : {};
  } catch (error) {
    return {};
  }
}

// IP Address tooltip functions
function copyToClipboard() {
  const fullIP = elements.ipAddress.dataset.fullIp || elements.ipAddress.textContent;
  navigator.clipboard.writeText(fullIP);
  showNotification('IP copied to clipboard!', 'success');
}

function showFullIP() {
  const fullIP = elements.ipAddress.dataset.fullIp;
  if (fullIP && fullIP !== elements.ipAddress.textContent && elements.ipTooltip) {
    elements.ipTooltip.textContent = fullIP;
    elements.ipTooltip.style.display = 'block';
  }
}

function hideTooltip() {
  if (elements.ipTooltip) {
    elements.ipTooltip.style.display = 'none';
  }
}

// Save settings
async function saveSettings() {
  currentSettings = {
    darkMode: elements.darkModeToggle?.checked || false,
    zenMode: elements.zenModeToggle?.checked || false,
    autoTest: elements.autoTestToggle?.checked || false,
    defaultTestMode: elements.defaultTestMode?.value || 'burst',
    vpnDetection: elements.vpnDetectionToggle?.checked || true,
    warpDetection: elements.warpDetectionToggle?.checked || true,
    captivePortal: elements.captivePortalToggle?.checked || true
  };
  
  chrome.storage.local.set({ settings: currentSettings }, () => {
    showNotification('Saved!', 'success');
    if (elements.settingsPanel) elements.settingsPanel.classList.remove('active');
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
      showNotification('Reset!', 'info');
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
    showNotification(`Theme: ${theme}!`, 'success');
  });
}

// Show loading overlay
function showLoading(text = 'Loading...') {
  if (elements.loadingOverlay) {
    const loadingText = elements.loadingOverlay.querySelector('.loading-text');
    if (loadingText) loadingText.textContent = text;
    elements.loadingOverlay.classList.add('active');
  }
}

// Hide loading overlay
function hideLoading() {
  if (elements.loadingOverlay) {
    elements.loadingOverlay.classList.remove('active');
  }
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
  if (!element) return;
  
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
    defaultTestMode: 'burst',
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
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    to { 
      transform: translateX(100%);
      opacity: 0; 
    }
  }
  
  .notification {
    animation: slideIn 0.3s ease;
  }
  
  /* IP Tooltip Styles */
  .tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--background);
    color: var(--text-primary);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 11px;
    white-space: nowrap;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border);
    z-index: 1000;
    display: none;
    margin-bottom: 5px;
  }
  
  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: var(--border);
  }
  
  .copyable {
    cursor: pointer;
    transition: var(--transition);
  }
  
  .copyable:hover {
    color: var(--primary);
  }
  
  #ipAddressContainer {
    position: relative;
  }
`;
document.head.appendChild(style);

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  if (connectionTimer) {
    clearInterval(connectionTimer);
  }
});