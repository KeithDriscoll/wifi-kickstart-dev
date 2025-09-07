// 🚀 Wi-Fi Kickstart Background Service Worker
// Handles all epic testing, network monitoring, and extension management

import { EpicNetworkMetrics } from './epic-engine.js';

// Initialize
let epicEngine = null;
let testHistory = [];
let currentConfig = {};

// Load configuration on startup
chrome.runtime.onInstalled.addListener(async () => {
  console.log('🚀 Wi-Fi Kickstart installed/updated');
  
  // Initialize epic engine
  epicEngine = new EpicNetworkMetrics();
  
  // Load saved config or set defaults
  const result = await chrome.storage.local.get(['epicConfig', 'testHistory', 'theme']);
  currentConfig = result.epicConfig || getDefaultConfig();
  testHistory = result.testHistory || [];
  
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

// 🔥 Run Epic Speed Test
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
      testHistory = testHistory.slice(0, 100); // Keep last 100 tests
    }
    
    await chrome.storage.local.set({ testHistory });
    
    // Update badge with score
    chrome.action.setBadgeText({ text: results.overallScore.toString() });
    const badgeColor = results.overallScore >= 80 ? '#50c878' : 
                       results.overallScore >= 60 ? '#ffa500' : '#ff4444';
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    
    // Broadcast results to all tabs
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
  const configs = {
    quick: {
      downloadTests: { 
        enabled: true,
        fileSizes: ['1MB'], 
        iterations: 1, 
        parallelConnections: 2,
        servers: 2
      },
      uploadTests: { 
        enabled: true,
        fileSizes: ['1MB'], 
        iterations: 1, 
        parallelConnections: 1 
      },
      latencyTests: { 
        enabled: true,
        sampleCount: 10,
        targets: ['google', 'cloudflare']
      },
      gamingTests: { enabled: false },
      advancedTests: { 
        enabled: false,
        ipv6Testing: false, 
        cdnTesting: false 
      }
    },
    standard: {
      downloadTests: { 
        enabled: true,
        fileSizes: ['1MB', '5MB', '10MB'], 
        iterations: 3, 
        parallelConnections: 4,
        servers: 3
      },
      uploadTests: { 
        enabled: true,
        fileSizes: ['1MB', '5MB'], 
        iterations: 2, 
        parallelConnections: 2 
      },
      latencyTests: { 
        enabled: true,
        sampleCount: 20,
        targets: ['google', 'cloudflare', 'microsoft']
      },
      gamingTests: { 
        enabled: false 
      },
      advancedTests: { 
        enabled: true,
        ipv6Testing: true, 
        cdnTesting: true,
        dnsPerformance: true,
        connectionStability: false
      }
    },
    thorough: {
      downloadTests: { 
        enabled: true,
        fileSizes: ['1MB', '5MB', '10MB', '25MB', '50MB'], 
        iterations: 5, 
        parallelConnections: 6,
        servers: 4
      },
      uploadTests: { 
        enabled: true,
        fileSizes: ['1MB', '5MB', '10MB', '25MB'], 
        iterations: 3, 
        parallelConnections: 3 
      },
      latencyTests: { 
        enabled: true,
        sampleCount: 50,
        targets: ['google', 'cloudflare', 'microsoft', 'amazon']
      },
      gamingTests: { 
        enabled: true, 
        sampleCount: 100,
        burstTests: true
      },
      advancedTests: { 
        enabled: true,
        ipv6Testing: true, 
        cdnTesting: true,
        dnsPerformance: true,
        connectionStability: true,
        routingEfficiency: true,
        detailedLogging: true 
      }
    },
    gaming: {
      downloadTests: { 
        enabled: true,
        fileSizes: ['5MB', '10MB'], 
        iterations: 2, 
        parallelConnections: 4,
        servers: 2
      },
      uploadTests: { 
        enabled: true,
        fileSizes: ['1MB', '5MB'], 
        iterations: 2, 
        parallelConnections: 2 
      },
      latencyTests: { 
        enabled: true,
        sampleCount: 50,
        targets: ['google', 'cloudflare', 'microsoft']
      },
      gamingTests: { 
        enabled: true, 
        sampleCount: 200, 
        burstTests: true,
        jitterAnalysis: true,
        packetLossDetection: true
      },
      advancedTests: { 
        enabled: true,
        ipv6Testing: true, 
        cdnTesting: false,
        gamingOptimizations: true
      }
    },
    custom: currentConfig // Use user's custom configuration
  };
  
  return configs[mode] || configs.standard;
}

