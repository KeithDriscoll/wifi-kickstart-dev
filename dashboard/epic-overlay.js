// 🔥 EPIC SPEED TEST OVERLAY CONTROLLER V2.0
// Real-time connection to Epic Engine for live progress and speed updates

export class EpicOverlay {
  constructor() {
    this.isVisible = false;
    this.isTestRunning = false;
    this.currentTest = null;
    this.testMode = 'standard';
    this.testResults = null;
    this.animationFrameId = null;
    this.speedometerNeedle = null;
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.testPhase = 'idle';
    this.port = null;
    this.connectionId = null;
  }

  // Initialize overlay
  async init() {
    // Create overlay HTML
    this.createOverlayHTML();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize speedometer
    this.initializeSpeedometer();
    
    // Establish real-time connection
    this.establishRealtimeConnection();
    
    // Load saved preferences
    await this.loadPreferences();
    
    console.log('🔥 Epic Overlay initialized with real-time connection!');
  }

  // Create overlay HTML structure - Using string concatenation to avoid template literal issues
  createOverlayHTML() {
    const overlay = document.getElementById('epicOverlay');
    
    let html = '';
    
    // Header
    html += '<div class="epic-header">';
    html += '<div class="epic-title">';
    html += '<span class="epic-icon">🔥</span>';
    html += 'Epic Speed Test Engine';
    html += '<span class="connection-status" id="connectionStatus">';
    html += '<span class="status-dot"></span>';
    html += '<span class="status-text">Connected</span>';
    html += '</span>';
    html += '</div>';
    html += '<button class="epic-close" id="epicClose">×</button>';
    html += '</div>';
    
    // Content wrapper
    html += '<div class="epic-content">';
    
    // Left Panel - Speedometer
    html += '<div class="speedometer-panel">';
    
    // Speedometer
    html += '<div class="epic-speedometer">';
    html += '<div class="speedometer-outer">';
    html += '<div class="speedometer-inner">';
    html += '<div class="speed-marks" id="speedMarks"></div>';
    html += '<div class="speed-display">';
    html += '<div class="speed-value" id="epicSpeedValue">0</div>';
    html += '<div class="speed-unit">Mbps</div>';
    html += '<div class="speed-phase" id="speedPhase"></div>';
    html += '</div>';
    html += '<div class="speed-needle" id="speedNeedle"></div>';
    html += '<div class="needle-center"></div>';
    html += '<div class="latency-display" id="latencyDisplay">';
    html += '<span class="latency-value">--</span>';
    html += '<span class="latency-unit">ms</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    
    // Test Status
    html += '<div class="test-status">';
    html += '<div class="status-text" id="testStatus">Ready to begin epic testing</div>';
    html += '</div>';
    
    // Test Controls
    html += '<div class="test-controls">';
    html += '<button class="test-btn primary" id="startTestBtn">START EPIC TEST</button>';
    html += '<button class="test-btn secondary" id="stopTestBtn" disabled>STOP TEST</button>';
    html += '</div>';
    
    // Progress Section
    html += '<div class="progress-section">';
    
    // Overall Progress
    html += '<div class="progress-item">';
    html += '<div class="progress-label">';
    html += '<span>Overall Progress</span>';
    html += '<span class="progress-value" id="overallProgress">0%</span>';
    html += '</div>';
    html += '<div class="progress-bar">';
    html += '<div class="progress-fill" id="overallProgressBar"></div>';
    html += '</div>';
    html += '</div>';
    
    // Download Progress
    html += '<div class="progress-item" id="downloadProgressItem" style="display: none;">';
    html += '<div class="progress-label">';
    html += '<span>Download Test</span>';
    html += '<span class="progress-value" id="downloadProgress">0%</span>';
    html += '</div>';
    html += '<div class="progress-bar">';
    html += '<div class="progress-fill" id="downloadProgressBar"></div>';
    html += '</div>';
    html += '</div>';
    
    // Upload Progress
    html += '<div class="progress-item" id="uploadProgressItem" style="display: none;">';
    html += '<div class="progress-label">';
    html += '<span>Upload Test</span>';
    html += '<span class="progress-value" id="uploadProgress">0%</span>';
    html += '</div>';
    html += '<div class="progress-bar">';
    html += '<div class="progress-fill" id="uploadProgressBar"></div>';
    html += '</div>';
    html += '</div>';
    
    // Latency Progress
    html += '<div class="progress-item" id="latencyProgressItem" style="display: none;">';
    html += '<div class="progress-label">';
    html += '<span>Latency Test</span>';
    html += '<span class="progress-value" id="latencyProgress">0%</span>';
    html += '</div>';
    html += '<div class="progress-bar">';
    html += '<div class="progress-fill" id="latencyProgressBar"></div>';
    html += '</div>';
    html += '</div>';
    
    html += '</div>'; // End progress-section
    
    // Test Modes
    html += '<div class="test-modes">';
    html += '<button class="mode-btn" data-mode="quick">Quick</button>';
    html += '<button class="mode-btn active" data-mode="standard">Standard</button>';
    html += '<button class="mode-btn" data-mode="thorough">Thorough</button>';
    html += '<button class="mode-btn" data-mode="gaming">Gaming</button>';
    html += '</div>';
    
    html += '</div>'; // End speedometer-panel
    
    // Right Panel - Results
    html += '<div class="results-panel">';
    
    // Tabs
    html += '<div class="result-tabs">';
    html += '<button class="tab-btn active" data-tab="metrics">Metrics</button>';
    html += '<button class="tab-btn" data-tab="insights">Insights</button>';
    html += '<button class="tab-btn" data-tab="advanced">Advanced</button>';
    html += '</div>';
    
    // Tab Content - Metrics
    html += '<div class="tab-content active" id="metricsTab">';
    html += '<div class="metrics-grid" id="metricsGrid"></div>';
    html += '</div>';
    
    // Tab Content - Insights
    html += '<div class="tab-content" id="insightsTab">';
    html += '<div class="insights-container" id="insightsContainer"></div>';
    html += '</div>';
    
    // Tab Content - Advanced
    html += '<div class="tab-content" id="advancedTab">';
    html += '<div class="advanced-container" id="advancedContainer"></div>';
    html += '</div>';
    
    html += '</div>'; // End results-panel
    html += '</div>'; // End epic-content
    
    overlay.innerHTML = html;
  }

