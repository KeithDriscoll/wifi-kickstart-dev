// 🔥 EPIC SPEED TEST OVERLAY CONTROLLER
// Manages the epic speed test interface with legendary animations

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
  }

  // Initialize overlay
  async init() {
    // Create overlay HTML
    this.createOverlayHTML();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Load saved preferences
    await this.loadPreferences();
    
    console.log('🔥 Epic Overlay initialized!');
  }

  // Create overlay HTML structure
  createOverlayHTML() {
    const overlay = document.getElementById('epicOverlay');
    
    overlay.innerHTML = `
      <!-- Epic Header -->
      <div class="epic-header">
        <div class="epic-title">
          <span class="epic-icon">🔥</span>
          Epic Speed Test Engine
        </div>
        <button class="epic-close" id="epicClose">×</button>
      </div>
      
      <!-- Epic Content -->
      <div class="epic-content">
        <!-- Left Panel - Speedometer -->
        <div class="speedometer-panel">
          <!-- Epic Speedometer -->
          <div class="epic-speedometer">
            <div class="speedometer-outer">
              <div class="speedometer-inner">
                <!-- Speed marks -->
                <div class="speed-marks" id="speedMarks"></div>
                
                <!-- Speed display -->
                <div class="speed-display">
                  <div class="speed-value" id="epicSpeedValue">0</div>
                  <div class="speed-unit">Mbps</div>
                </div>
                
                <!-- Needle -->
                <div class="speed-needle" id="speedNeedle"></div>
                <div class="needle-center"></div>
              </div>
            </div>
          </div>
          
          <!-- Test Status -->
          <div class="test-status">
            <div class="status-text" id="testStatus">Ready to begin epic testing</div>
          </div>
          
          <!-- Test Controls -->
          <div class="test-controls">
            <button class="test-btn primary" id="startTestBtn">
              START EPIC TEST
            </button>
            <button class="test-btn secondary" id="stopTestBtn" disabled>
              STOP TEST
            </button>
          </div>
          
          <!-- Progress Section -->
          <div class="progress-section">
            <div class="progress-item">
              <div class="progress-label">
                <span>Download Test</span>
                <span class="progress-value" id="downloadProgress">0%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" id="downloadProgressBar"></div>
              </div>
            </div>
            
            <div class="progress-item">
              <div class="progress-label">
                <span>Upload Test</span>
                <span class="progress-value" id="uploadProgress">0%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" id="uploadProgressBar"></div>
              </div>
            </div>
            
            <div class="progress-item">
              <div class="progress-label">
                <span>Overall Progress</span>
                <span class="progress-value" id="overallProgress">0%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" id="overallProgressBar"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right Panel - Results & Settings -->
        <div class="results-panel">
          <!-- Test Modes -->
          <div class="test-modes">
            <button class="mode-btn" data-mode="quick">
              <span class="mode-icon">⚡</span>
              <span class="mode-name">Quick</span>
            </button>
            <button class="mode-btn active" data-mode="standard">
              <span class="mode-icon">📊</span>
              <span class="mode-name">Standard</span>
            </button>
            <button class="mode-btn" data-mode="thorough">
              <span class="mode-icon">🔬</span>
              <span class="mode-name">Thorough</span>
            </button>
            <button class="mode-btn" data-mode="gaming">
              <span class="mode-icon">🎮</span>
              <span class="mode-name">Gaming</span>
            </button>
          </div>
          
          <!-- Results Tabs -->
          <div class="results-tabs">
            <button class="tab-btn active" data-tab="metrics">Metrics</button>
            <button class="tab-btn" data-tab="insights">AI Insights</button>
            <button class="tab-btn" data-tab="capabilities">Capabilities</button>
            <button class="tab-btn" data-tab="advanced">Advanced</button>
          </div>
          
          <!-- Tab Contents -->
          <div class="tab-content active" id="metricsTab">
            <div class="metrics-grid" id="metricsGrid">
              <!-- Metrics will be populated here -->
            </div>
          </div>
          
          <div class="tab-content" id="insightsTab">
            <div class="insights-section">
              <div class="insights-header">
                <span class="insights-icon">🤖</span>
                AI-Powered Network Analysis
              </div>
              <div id="insightsList">
                <!-- Insights will be populated here -->
              </div>
            </div>
          </div>
          
          <div class="tab-content" id="capabilitiesTab">
            <div class="capabilities-grid" id="capabilitiesGrid">
              <!-- Capabilities will be populated here -->
            </div>
          </div>
          
          <div class="tab-content" id="advancedTab">
            <div class="advanced-metrics">
              <div class="advanced-grid" id="advancedGrid">
                <!-- Advanced metrics will be populated here -->
              </div>
            </div>
          </div>
          
          <!-- Network Score Display -->
          <div class="network-score-display" id="scoreDisplay" style="display: none;">
            <div class="score-value-large" id="scoreLarge">--</div>
            <div class="score-grade" id="scoreGrade">--</div>
            <div class="score-description" id="scoreDescription">--</div>
          </div>
        </div>
      </div>
    `;
    
    // Generate speed marks
    this.generateSpeedMarks();
  }

  // Generate speedometer marks
  generateSpeedMarks() {
    const marksContainer = document.getElementById('speedMarks');
    const markCount = 36; // One mark every 10 degrees
    
    for (let i = 0; i < markCount; i++) {
      const mark = document.createElement('div');
      mark.className = 'speed-mark';
      mark.style.transform = `rotate(${-135 + (i * 10)}deg) translateY(-180px)`;
      
      // Make every 3rd mark longer
      if (i % 3 === 0) {
        mark.style.height = '25px';
        mark.style.width = '3px';
      }
      
      marksContainer.appendChild(mark);
    }
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
    
    // Test mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectTestMode(e.currentTarget.dataset.mode);
      });
    });
    
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.currentTarget.dataset.tab);
      });
    });
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  // Load user preferences
  async loadPreferences() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['epicTestMode', 'epicConfig'], (result) => {
        if (result.epicTestMode) {
          this.testMode = result.epicTestMode;
          this.selectTestMode(this.testMode);
        }
        resolve();
      });
    });
  }

  // Show overlay
  show() {
    const overlay = document.getElementById('epicOverlay');
    overlay.classList.add('active');
    this.isVisible = true;
    
    // Start needle animation
    this.startNeedleAnimation();
    
    // Reset UI
    this.resetUI();
  }

  // Hide overlay
  hide() {
    const overlay = document.getElementById('epicOverlay');
    overlay.classList.remove('active');
    this.isVisible = false;
    
    // Stop animations
    this.stopNeedleAnimation();
    
    // Stop test if running
    if (this.isTestRunning) {
      this.stopTest();
    }
  }

  // Select test mode
  selectTestMode(mode) {
    this.testMode = mode;
    
    // Update UI
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Save preference
    chrome.storage.local.set({ epicTestMode: mode });
    
    // Update status
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
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    const tabContent = document.getElementById(`${tabName}Tab`);
    if (tabContent) {
      tabContent.classList.add('active');
    }
  }

  // Start epic test
  async startEpicTest() {
    if (this.isTestRunning) return;
    
    this.isTestRunning = true;
    this.testPhase = 'starting';
    
    // Update UI
    document.getElementById('startTestBtn').disabled = true;
    document.getElementById('stopTestBtn').disabled = false;
    this.updateStatus('🚀 Initializing epic test...');
    
    // Reset progress
    this.updateProgress('download', 0);
    this.updateProgress('upload', 0);
    this.updateProgress('overall', 0);
    
    // Clear previous results
    this.clearResults();
    
    try {
      // Send test request to background
      const response = await chrome.runtime.sendMessage({
        type: 'RUN_EPIC_TEST',
        mode: this.testMode
      });
      
      if (response.success) {
        this.testResults = response.results;
        this.displayResults();
      }
    } catch (error) {
      console.error('Epic test failed:', error);
      this.updateStatus('❌ Test failed. Please try again.');
    } finally {
      this.isTestRunning = false;
      this.testPhase = 'complete';
      document.getElementById('startTestBtn').disabled = false;
      document.getElementById('stopTestBtn').disabled = true;
    }
    
    // Simulate test progress (since we can't get real progress from background)
    this.simulateTestProgress();
  }

  // Simulate test progress
  async simulateTestProgress() {
    const phases = [
      { name: 'download', duration: 30000, message: '📥 Testing download speed...' },
      { name: 'upload', duration: 20000, message: '📤 Testing upload speed...' },
      { name: 'latency', duration: 10000, message: '⚡ Measuring latency...' },
      { name: 'analysis', duration: 5000, message: '🔬 Analyzing results...' }
    ];
    
    // Adjust durations based on test mode
    const durationMultiplier = {
      quick: 0.3,
      standard: 1,
      thorough: 2,
      gaming: 1.5
    }[this.testMode];
    
    let overallProgress = 0;
    const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0) * durationMultiplier;
    
    for (const phase of phases) {
      if (!this.isTestRunning) break;
      
      this.testPhase = phase.name;
      this.updateStatus(phase.message);
      
      const phaseDuration = phase.duration * durationMultiplier;
      const steps = 100;
      const stepDuration = phaseDuration / steps;
      
      for (let i = 0; i <= steps; i++) {
        if (!this.isTestRunning) break;
        
        const progress = (i / steps) * 100;
        
        // Update specific progress
        if (phase.name === 'download') {
          this.updateProgress('download', progress);
          this.animateSpeed(Math.random() * 200 + 50);
        } else if (phase.name === 'upload') {
          this.updateProgress('upload', progress);
          this.animateSpeed(Math.random() * 100 + 20);
        }
        
        // Update overall progress
        const phaseStartProgress = (phases.slice(0, phases.indexOf(phase))
          .reduce((sum, p) => sum + p.duration, 0) / totalDuration) * 100;
        const phaseProgress = (phase.duration / totalDuration) * (progress / 100) * 100;
        overallProgress = phaseStartProgress + phaseProgress;
        this.updateProgress('overall', overallProgress);
        
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    }
    
    if (this.isTestRunning) {
      this.updateStatus('✅ Epic test complete!');
      this.updateProgress('overall', 100);
      this.animateSpeed(0);
    }
  }

  // Stop test
  stopTest() {
    this.isTestRunning = false;
    this.testPhase = 'stopped';
    
    // Update UI
    document.getElementById('startTestBtn').disabled = false;
    document.getElementById('stopTestBtn').disabled = true;
    this.updateStatus('Test stopped by user');
    
    // Reset progress
    this.updateProgress('download', 0);
    this.updateProgress('upload', 0);
    this.updateProgress('overall', 0);
    
    // Reset speedometer
    this.animateSpeed(0);
  }

  // Display test results
  displayResults() {
    if (!this.testResults) return;
    
    // Display metrics
    this.displayMetrics();
    
    // Display insights
    this.displayInsights();
    
    // Display capabilities
    this.displayCapabilities();
    
    // Display advanced metrics
    this.displayAdvancedMetrics();
    
    // Display score
    this.displayScore();
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
        status: this.getSpeedStatus(results.downloadSpeed?.overall?.average)
      },
      {
        label: 'Upload Speed',
        value: Math.round(results.uploadSpeed?.overall?.average || 0),
        unit: 'Mbps',
        status: this.getSpeedStatus(results.uploadSpeed?.overall?.average, true)
      },
      {
        label: 'Latency',
        value: Math.round(results.latency?.overall?.average || 0),
        unit: 'ms',
        status: this.getLatencyStatus(results.latency?.overall?.average)
      },
      {
        label: 'Jitter',
        value: Math.round(results.jitter?.average || 0),
        unit: 'ms',
        status: this.getJitterStatus(results.jitter?.average)
      },
      {
        label: 'Packet Loss',
        value: (results.packetLoss?.percentage || 0).toFixed(1),
        unit: '%',
        status: this.getPacketLossStatus(results.packetLoss?.percentage)
      },
      {
        label: 'DNS Performance',
        value: Math.round(results.dnsPerformance?.averageTime || 0),
        unit: 'ms',
        status: this.getDNSStatus(results.dnsPerformance?.averageTime)
      }
    ];
    
    metricsGrid.innerHTML = metrics.map(metric => `
      <div class="metric-card">
        <div class="metric-label">${metric.label}</div>
        <div class="metric-value">${metric.value}</div>
        <div class="metric-unit">${metric.unit}</div>
        <div class="metric-status ${metric.status.class}">${metric.status.text}</div>
      </div>
    `).join('');
  }

  // Display AI insights
  displayInsights() {
    const insightsList = document.getElementById('insightsList');
    const insights = this.testResults?.insights || [];
    
    if (insights.length === 0) {
      insightsList.innerHTML = '<div class="insight-card">No insights available yet. Run a test to get AI-powered analysis!</div>';
      return;
    }
    
    insightsList.innerHTML = insights.map(insight => `
      <div class="insight-card">${insight}</div>
    `).join('');
  }

  // Display capabilities
  displayCapabilities() {
    const capabilitiesGrid = document.getElementById('capabilitiesGrid');
    const capabilities = this.testResults?.capabilities || {};
    
    const capabilityItems = [
      { name: '4K Streaming', icon: '📺', supported: capabilities.streaming4K },
      { name: '1080p Streaming', icon: '📹', supported: capabilities.streaming1080p },
      { name: 'Gaming', icon: '🎮', supported: capabilities.gaming },
      { name: 'Video Calls', icon: '📞', supported: capabilities.videoConferencing },
      { name: 'Remote Work', icon: '💼', supported: capabilities.remoteWork },
      { name: 'Basic Browsing', icon: '🌐', supported: capabilities.basicBrowsing }
    ];
    
    capabilitiesGrid.innerHTML = capabilityItems.map(item => `
      <div class="capability-item ${item.supported ? 'supported' : 'unsupported'}">
        <span class="capability-icon">${item.icon}</span>
        <span class="capability-name">${item.name}</span>
      </div>
    `).join('');
  }

  // Display advanced metrics
  displayAdvancedMetrics() {
    const advancedGrid = document.getElementById('advancedGrid');
    const results = this.testResults;
    
    if (!results) {
      advancedGrid.innerHTML = '<p>No advanced metrics available yet.</p>';
      return;
    }
    
    const advancedSections = [];
    
    // CDN Performance
    if (results.cdnPerformance?.tests) {
      const cdnHtml = `
        <div class="advanced-item">
          <div class="advanced-title">CDN Performance</div>
          <div class="advanced-data">
            ${results.cdnPerformance.tests.map(cdn => `
              <div class="data-row">
                <span class="data-label">${cdn.name}</span>
                <span class="data-value">${cdn.speed ? `${cdn.speed} Mbps` : 'Failed'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      advancedSections.push(cdnHtml);
    }
    
    // IPv4 vs IPv6
    if (results.ipComparison && !results.ipComparison.error) {
      const ipHtml = `
        <div class="advanced-item">
          <div class="advanced-title">IP Protocol Comparison</div>
          <div class="advanced-data">
            <div class="data-row">
              <span class="data-label">IPv4 Latency</span>
              <span class="data-value">${results.ipComparison.ipv4?.latency || '--'} ms</span>
            </div>
            <div class="data-row">
              <span class="data-label">IPv6 Latency</span>
              <span class="data-value">${results.ipComparison.ipv6?.latency || '--'} ms</span>
            </div>
            <div class="data-row">
              <span class="data-label">Faster Protocol</span>
              <span class="data-value">${results.ipComparison.faster || '--'}</span>
            </div>
          </div>
        </div>
      `;
      advancedSections.push(ipHtml);
    }
    
    // Gaming Performance
    if (results.gamingLatency) {
      const gamingHtml = `
        <div class="advanced-item">
          <div class="advanced-title">Gaming Performance</div>
          <div class="advanced-data">
            <div class="data-row">
              <span class="data-label">Average Latency</span>
              <span class="data-value">${Math.round(results.gamingLatency.average)} ms</span>
            </div>
            <div class="data-row">
              <span class="data-label">P95 Latency</span>
              <span class="data-value">${Math.round(results.gamingLatency.p95)} ms</span>
            </div>
            <div class="data-row">
              <span class="data-label">P99 Latency</span>
              <span class="data-value">${Math.round(results.gamingLatency.p99)} ms</span>
            </div>
            <div class="data-row">
              <span class="data-label">Gaming Grade</span>
              <span class="data-value">${results.gamingLatency.gamingGrade}</span>
            </div>
          </div>
        </div>
      `;
      advancedSections.push(gamingHtml);
    }
    
    // VoIP Quality
    if (results.voipQuality) {
      const voipHtml = `
        <div class="advanced-item">
          <div class="advanced-title">VoIP Quality</div>
          <div class="advanced-data">
            <div class="data-row">
              <span class="data-label">MOS Score</span>
              <span class="data-value">${results.voipQuality.mos}/5.0</span>
            </div>
            <div class="data-row">
              <span class="data-label">Quality</span>
              <span class="data-value">${results.voipQuality.quality}</span>
            </div>
          </div>
        </div>
      `;
      advancedSections.push(voipHtml);
    }
    
    advancedGrid.innerHTML = advancedSections.join('');
  }

  // Display network score
  displayScore() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    const results = this.testResults;
    
    if (!results || !results.overallScore) {
      scoreDisplay.style.display = 'none';
      return;
    }
    
    const score = results.overallScore;
    const grade = results.grade;
    
    document.getElementById('scoreLarge').textContent = score;
    document.getElementById('scoreGrade').textContent = grade.grade;
    document.getElementById('scoreDescription').textContent = grade.description;
    
    scoreDisplay.style.display = 'block';
    
    // Animate score
    scoreDisplay.style.animation = 'fadeIn 0.5s ease';
  }

  // Clear results
  clearResults() {
    document.getElementById('metricsGrid').innerHTML = '';
    document.getElementById('insightsList').innerHTML = '';
    document.getElementById('capabilitiesGrid').innerHTML = '';
    document.getElementById('advancedGrid').innerHTML = '';
    document.getElementById('scoreDisplay').style.display = 'none';
  }

  // Update status
  updateStatus(message) {
    const statusElement = document.getElementById('testStatus');
    statusElement.textContent = message;
    
    if (this.isTestRunning) {
      statusElement.classList.add('testing');
    } else {
      statusElement.classList.remove('testing');
    }
  }

  // Update progress
  updateProgress(type, percentage) {
    const progressValue = document.getElementById(`${type}Progress`);
    const progressBar = document.getElementById(`${type}ProgressBar`);
    
    if (progressValue) {
      progressValue.textContent = `${Math.round(percentage)}%`;
    }
    
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
  }

  // Animate speedometer
  animateSpeed(targetSpeed) {
    this.targetSpeed = targetSpeed;
    
    if (!this.animationFrameId) {
      this.animateNeedle();
    }
  }

  // Animate needle
  animateNeedle() {
    const needle = document.getElementById('speedNeedle');
    const speedValue = document.getElementById('epicSpeedValue');
    
    // Smooth animation
    const diff = this.targetSpeed - this.currentSpeed;
    this.currentSpeed += diff * 0.1;
    
    // Update needle rotation (-45 to 225 degrees for 0 to 1000 Mbps)
    const maxSpeed = 1000;
    const rotation = -45 + (this.currentSpeed / maxSpeed) * 270;
    needle.style.transform = `translate(-50%, -100%) rotate(${rotation}deg)`;
    
    // Update speed display
    speedValue.textContent = Math.round(this.currentSpeed);
    
    // Continue animation if needed
    if (Math.abs(diff) > 0.1) {
      this.animationFrameId = requestAnimationFrame(() => this.animateNeedle());
    } else {
      this.animationFrameId = null;
    }
  }

  // Start needle idle animation
  startNeedleAnimation() {
    if (!this.isTestRunning) {
      // Idle animation
      const idleAnimation = () => {
        if (!this.isVisible || this.isTestRunning) return;
        
        const randomSpeed = Math.random() * 20;
        this.animateSpeed(randomSpeed);
        
        setTimeout(() => {
          if (this.isVisible && !this.isTestRunning) {
            idleAnimation();
          }
        }, 2000);
      };
      
      idleAnimation();
    }
  }

  // Stop needle animation
  stopNeedleAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.currentSpeed = 0;
    this.targetSpeed = 0;
  }

  // Reset UI
  resetUI() {
    this.updateStatus('Ready to begin epic testing');
    this.updateProgress('download', 0);
    this.updateProgress('upload', 0);
    this.updateProgress('overall', 0);
    this.clearResults();
  }

  // Get speed status
  getSpeedStatus(speed, isUpload = false) {
    const thresholds = isUpload ? 
      { excellent: 50, good: 25, fair: 10 } :
      { excellent: 100, good: 50, fair: 25 };
    
    if (speed >= thresholds.excellent) return { text: 'Excellent', class: 'good' };
    if (speed >= thresholds.good) return { text: 'Good', class: 'good' };
    if (speed >= thresholds.fair) return { text: 'Fair', class: 'fair' };
    return { text: 'Poor', class: 'poor' };
  }

  // Get latency status
  getLatencyStatus(latency) {
    if (latency < 20) return { text: 'Excellent', class: 'good' };
    if (latency < 50) return { text: 'Good', class: 'good' };
    if (latency < 100) return { text: 'Fair', class: 'fair' };
    return { text: 'Poor', class: 'poor' };
  }

  // Get jitter status
  getJitterStatus(jitter) {
    if (jitter < 5) return { text: 'Excellent', class: 'good' };
    if (jitter < 15) return { text: 'Good', class: 'good' };
    if (jitter < 30) return { text: 'Fair', class: 'fair' };
    return { text: 'Poor', class: 'poor' };
  }

  // Get packet loss status
  getPacketLossStatus(loss) {
    if (loss === 0) return { text: 'Perfect', class: 'good' };
    if (loss < 0.5) return { text: 'Good', class: 'good' };
    if (loss < 1) return { text: 'Fair', class: 'fair' };
    return { text: 'Poor', class: 'poor' };
  }

  // Get DNS status
  getDNSStatus(time) {
    if (time < 50) return { text: 'Excellent', class: 'good' };
    if (time < 100) return { text: 'Good', class: 'good' };
    if (time < 200) return { text: 'Fair', class: 'fair' };
    return { text: 'Poor', class: 'poor' };
  }
}