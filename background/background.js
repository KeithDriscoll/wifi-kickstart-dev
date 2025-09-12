// 🚀 Wi-Fi Kickstart Background Service Worker V2.0
// Handles epic testing with real-time progress streaming

import { EpicNetworkMetrics } from './epic-engine.js';

// Initialize
let epicEngine = null;
let testHistory = [];
let currentConfig = {};
let activeConnections = new Map(); // Track active connections for real-time updates

// Initialize engine on startup
async function initializeEngine() {
  if (!epicEngine) {
    console.log('🔥 Initializing Epic Engine with Real-time Callbacks...');
    epicEngine = new EpicNetworkMetrics();
    
    // Setup real-time progress callbacks
    epicEngine.setProgressCallback(handleProgressUpdate);
    epicEngine.setSpeedCallback(handleSpeedUpdate);
    
    // Load saved config
    const result = await chrome.storage.local.get(['epicConfig', 'testHistory', 'theme']);
    currentConfig = result.epicConfig || getDefaultConfig();
    testHistory = result.testHistory || [];
  }
}

// Handle progress updates from Epic Engine
function handleProgressUpdate(update) {
  // Broadcast to all active connections
  broadcastToAll({
    type: 'PROGRESS_UPDATE',
    data: update
  });
}

// Handle speed updates from Epic Engine
function handleSpeedUpdate(update) {
  // Broadcast to all active connections
  broadcastToAll({
    type: 'SPEED_UPDATE',
    data: update
  });
}

// Broadcast message to all active connections
function broadcastToAll(message) {
  activeConnections.forEach((port) => {
    try {
      port.postMessage(message);
    } catch (error) {
      console.error('Failed to send message to port:', error);
    }
  });
}

// Initialize immediately when background script loads
initializeEngine();

// Setup persistent connection for real-time updates
chrome.runtime.onConnect.addListener((port) => {
  console.log('🔌 New connection established:', port.name);
  
  if (port.name === 'epic-realtime') {
    const connectionId = Date.now().toString();
    activeConnections.set(connectionId, port);
    
    // Send initial handshake
    port.postMessage({
      type: 'CONNECTION_ESTABLISHED',
      connectionId
    });
    
    // Handle disconnect
    port.onDisconnect.addListener(() => {
      console.log('🔌 Connection closed:', connectionId);
      activeConnections.delete(connectionId);
    });
    
    // Handle messages from the port
    port.onMessage.addListener((msg) => {
      handlePortMessage(msg, port);
    });
  }
});

// Handle messages from connected ports
function handlePortMessage(msg, port) {
  switch (msg.type) {
    case 'START_TEST':
      runEpicTestWithProgress(msg.mode, port);
      break;
    case 'STOP_TEST':
      // Implement test cancellation if needed
      break;
    case 'GET_STATUS':
      port.postMessage({
        type: 'STATUS',
        isRunning: epicEngine?.currentPhase !== 'idle'
      });
      break;
  }
}

// Load configuration on startup
chrome.runtime.onInstalled.addListener(async () => {
  console.log('🚀 Wi-Fi Kickstart installed/updated');
  
  // Initialize epic engine
  await initializeEngine();
  
  // Set initial badge
  chrome.action.setBadgeBackgroundColor({ color: '#4a90e2' });
  chrome.action.setBadgeText({ text: '✓' });
  
  // Start periodic network check
  startNetworkMonitoring();
});

// Message handler for popup and dashboard
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender, sendResponse);
  return true; // Will respond asynchronously
});

