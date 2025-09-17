// 🚀 Wi-Fi Kickstart Background Service Worker V3.0
// Professional service worker with modular test orchestration

import { TestOrchestrator } from './test-orchestrator.js';
import { ConnectivityTests } from './tests/connectivity-tests.js';

// Initialize
let testOrchestrator = null;
let connectivityTests = null;
let testHistory = [];
let currentConfig = {};
let activeConnections = new Map(); // Track active connections for real-time updates

// Initialize orchestrator on startup
async function initializeOrchestrator() {
  if (!testOrchestrator) {
    console.log('🚀 Initializing Test Orchestrator with Real-time Callbacks...');
    testOrchestrator = new TestOrchestrator();
    
    // Setup real-time progress callbacks
    testOrchestrator.setProgressCallback(handleProgressUpdate);
    testOrchestrator.setSpeedCallback(handleSpeedUpdate);
    
    // Load saved config
    const result = await chrome.storage.local.get(['networkConfig', 'testHistory', 'theme']);
    currentConfig = result.networkConfig || getDefaultConfig();
    testHistory = result.testHistory || [];
  }

  // Initialize connectivity tests
  if (!connectivityTests) {
    console.log('📡 Initializing Connectivity Tests...');
    connectivityTests = new ConnectivityTests();
  }
}

// Handle progress updates from Test Orchestrator
function handleProgressUpdate(update) {
  // Broadcast to all active connections
  broadcastToAll({
    type: 'PROGRESS_UPDATE',
    data: update
  });
}

// Handle speed updates from Test Orchestrator
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
initializeOrchestrator();

// Setup persistent connection for real-time updates
chrome.runtime.onConnect.addListener((port) => {
  console.log('🔌 New connection established:', port.name);
  
  if (port.name === 'network-realtime') {
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
      runTestWithProgress(msg.mode, port);
      break;
    case 'STOP_TEST':
      if (testOrchestrator) {
        testOrchestrator.stopTests();
      }
      break;
    case 'GET_STATUS':
      port.postMessage({
        type: 'STATUS',
        isRunning: testOrchestrator?.currentPhase !== 'idle'
      });
      break;
  }
}

// Load configuration on startup
chrome.runtime.onInstalled.addListener(async () => {
  console.log('🚀 Wi-Fi Kickstart installed/updated');
  
  // Initialize orchestrator and connectivity tests
  await initializeOrchestrator();
  
  // Set initial badge
  chrome.action.setBadgeBackgroundColor({ color: '#50c878' });
  chrome.action.setBadgeText({ text: '' });
  
  // Start connectivity monitoring
  if (connectivityTests) {
    connectivityTests.startNetworkMonitoring();
  }
});

// Message handler for popup and dashboard
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender, sendResponse);
  return true; // Will respond asynchronously
});

// Async message handler
async function handleMessage(request, sender, sendResponse) {
  console.log('📨 Message received:', request.type);
  
  // Ensure orchestrator is initialized
  await initializeOrchestrator();
  
  switch (request.type) {
    case 'RUN_NETWORK_TEST':
      const testType = request.mode || 'comprehensive';
      const results = await runNetworkTest(testType);
      sendResponse({ success: true, results });
      break;
      
    case 'GET_NETWORK_INFO':
      // Use ConnectivityTests for network info
      const info = await connectivityTests.getNetworkInfoQuick(testOrchestrator);
      sendResponse({ success: true, info });
      break;

    case 'RUN_QUICK_TEST':
      // Instant connectivity check for icon click
      const quickResult = await connectivityTests.runQuickConnectivityCheck();
      sendResponse({ success: true, result: quickResult });
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
      await chrome.storage.local.set({ networkConfig: currentConfig });
      if (testOrchestrator) {
        testOrchestrator.updateConfig(currentConfig);
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
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
}

// Run network test with real-time progress
async function runTestWithProgress(mode, port) {
  try {
    console.log(`🚀 Starting ${mode} network test with real-time progress...`);
    
    // Update orchestrator config if needed
    testOrchestrator.updateConfig(currentConfig);
    
    // Run the test
    const results = await testOrchestrator.runCompleteAnalysis();
    
    // Save to history
    const testRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      mode: mode,
      results: results
    };
    
    testHistory.unshift(testRecord);
    if (testHistory.length > 50) testHistory = testHistory.slice(0, 50); // Keep last 50
    
    await chrome.storage.local.set({ testHistory });
    
    // Send completion message
    port.postMessage({
      type: 'TEST_COMPLETE',
      results: results
    });
    
    console.log('✅ Network test completed successfully');
    
  } catch (error) {
    console.error('❌ Network test failed:', error);
    
    port.postMessage({
      type: 'TEST_ERROR',
      error: error.message
    });
  }
}

// Run network test (for message API)
async function runNetworkTest(mode) {
  try {
    console.log(`🚀 Starting ${mode} network test...`);
    
    // Update orchestrator config
    testOrchestrator.updateConfig(currentConfig);
    
    // Run the test
    const results = await testOrchestrator.runCompleteAnalysis();
    
    // Save to history
    const testRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      mode: mode,
      results: results
    };
    
    testHistory.unshift(testRecord);
    if (testHistory.length > 50) testHistory = testHistory.slice(0, 50);
    
    await chrome.storage.local.set({ testHistory });
    
    return results;
    
  } catch (error) {
    console.error('❌ Network test failed:', error);
    throw error;
  }
}

// Open dashboard
async function openDashboard() {
  const url = chrome.runtime.getURL('dashboard/dashboard.html');
  
  // Try to find existing dashboard tab
  const tabs = await chrome.tabs.query({ url: url });
  
  if (tabs.length > 0) {
    // Focus existing tab
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    // Create new tab
    await chrome.tabs.create({ url: url });
  }
}

// Open settings
async function openSettings() {
  const url = chrome.runtime.getURL('settings/full-settings.html');
  await chrome.tabs.create({ url: url });
}

// Get default configuration
function getDefaultConfig() {
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
      targets: ['google', 'cloudflare', 'microsoft'],
      interval: 100
    },
    securityTests: {
      enabled: true,
      vpnDetection: true,
      warpDetection: true,
      captivePortalCheck: true
    },
    protocolTests: {
      enabled: false,
      ipv6Testing: true,
      cdnTesting: true,
      dnsPerformance: true
    },
    ui: {
      realTimeUpdates: true,
      soundNotifications: false,
      autoSaveResults: true
    }
  };
}

console.log('🚀 Wi-Fi Kickstart Background Service Worker V3.0 loaded');