// Get network information
async function getNetworkInfo() {
  try {
    // Get IP info
    const ipResponse = await fetch('https://ipinfo.io/json');
    const ipData = await ipResponse.json();
    
    // Check WARP status
    const warpResponse = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
    const warpText = await warpResponse.text();
    const warpStatus = warpText.includes('warp=on') ? 'Enabled' : 
                      warpText.includes('warp=plus') ? 'WARP+' : 'Disabled';
    
    // Detect VPN
    const vpnDetected = await detectVPN(ipData);
    
    // Get connection type
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const connectionType = connection ? connection.effectiveType : 'Unknown';
    
    return {
      ip: ipData.ip,
      location: `${ipData.city}, ${ipData.region}`,
      provider: ipData.org,
      warpStatus,
      vpnStatus: vpnDetected ? 'Detected' : 'Not Detected',
      connectionType,
      timezone: ipData.timezone,
      country: ipData.country
    };
    
  } catch (error) {
    console.error('Failed to get network info:', error);
    return {
      ip: 'Unknown',
      location: 'Unknown',
      provider: 'Unknown',
      warpStatus: 'Unknown',
      vpnStatus: 'Unknown',
      connectionType: 'Unknown'
    };
  }
}

// Detect VPN
async function detectVPN(ipData) {
  try {
    // Multiple detection methods
    const checks = [
      ipData.org?.toLowerCase().includes('vpn'),
      ipData.org?.toLowerCase().includes('proxy'),
      ipData.org?.toLowerCase().includes('hosting'),
      ipData.privacy?.vpn === true,
      ipData.privacy?.proxy === true
    ];
    
    return checks.some(check => check === true);
  } catch (error) {
    return false;
  }
}

// Check for captive portal
async function checkCaptivePortal() {
  try {
    // Try to reach a known endpoint
    const response = await fetch('http://neverssl.com/', { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    
    // Also check Google's generate_204
    const googleCheck = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD'
    });
    
    // If we get redirected or no response, likely captive portal
    return googleCheck.status !== 204;
    
  } catch (error) {
    // Network error might indicate captive portal
    return true;
  }
}

// Start network monitoring
function startNetworkMonitoring() {
  // Check network every 5 minutes
  chrome.alarms.create('networkCheck', { periodInMinutes: 5 });
  
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'networkCheck') {
      const info = await getNetworkInfo();
      
      // Check if network changed
      const lastInfo = await chrome.storage.local.get(['lastNetworkInfo']);
      if (lastInfo.lastNetworkInfo?.ip !== info.ip) {
        // Network changed, notify user
        chrome.action.setBadgeText({ text: 'NEW' });
        chrome.action.setBadgeBackgroundColor({ color: '#4a90e2' });
        
        // Auto-check for captive portal
        const isCaptive = await checkCaptivePortal();
        if (isCaptive) {
          // Open captive portal in new tab
          chrome.tabs.create({ url: 'http://neverssl.com' });
        }
      }
      
      await chrome.storage.local.set({ lastNetworkInfo: info });
    }
  });
}

// Open dashboard
async function openDashboard() {
  const dashboardUrl = chrome.runtime.getURL('dashboard/dashboard.html');
  
  // Check if dashboard is already open
  const tabs = await chrome.tabs.query({ url: dashboardUrl });
  
  if (tabs.length > 0) {
    // Focus existing dashboard
    chrome.tabs.update(tabs[0].id, { active: true });
    chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    // Open new dashboard
    chrome.tabs.create({ url: dashboardUrl });
  }
}

// Open settings
async function openSettings() {
  const settingsUrl = chrome.runtime.getURL('settings/settings.html');
  
  // Check if settings is already open
  const tabs = await chrome.tabs.query({ url: settingsUrl });
  
  if (tabs.length > 0) {
    // Focus existing settings
    chrome.tabs.update(tabs[0].id, { active: true });
    chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    // Open new settings
    chrome.tabs.create({ url: settingsUrl });
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