// Async message handler
async function handleMessage(request, sender, sendResponse) {
  console.log('📨 Message received:', request.type);
  
  // Ensure engine is initialized
  await initializeEngine();
  
  switch (request.type) {
    case 'RUN_EPIC_TEST':
      const testType = request.mode || 'standard';
      const results = await runEpicTest(testType);
      sendResponse({ success: true, results });
      break;
      
    case 'GET_NETWORK_INFO':
      const info = await getNetworkInfo();
      sendResponse({ success: true, info });
      break;
      
    case 'GET_TEST_HISTORY':
      sendResponse({ success: true, history: testHistory });
      break;
      
    case 'CLEAR_HISTORY':
      testHistory = [];
      await chrome.storage.local.set({ testHistory: [] });
      sendResponse({ success: true });
      break;
      
    case 'UPDATE_CONFIG':
      currentConfig = { ...currentConfig, ...request.config };
      await chrome.storage.local.set({ epicConfig: currentConfig });
      if (epicEngine) {
        epicEngine.updateConfig(currentConfig);
      }
      sendResponse({ success: true });
      break;
      
    case 'GET_CONFIG':
      sendResponse({ success: true, config: currentConfig });
      break;
      
    case 'OPEN_DASHBOARD':
      await openDashboard();
      sendResponse({ success: true });
      break;
      
    case 'OPEN_SETTINGS':
      await openSettings();
      sendResponse({ success: true });
      break;
      
    case 'CHECK_CAPTIVE_PORTAL':
      const isCaptive = await checkCaptivePortal();
      sendResponse({ success: true, isCaptive });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
}

// 🔥 Run Epic Speed Test with Real-time Progress
async function runEpicTestWithProgress(mode = 'standard', port) {
  console.log(`🚀 Starting Epic Test with Real-time Progress - Mode: ${mode}`);
  
  // Send test started message
  port.postMessage({
    type: 'TEST_STARTED',
    mode
  });
  
  // Update badge to show testing
  chrome.action.setBadgeText({ text: '...' });
  chrome.action.setBadgeBackgroundColor({ color: '#ffa500' });
  
  try {
    // Configure test based on mode
    const testConfig = getTestConfig(mode);
    epicEngine.updateConfig(testConfig);
    
    // Run the epic analysis (progress callbacks will fire automatically)
    const results = await epicEngine.runCompleteAnalysis();
    
    // Save to history
    const historyEntry = {
      timestamp: new Date().toISOString(),
      mode,
      results,
      score: results.overallScore,
      grade: results.grade
    };
    
    testHistory.unshift(historyEntry);
    if (testHistory.length > 100) {
      testHistory = testHistory.slice(0, 100);
    }
    
    await chrome.storage.local.set({ testHistory });
    
    // Update badge with score
    chrome.action.setBadgeText({ text: results.overallScore.toString() });
    const badgeColor = results.overallScore >= 80 ? '#50c878' : 
                       results.overallScore >= 60 ? '#ffa500' : '#ff4444';
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    
    // Send test complete message
    port.postMessage({
      type: 'TEST_COMPLETE',
      results
    });
    
    // Also broadcast to other connections
    broadcastToAll({
      type: 'TEST_RESULTS',
      results
    });
    
    return results;
    
  } catch (error) {
    console.error('Epic test failed:', error);
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#ff4444' });
    
    // Send error message
    port.postMessage({
      type: 'TEST_ERROR',
      error: error.message
    });
    
    throw error;
  }
}

// 🔥 Run Epic Speed Test (legacy, without real-time updates)
async function runEpicTest(mode = 'standard') {
  console.log(`🚀 Starting Epic Test - Mode: ${mode}`);
  
  // Update badge to show testing
  chrome.action.setBadgeText({ text: '...' });
  chrome.action.setBadgeBackgroundColor({ color: '#ffa500' });
  
  try {
    // Configure test based on mode
    const testConfig = getTestConfig(mode);
    epicEngine.updateConfig(testConfig);
    
    // Run the epic analysis
    const results = await epicEngine.runCompleteAnalysis();
    
    // Save to history
    const historyEntry = {
      timestamp: new Date().toISOString(),
      mode,
      results,
      score: results.overallScore,
      grade: results.grade
    };
    
    testHistory.unshift(historyEntry);
    if (testHistory.length > 100) {
      testHistory = testHistory.slice(0, 100);
    }
    
    await chrome.storage.local.set({ testHistory });
    
    // Update badge with score
    chrome.action.setBadgeText({ text: results.overallScore.toString() });
    const badgeColor = results.overallScore >= 80 ? '#50c878' : 
                       results.overallScore >= 60 ? '#ffa500' : '#ff4444';
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    
    // Broadcast results
    broadcastTestResults(results);
    
    return results;
    
  } catch (error) {
    console.error('Epic test failed:', error);
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#ff4444' });
    throw error;
  }
}

// Get test configuration based on mode
function getTestConfig(mode) {
  const baseConfig = { ...currentConfig };
  
  switch (mode) {
    case 'quick':
      return {
        ...baseConfig,
        downloadTests: {
          ...baseConfig.downloadTests,
          fileSizes: ['1MB'],
          iterations: 1,
          servers: ['cloudflare']
        },
        uploadTests: {
          ...baseConfig.uploadTests,
          fileSizes: ['1MB'],
          iterations: 1
        },
        latencyTests: {
          ...baseConfig.latencyTests,
          sampleCount: 10
        },
        gamingTests: {
          ...baseConfig.gamingTests,
          enabled: false
        },
        advancedTests: {
          ...baseConfig.advancedTests,
          cdnTesting: false,
          dnsPerformance: false
        }
      };
      
    case 'thorough':
      return {
        ...baseConfig,
        downloadTests: {
          ...baseConfig.downloadTests,
          fileSizes: ['1MB', '5MB', '10MB', '25MB'],
          iterations: 5,
          servers: ['cloudflare', 'google', 'amazon']
        },
        uploadTests: {
          ...baseConfig.uploadTests,
          fileSizes: ['1MB', '5MB', '10MB'],
          iterations: 3
        },
        latencyTests: {
          ...baseConfig.latencyTests,
          sampleCount: 50
        },
        gamingTests: {
          ...baseConfig.gamingTests,
          enabled: true,
          sampleCount: 200
        },
        advancedTests: {
          ...baseConfig.advancedTests,
          ipv6Testing: true,
          cdnTesting: true,
          dnsPerformance: true,
          connectionStability: true,
          routingEfficiency: true
        }
      };
      
    case 'gaming':
      return {
        ...baseConfig,
        downloadTests: {
          ...baseConfig.downloadTests,
          fileSizes: ['1MB', '5MB'],
          iterations: 2
        },
        uploadTests: {
          ...baseConfig.uploadTests,
          fileSizes: ['1MB'],
          iterations: 2
        },
        latencyTests: {
          ...baseConfig.latencyTests,
          sampleCount: 100,
          interval: 16 // 60 FPS timing
        },
        gamingTests: {
          ...baseConfig.gamingTests,
          enabled: true,
          sampleCount: 300,
          burstTests: true
        }
      };
      
    default: // standard
      return baseConfig;
  }
}

// Get network information
async function getNetworkInfo() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      ip: data.ip,
      isp: data.org,
      city: data.city,
      region: data.region,
      country: data.country_name,
      timezone: data.timezone,
      connectionType: getConnectionType()
    };
  } catch (error) {
    console.error('Failed to get network info:', error);
    return {
      error: error.message,
      connectionType: getConnectionType()
    };
  }
}