  // Establish real-time connection to background script
  establishRealtimeConnection() {
    console.log('🔌 Establishing real-time connection...');
    
    // Connect to background script
    this.port = chrome.runtime.connect({ name: 'epic-realtime' });
    
    // Handle messages from background
    this.port.onMessage.addListener((msg) => {
      this.handleRealtimeMessage(msg);
    });
    
    // Handle disconnect
    this.port.onDisconnect.addListener(() => {
      console.log('🔌 Connection lost, reconnecting...');
      setTimeout(() => this.establishRealtimeConnection(), 1000);
    });
  }

  // Handle real-time messages from background
  handleRealtimeMessage(msg) {
    switch (msg.type) {
      case 'CONNECTION_ESTABLISHED':
        this.connectionId = msg.connectionId;
        console.log('✅ Real-time connection established:', this.connectionId);
        break;
        
      case 'PROGRESS_UPDATE':
        this.handleProgressUpdate(msg.data);
        break;
        
      case 'SPEED_UPDATE':
        this.handleSpeedUpdate(msg.data);
        break;
        
      case 'TEST_STARTED':
        this.onTestStarted(msg);
        break;
        
      case 'TEST_COMPLETE':
        this.onTestComplete(msg.results);
        break;
        
      case 'TEST_ERROR':
        this.onTestError(msg.error);
        break;
        
      case 'TEST_RESULTS':
        if (!this.isTestRunning) {
          this.testResults = msg.results;
        }
        break;
    }
  }