// Get connection type
function getConnectionType() {
  if ('connection' in navigator) {
    const conn = navigator.connection;
    return {
      type: conn.effectiveType || 'unknown',
      downlink: conn.downlink || null,
      rtt: conn.rtt || null,
      saveData: conn.saveData || false
    };
  }
  return { type: 'unknown' };
}

// Check for captive portal
async function checkCaptivePortal() {
  try {
    const response = await fetch('http://neverssl.com/', {
      method: 'HEAD',
      cache: 'no-cache',
      redirect: 'manual'
    });
    
    // If redirected, likely a captive portal
    return response.type === 'opaqueredirect' || response.status === 302;
  } catch (error) {
    return false;
  }
}

// Start network monitoring
function startNetworkMonitoring() {
  // Check network every 5 minutes
  chrome.alarms.create('networkCheck', { periodInMinutes: 5 });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'networkCheck') {
      checkNetworkStatus();
    }
  });
}

// Check network status
async function checkNetworkStatus() {
  try {
    const start = performance.now();
    await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      cache: 'no-cache'
    });
    const latency = performance.now() - start;
    
    // Update badge color based on latency
    if (latency < 50) {
      chrome.action.setBadgeBackgroundColor({ color: '#50c878' });
    } else if (latency < 150) {
      chrome.action.setBadgeBackgroundColor({ color: '#ffa500' });
    } else {
      chrome.action.setBadgeBackgroundColor({ color: '#ff4444' });
    }
  } catch (error) {
    // Network error
    chrome.action.setBadgeBackgroundColor({ color: '#ff0000' });
    chrome.action.setBadgeText({ text: '!' });
  }
}

// Open dashboard
async function openDashboard() {
  const dashboardUrl = chrome.runtime.getURL('dashboard/dashboard.html');
  const tabs = await chrome.tabs.query({ url: dashboardUrl });
  
  if (tabs.length > 0) {
    // Focus existing dashboard
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    // Open new dashboard
    await chrome.tabs.create({ url: dashboardUrl });
  }
}

// Open settings
async function openSettings() {
  const settingsUrl = chrome.runtime.getURL('settings/full-settings.html');
  const tabs = await chrome.tabs.query({ url: settingsUrl });
  
  if (tabs.length > 0) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: settingsUrl });
  }
}

// Broadcast test results to all tabs
function broadcastTestResults(results) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'TEST_RESULTS',
        results
      }).catch(() => {
        // Tab might not have content script
      });
    });
  });
}

// Get default configuration
function getDefaultConfig() {
  return {
    downloadTests: {
      enabled: true,
      fileSizes: ['1MB', '5MB', '10MB'],
      iterations: 3,
      parallelConnections: 4,
      timeout: 30000,
      servers: ['cloudflare', 'google', 'amazon']
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
      targets: ['google', 'cloudflare', 'microsoft'],
      interval: 100
    },
    gamingTests: {
      enabled: false,
      sampleCount: 100,
      burstTests: true,
      servers: ['google', 'cloudflare']
    },
    advancedTests: {
      ipv6Testing: true,
      cdnTesting: true,
      dnsPerformance: true,
      connectionStability: false,
      routingEfficiency: false,
      concurrentTesting: true,
      detailedLogging: false
    },
    ui: {
      theme: 'dark',
      showAdvancedMetrics: true,
      autoRunOnNetworkChange: false,
      notifications: true,
      epicOverlayAnimation: 'slide',
      chartUpdateInterval: 1000
    }
  };
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runEpicTest,
    getNetworkInfo,
    checkCaptivePortal
  };
}