  // Handle progress updates
  handleProgressUpdate(data) {
    const { type, value, phase } = data;
    
    // Update phase status
    if (phase && phase !== this.testPhase) {
      this.testPhase = phase;
      this.updateStatusFromPhase(phase);
    }
    
    // Update progress bars
    switch (type) {
      case 'overall':
        this.updateProgress('overall', value);
        break;
      case 'download':
        this.updateProgress('download', value);
        break;
      case 'upload':
        this.updateProgress('upload', value);
        break;
      case 'latency':
        this.updateProgress('latency', value);
        break;
      case 'gaming':
        this.updateProgress('gaming', value);
        break;
      case 'phase':
        if (phase) {
          this.updateStatus(phase);
        }
        break;
    }
  }

  // Handle speed updates
  handleSpeedUpdate(data) {
    const { speed, type } = data;
    
    if (type === 'download' || type === 'upload') {
      this.animateSpeed(speed);
    } else if (type === 'latency') {
      this.updateLatencyDisplay(speed);
    }
  }

  // Update status from phase
  updateStatusFromPhase(phase) {
    const phaseMessages = {
      'initializing': '🚀 Initializing epic test...',
      'info': '📡 Gathering network information...',
      'latency': '⚡ Measuring latency...',
      'download': '📥 Testing download speed...',
      'upload': '📤 Testing upload speed...',
      'advanced': '🔬 Running advanced diagnostics...',
      'gaming': '🎮 Testing gaming performance...',
      'analysis': '📊 Analyzing results...',
      'complete': '✅ Epic test complete!',
      'error': '❌ Test encountered an error'
    };
    
    const message = phaseMessages[phase] || 'Testing: ' + phase;
    this.updateStatus(message);
  }

  // Initialize speedometer
  initializeSpeedometer() {
    this.speedometerNeedle = document.getElementById('speedNeedle');
    
    // Create speed marks
    const marksContainer = document.getElementById('speedMarks');
    const speeds = [0, 25, 50, 100, 200, 300, 400, 500];
    
    speeds.forEach(speed => {
      const angle = this.speedToAngle(speed);
      const mark = document.createElement('div');
      mark.className = 'speed-mark';
      mark.style.transform = 'rotate(' + angle + 'deg)';
      
      const label = document.createElement('div');
      label.className = 'speed-label';
      label.textContent = speed;
      label.style.transform = 'rotate(' + angle + 'deg) translateY(-140px) rotate(' + (-angle) + 'deg)';
      
      marksContainer.appendChild(mark);
      marksContainer.appendChild(label);
    });
  }

  // Convert speed to needle angle
  speedToAngle(speed) {
    const maxSpeed = 500;
    const maxAngle = 135;
    const normalizedSpeed = Math.min(speed, maxSpeed) / maxSpeed;
    return (normalizedSpeed * maxAngle * 2) - maxAngle;
  }

  // Setup event listeners
  setupEventListeners() {
    // Close button
    document.getElementById('epicClose').addEventListener('click', () => {
      this.hide();
    });
    
    // Test controls
    document.getElementById('startTestBtn').addEventListener('click', () => {
      this.startEpicTest();
    });
    
    document.getElementById('stopTestBtn').addEventListener('click', () => {
      this.stopTest();
    });
    
    // Test modes
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectTestMode(e.target.dataset.mode);
      });
    });
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  // Load saved preferences
  async loadPreferences() {
    const result = await chrome.storage.local.get(['epicTestMode', 'epicOverlayTheme']);
    if (result.epicTestMode) {
      this.selectTestMode(result.epicTestMode);
    }
  }

  // Show overlay
  show() {
    const overlay = document.getElementById('epicOverlay');
    overlay.classList.add('active');
    this.isVisible = true;
    this.updateConnectionStatus(this.port ? 'connected' : 'disconnected');
  }

  // Hide overlay
  hide() {
    const overlay = document.getElementById('epicOverlay');
    overlay.classList.remove('active');
    this.isVisible = false;
    
    if (this.isTestRunning) {
      this.stopTest();
    }
  }

  // Toggle overlay
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  // Select test mode
  selectTestMode(mode) {
    this.testMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    chrome.storage.local.set({ epicTestMode: mode });
    
    const modeDescriptions = {
      quick: 'Quick test - 30 seconds',
      standard: 'Standard test - 2 minutes',
      thorough: 'Thorough analysis - 5 minutes',
      gaming: 'Gaming optimized - 3 minutes'
    };
    
    this.updateStatus(modeDescriptions[mode]);
  }

  // Switch tab
  switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    const tabContent = document.getElementById(tabName + 'Tab');
    if (tabContent) {
      tabContent.classList.add('active');
    }
  }

  // Start epic test with real-time updates
  async startEpicTest() {
    if (this.isTestRunning || !this.port) return;
    
    this.isTestRunning = true;
    this.testPhase = 'starting';
    
    document.getElementById('startTestBtn').disabled = true;
    document.getElementById('stopTestBtn').disabled = false;
    this.updateStatus('🚀 Initializing epic test...');
    
    this.resetProgress();
    this.showProgressItems();
    this.clearResults();
    
    this.port.postMessage({
      type: 'START_TEST',
      mode: this.testMode
    });
  }

  // Stop test
  stopTest() {
    this.isTestRunning = false;
    this.testPhase = 'stopped';
    
    document.getElementById('startTestBtn').disabled = false;
    document.getElementById('stopTestBtn').disabled = true;
    this.updateStatus('Test stopped by user');
    
    this.resetProgress();
    this.animateSpeed(0);
    
    if (this.port) {
      this.port.postMessage({ type: 'STOP_TEST' });
    }
  }

  // Reset progress
  resetProgress() {
    this.updateProgress('overall', 0);
    this.updateProgress('download', 0);
    this.updateProgress('upload', 0);
    this.updateProgress('latency', 0);
    this.updateProgress('gaming', 0);
  }

  // Show progress items based on test mode
  showProgressItems() {
    const items = ['download', 'upload', 'latency', 'gaming'];
    items.forEach(item => {
      const element = document.getElementById(item + 'ProgressItem');
      if (element) {
        element.style.display = 'block';
      }
    });
  }

  // Update progress
  updateProgress(type, value) {
    const progressElement = document.getElementById(type + 'Progress');
    const progressBar = document.getElementById(type + 'ProgressBar');
    
    if (progressElement) {
      progressElement.textContent = Math.round(value) + '%';
    }
    
    if (progressBar) {
      progressBar.style.width = value + '%';
    }
  }

  // Update status
  updateStatus(message) {
    const statusElement = document.getElementById('testStatus');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = this.isTestRunning ? 'status-text testing' : 'status-text';
    }
  }

  // Update connection status
  updateConnectionStatus(status) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
      const dot = statusElement.querySelector('.status-dot');
      const text = statusElement.querySelector('.status-text');
      
      if (status === 'connected') {
        dot.style.backgroundColor = '#50c878';
        text.textContent = 'Connected';
      } else {
        dot.style.backgroundColor = '#ff4444';
        text.textContent = 'Disconnected';
      }
    }
  }

  // Animate speed on speedometer
  animateSpeed(targetSpeed) {
    // Clamp speed to reasonable range
    this.targetSpeed = Math.max(0, Math.min(targetSpeed, 300));
    
    const animate = () => {
      const diff = this.targetSpeed - this.currentSpeed;
      
      // Smoother animation with damping
      if (Math.abs(diff) > 0.1) {
        this.currentSpeed += diff * 0.08; // Slower, smoother movement
      } else {
        this.currentSpeed = this.targetSpeed;
      }
      
      // Update needle position
      if (this.speedometerNeedle) {
        const angle = this.speedToAngle(this.currentSpeed);
        this.speedometerNeedle.style.transform = 'rotate(' + angle + 'deg)';
      }
      
      // Update digital display
      const speedValue = document.getElementById('epicSpeedValue');
      if (speedValue) {
        speedValue.textContent = Math.round(this.currentSpeed);
      }
      
      // Update phase indicator
      const phaseElement = document.getElementById('speedPhase');
      if (phaseElement && this.testPhase) {
        if (this.testPhase === 'download') {
          phaseElement.textContent = '↓ Download';
          phaseElement.style.color = '#4a90e2';
        } else if (this.testPhase === 'upload') {
          phaseElement.textContent = '↑ Upload';
          phaseElement.style.color = '#50c878';
        } else {
          phaseElement.textContent = '';
        }
      }
      
      // Continue animation if needed
      if (Math.abs(diff) > 0.1) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    // Cancel previous animation
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    animate();
  }

  // Update latency display
  updateLatencyDisplay(latency) {
    const display = document.getElementById('latencyDisplay');
    if (display) {
      const valueElement = display.querySelector('.latency-value');
      if (valueElement) {
        valueElement.textContent = Math.round(latency);
        
        if (latency < 30) {
          display.style.color = '#50c878';
        } else if (latency < 100) {
          display.style.color = '#ffa500';
        } else {
          display.style.color = '#ff4444';
        }
      }
    }
  }

  // Test started handler
  onTestStarted(msg) {
    console.log('Test started:', msg);
    this.testPhase = 'running';
  }

  // Test complete handler
  onTestComplete(results) {
    console.log('Test complete:', results);
    this.isTestRunning = false;
    this.testPhase = 'complete';
    this.testResults = results;
    
    document.getElementById('startTestBtn').disabled = false;
    document.getElementById('stopTestBtn').disabled = true;
    this.updateStatus('✅ Epic test complete!');
    
    this.displayResults();
    this.animateSpeed(0);
  }

  // Test error handler
  onTestError(error) {
    console.error('Test error:', error);
    this.isTestRunning = false;
    this.testPhase = 'error';
    
    document.getElementById('startTestBtn').disabled = false;
    document.getElementById('stopTestBtn').disabled = true;
    this.updateStatus('❌ Test failed: ' + error);
    
    this.resetProgress();
    this.animateSpeed(0);
  }

  // Clear results
  clearResults() {
    document.getElementById('metricsGrid').innerHTML = '';
    document.getElementById('insightsContainer').innerHTML = '';
    document.getElementById('advancedContainer').innerHTML = '';
  }

  // Display test results
  displayResults() {
    if (!this.testResults) return;
    
    this.displayMetrics();
    this.displayInsights();
    this.displayAdvancedMetrics();
  }

  // Display metrics
  displayMetrics() {
    const metricsGrid = document.getElementById('metricsGrid');
    const results = this.testResults;
    
    const metrics = [
      {
        label: 'Download Speed',
        value: Math.round(results.downloadSpeed?.overall?.average || 0),
        unit: 'Mbps',
        icon: '📥'
      },
      {
        label: 'Upload Speed',
        value: Math.round(results.uploadSpeed?.overall?.average || 0),
        unit: 'Mbps',
        icon: '📤'
      },
      {
        label: 'Latency',
        value: Math.round(results.latency?.overall?.average || 0),
        unit: 'ms',
        icon: '⚡'
      },
      {
        label: 'Jitter',
        value: Math.round(results.jitter?.average || 0),
        unit: 'ms',
        icon: '📊'
      },
      {
        label: 'Overall Score',
        value: results.overallScore || 0,
        unit: results.grade || '',
        icon: '🏆'
      }
    ];
    
    let html = '';
    metrics.forEach(metric => {
      html += '<div class="metric-card">';
      html += '<div class="metric-icon">' + metric.icon + '</div>';
      html += '<div class="metric-label">' + metric.label + '</div>';
      html += '<div class="metric-value">' + metric.value + '</div>';
      html += '<div class="metric-unit">' + metric.unit + '</div>';
      html += '</div>';
    });
    
    metricsGrid.innerHTML = html;
  }

  // Display insights
  displayInsights() {
    const container = document.getElementById('insightsContainer');
    const insights = this.testResults.insights || [];
    
    let html = '<div class="insights-list">';
    insights.forEach(insight => {
      html += '<div class="insight-item">' + insight + '</div>';
    });
    html += '</div>';
    
    html += '<div class="capabilities">';
    html += '<h3>Network Capabilities</h3>';
    html += this.renderCapabilities();
    html += '</div>';
    
    container.innerHTML = html;
  }

  // Render capabilities
  renderCapabilities() {
    const capabilities = this.testResults.capabilities || {};
    const items = [
      { key: 'streaming4K', label: '4K Streaming', icon: '📺' },
      { key: 'streaming1080p', label: '1080p Streaming', icon: '🎬' },
      { key: 'gaming', label: 'Online Gaming', icon: '🎮' },
      { key: 'videoConferencing', label: 'Video Calls', icon: '📹' },
      { key: 'remoteWork', label: 'Remote Work', icon: '💼' },
      { key: 'basicBrowsing', label: 'Web Browsing', icon: '🌐' }
    ];
    
    let html = '';
    items.forEach(item => {
      const supported = capabilities[item.key];
      html += '<div class="capability-item ' + (supported ? 'supported' : 'unsupported') + '">';
      html += '<span class="capability-icon">' + item.icon + '</span>';
      html += '<span class="capability-label">' + item.label + '</span>';
      html += '<span class="capability-status">' + (supported ? '✅' : '❌') + '</span>';
      html += '</div>';
    });
    
    return html;
  }

  // Display advanced metrics
  displayAdvancedMetrics() {
    const container = document.getElementById('advancedContainer');
    const results = this.testResults;
    
    let html = '<div class="advanced-grid">';
    
    // IPv6 Support
    if (results.ipv6) {
      html += '<div class="advanced-item">';
      html += '<div class="advanced-title">IPv6 Support</div>';
      html += '<div class="advanced-value">' + (results.ipv6.supported ? 'Enabled ✅' : 'Disabled ❌') + '</div>';
      html += '</div>';
    }
    
    // CDN Performance
    if (results.cdnPerformance?.tests) {
      html += '<div class="advanced-item">';
      html += '<div class="advanced-title">CDN Performance</div>';
      html += '<div class="advanced-data">';
      results.cdnPerformance.tests.forEach(cdn => {
        html += '<div class="data-row">';
        html += '<span class="data-label">' + cdn.name + '</span>';
        html += '<span class="data-value">' + (cdn.speed ? cdn.speed + ' Mbps' : 'Failed') + '</span>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>';
    }
    
    // DNS Performance
    if (results.dnsPerformance?.tests) {
      html += '<div class="advanced-item">';
      html += '<div class="advanced-title">DNS Resolution</div>';
      html += '<div class="advanced-data">';
      results.dnsPerformance.tests.forEach(dns => {
        html += '<div class="data-row">';
        html += '<span class="data-label">' + dns.domain + '</span>';
        html += '<span class="data-value">' + (dns.time ? dns.time + 'ms' : 'Failed') + '</span>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>';
    }
    
    // Gaming Metrics
    if (results.gamingLatency) {
      html += '<div class="advanced-item">';
      html += '<div class="advanced-title">Gaming Performance</div>';
      html += '<div class="advanced-data">';
      html += '<div class="data-row">';
      html += '<span class="data-label">Average Latency</span>';
      html += '<span class="data-value">' + Math.round(results.gamingLatency.average) + 'ms</span>';
      html += '</div>';
      html += '<div class="data-row">';
      html += '<span class="data-label">99th Percentile</span>';
      html += '<span class="data-value">' + Math.round(results.gamingLatency.p99) + 'ms</span>';
      html += '</div>';
      html += '<div class="data-row">';
      html += '<span class="data-label">Consistency</span>';
      html += '<span class="data-value">' + Math.round(results.gamingLatency.consistency) + '%</span>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
  }
}