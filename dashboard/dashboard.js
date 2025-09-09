// 🚀 Wi-Fi Kickstart Dashboard Controller
// Manages charts, real-time updates, and dashboard interactions

import { EpicOverlay } from './epic-overlay.js';

// Dashboard Controller Class
class DashboardController {
  constructor() {
    this.charts = {};
    this.testHistory = [];
    this.currentMetrics = {};
    this.epicOverlay = null;
    this.updateInterval = null;
    this.settings = {
      chartUpdateInterval: 5000,
      chartDataPoints: 50,
      chartAnimation: true,
      compactMode: false,
      showNotifications: true,
      autoRefresh: true,
      defaultTestMode: 'standard'
    };
    this.sortableInstances = [];
  }
  
  // Initialize Dashboard
  async init() {
    console.log('🚀 Initializing Dashboard...');
    
    // Load settings
    await this.loadSettings();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize epic overlay
    this.epicOverlay = new EpicOverlay();
    await this.epicOverlay.init();
    
    // ✅ INITIALIZE CHARTS FIRST
    this.initializeCharts();
    
    // Load network info
    await this.loadNetworkInfo();
    
    // ✅ THEN load test history (which calls updateChartsWithHistory)
    await this.loadTestHistory();
    
    // Setup sortable sections
    this.setupSortable();
    
    // Start real-time updates
    if (this.settings.autoRefresh) {
      this.startRealTimeUpdates();
    }
    
    // Check for auto-test
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autotest') === 'true' || this.settings.autoTestOnLoad) {
      setTimeout(() => this.runQuickTest(), 1000);
    }
    
    console.log('✅ Dashboard initialized successfully!');
  }

  // Load settings from storage
  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['dashboardSettings'], (result) => {
        if (result.dashboardSettings) {
          this.settings = { ...this.settings, ...result.dashboardSettings };
          this.applySettings();
        }
        resolve();
      });
    });
  }

  // Apply settings to UI
  applySettings() {
    // Apply compact mode
    document.body.classList.toggle('compact-mode', this.settings.compactMode);
    
    // Update settings panel
    document.getElementById('chartUpdateInterval').value = this.settings.chartUpdateInterval;
    document.getElementById('chartDataPoints').value = this.settings.chartDataPoints;
    document.getElementById('dataPointsValue').textContent = this.settings.chartDataPoints;
    document.getElementById('chartAnimation').checked = this.settings.chartAnimation;
    document.getElementById('compactMode').checked = this.settings.compactMode;
    document.getElementById('showNotifications').checked = this.settings.showNotifications;
    document.getElementById('autoRefresh').checked = this.settings.autoRefresh;
    document.getElementById('defaultTestMode').value = this.settings.defaultTestMode;
  }

  // Setup event listeners
  setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Fullscreen toggle
    document.getElementById('fullscreenToggle').addEventListener('click', () => {
      this.toggleFullscreen();
    });
    
    // Settings panel
    document.getElementById('settingsPanelToggle').addEventListener('click', () => {
      this.toggleSettingsPanel();
    });
    
    document.getElementById('closeFlyout').addEventListener('click', () => {
      this.toggleSettingsPanel(false);
    });
    
    // Header buttons
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.refreshDashboard();
    });
    
    document.getElementById('epicTestBtn').addEventListener('click', () => {
      this.epicOverlay.show();
    });
    
    // Footer buttons
    document.getElementById('exportData').addEventListener('click', () => {
      this.exportData();
    });
    
    document.getElementById('clearHistory').addEventListener('click', () => {
      this.clearHistory();
    });
    
    // Settings controls
    document.getElementById('chartUpdateInterval').addEventListener('change', (e) => {
      this.settings.chartUpdateInterval = parseInt(e.target.value);
      this.saveSettings();
      this.restartRealTimeUpdates();
    });
    
    document.getElementById('chartDataPoints').addEventListener('input', (e) => {
      this.settings.chartDataPoints = parseInt(e.target.value);
      document.getElementById('dataPointsValue').textContent = e.target.value;
      this.saveSettings();
    });
    
    document.getElementById('chartAnimation').addEventListener('change', (e) => {
      this.settings.chartAnimation = e.target.checked;
      this.saveSettings();
      this.updateChartAnimations();
    });
    
    document.getElementById('compactMode').addEventListener('change', (e) => {
      this.settings.compactMode = e.target.checked;
      document.body.classList.toggle('compact-mode', e.target.checked);
      this.saveSettings();
    });
    
    document.getElementById('showNotifications').addEventListener('change', (e) => {
      this.settings.showNotifications = e.target.checked;
      this.saveSettings();
    });
    
    document.getElementById('autoRefresh').addEventListener('change', (e) => {
      this.settings.autoRefresh = e.target.checked;
      this.saveSettings();
      if (e.target.checked) {
        this.startRealTimeUpdates();
      } else {
        this.stopRealTimeUpdates();
      }
    });
    
    document.getElementById('defaultTestMode').addEventListener('change', (e) => {
      this.settings.defaultTestMode = e.target.value;
      this.saveSettings();
    });
    
    document.getElementById('autoTestOnLoad').addEventListener('change', (e) => {
      this.settings.autoTestOnLoad = e.target.checked;
      this.saveSettings();
    });
    
    document.getElementById('openFullSettings').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_SETTINGS' });
    });
    
    // Chart actions
    document.querySelectorAll('.chart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        const chartContainer = e.currentTarget.closest('.chart-container');
        const chartType = chartContainer.dataset.chart;
        
        if (action === 'refresh') {
          this.refreshChart(chartType);
        } else if (action === 'expand') {
          this.expandChart(chartType);
        }
      });
    });
    
    // Section sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const direction = e.currentTarget.dataset.direction;
        const section = e.currentTarget.closest('.dashboard-section');
        this.moveSection(section, direction);
      });
    });
    
    // Chart modal close
    document.getElementById('closeModal').addEventListener('click', () => {
      this.closeChartModal();
    });
    
    // Listen for messages from background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'TEST_RESULTS') {
        this.handleTestResults(request.results);
      }
    });

        // Dashboard customizer (left panel)
    document.getElementById('customizerToggle').addEventListener('click', () => {
      this.toggleCustomizer();
    });

    document.getElementById('closeCustomizer').addEventListener('click', () => {
      this.toggleCustomizer(false);
    });

    // Full settings panel (top panel)
    document.getElementById('fullSettingsToggle').addEventListener('click', () => {
      this.toggleFullSettings();
    });

    document.getElementById('closeFullSettings').addEventListener('click', () => {
      this.toggleFullSettings(false);
    });

    // Pill toggle switches
    document.querySelectorAll('.pill-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        this.handlePillToggle(toggle);
      });
    });
  }

  // Initialize all charts
  initializeCharts() {
    // Performance Over Time Chart
    this.charts.performance = new Chart(document.getElementById('performanceChart'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Download Speed',
            data: [],
            borderColor: '#4a90e2',
            backgroundColor: 'rgba(74, 144, 226, 0.1)',
            tension: 0.4
          },
          {
            label: 'Upload Speed',
            data: [],
            borderColor: '#50c878',
            backgroundColor: 'rgba(80, 200, 120, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: this.getChartOptions('Performance (Mbps)')
    });
    
    // Speed Test History Chart
    this.charts.speed = new Chart(document.getElementById('speedChart'), {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Download',
            data: [],
            backgroundColor: '#4a90e2'
          },
          {
            label: 'Upload',
            data: [],
            backgroundColor: '#50c878'
          }
        ]
      },
      options: this.getChartOptions('Speed (Mbps)')
    });
    
    // Latency Distribution Chart
    this.charts.latency = new Chart(document.getElementById('latencyChart'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Latency',
            data: [],
            borderColor: '#ffa500',
            backgroundColor: 'rgba(255, 165, 0, 0.1)',
            tension: 0.4
          },
          {
            label: 'Jitter',
            data: [],
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: this.getChartOptions('Time (ms)')
    });
    
    // Network Score Trend Chart
    this.charts.score = new Chart(document.getElementById('scoreChart'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Network Score',
          data: [],
          borderColor: '#4a90e2',
          backgroundColor: 'rgba(74, 144, 226, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: this.getChartOptions('Score (0-100)')
    });
    
    // Provider Performance Chart
    this.charts.provider = new Chart(document.getElementById('providerChart'), {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#4a90e2',
            '#50c878',
            '#ffa500',
            '#ff6b6b',
            '#9c88ff'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#e2e8f0',
              font: { size: 11 }
            }
          }
        }
      }
    });
    
    // Quality Distribution Chart
    this.charts.quality = new Chart(document.getElementById('qualityChart'), {
      type: 'radar',
      data: {
        labels: ['Speed', 'Latency', 'Stability', 'Jitter', 'Packet Loss'],
        datasets: [{
          label: 'Current',
          data: [0, 0, 0, 0, 0],
          borderColor: '#4a90e2',
          backgroundColor: 'rgba(74, 144, 226, 0.2)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#8892b0',
              backdropColor: 'transparent'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            pointLabels: {
              color: '#e2e8f0',
              font: { size: 11 }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  // Get chart options
  getChartOptions(yAxisLabel) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: this.settings.chartAnimation ? 750 : 0
      },
      scales: {
        x: {
          ticks: {
            color: '#8892b0',
            maxRotation: 45,
            minRotation: 45,
            font: { size: 10 }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#8892b0',
            font: { size: 10 }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          title: {
            display: true,
            text: yAxisLabel,
            color: '#8892b0',
            font: { size: 11 }
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#e2e8f0',
            font: { size: 11 },
            padding: 10
          }
        },
        tooltip: {
          backgroundColor: 'rgba(26, 31, 58, 0.9)',
          titleColor: '#e2e8f0',
          bodyColor: '#8892b0',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1
        }
      }
    };
  }

  // Setup sortable sections
  setupSortable() {
    const container = document.getElementById('dashboardContainer');
    
    // Make sections sortable
    this.sortableInstances.push(
      new Sortable(container, {
        animation: 150,
        handle: '.section-header',
        draggable: '.dashboard-section',
        ghostClass: 'dragging',
        dragClass: 'drag-over',
        onEnd: () => {
          this.saveSectionOrder();
        }
      })
    );
    
    // Make charts sortable
    const chartsGrid = document.getElementById('chartsGrid');
    this.sortableInstances.push(
      new Sortable(chartsGrid, {
        animation: 150,
        handle: '.chart-header',
        draggable: '.chart-container',
        ghostClass: 'dragging',
        onEnd: () => {
          this.saveChartOrder();
        }
      })
    );
  }

  // Load network information
  async loadNetworkInfo() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_NETWORK_INFO' });
      if (response.success) {
        const info = response.info;
        
        // Update UI
        this.updateElement('ipAddress', info.ip || 'Unknown');
        this.updateElement('location', info.location || 'Unknown');
        this.updateElement('provider', info.provider || 'Unknown');
        this.updateElement('warpStatus', info.warpStatus || 'Unknown');
        this.updateElement('vpnStatus', info.vpnStatus || 'Unknown');
        this.updateElement('connectionType', info.connectionType || 'Unknown');
        
        // Store current network info
        this.currentMetrics.networkInfo = info;
      }
    } catch (error) {
      console.error('Failed to load network info:', error);
    }
  }

  // Load test history
  async loadTestHistory() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_TEST_HISTORY' });
      if (response.success) {
        this.testHistory = response.history || [];
        this.updateChartsWithHistory();
        this.updateStatistics();
      }
    } catch (error) {
      console.error('Failed to load test history:', error);
    }
  }

  // Update charts with history data
  updateChartsWithHistory() {
    if (this.testHistory.length === 0) return;

    if (!this.charts.performance || !this.charts.speed || !this.charts.latency || !this.charts.score) {
    console.log('Charts not initialized yet, skipping update');
    return;
  }
    
    // Get last N data points
    const dataPoints = this.testHistory.slice(0, this.settings.chartDataPoints).reverse();
    
    // Update performance chart
    const performanceLabels = dataPoints.map(d => this.formatTime(d.timestamp));
    const downloadSpeeds = dataPoints.map(d => d.results?.downloadSpeed?.overall?.average || 0);
    const uploadSpeeds = dataPoints.map(d => d.results?.uploadSpeed?.overall?.average || 0);
    
    this.charts.performance.data.labels = performanceLabels;
    this.charts.performance.data.datasets[0].data = downloadSpeeds;
    this.charts.performance.data.datasets[1].data = uploadSpeeds;
    this.charts.performance.update();
    
    // Update speed test history chart
    const speedLabels = dataPoints.slice(-10).map(d => this.formatTime(d.timestamp));
    const speedDownloads = dataPoints.slice(-10).map(d => d.results?.downloadSpeed?.overall?.average || 0);
    const speedUploads = dataPoints.slice(-10).map(d => d.results?.uploadSpeed?.overall?.average || 0);
    
    this.charts.speed.data.labels = speedLabels;
    this.charts.speed.data.datasets[0].data = speedDownloads;
    this.charts.speed.data.datasets[1].data = speedUploads;
    this.charts.speed.update();
    
    // Update latency chart
    const latencyData = dataPoints.map(d => d.results?.latency?.overall?.average || 0);
    const jitterData = dataPoints.map(d => d.results?.jitter?.average || 0);
    
    this.charts.latency.data.labels = performanceLabels;
    this.charts.latency.data.datasets[0].data = latencyData;
    this.charts.latency.data.datasets[1].data = jitterData;
    this.charts.latency.update();
    
    // Update score chart
    const scores = dataPoints.map(d => d.results?.overallScore || 0);
    
    this.charts.score.data.labels = performanceLabels;
    this.charts.score.data.datasets[0].data = scores;
    this.charts.score.update();
    
    // Update provider chart
    this.updateProviderChart();
    
    // Update quality chart with latest data
    if (dataPoints.length > 0) {
      this.updateQualityChart(dataPoints[dataPoints.length - 1].results);
    }
  }

  // Update provider performance chart
  updateProviderChart() {
    const providers = {};
    
    this.testHistory.forEach(test => {
      const provider = test.results?.networkInfo?.provider || 'Unknown';
      providers[provider] = (providers[provider] || 0) + 1;
    });
    
    this.charts.provider.data.labels = Object.keys(providers);
    this.charts.provider.data.datasets[0].data = Object.values(providers);
    this.charts.provider.update();
  }

  // Update quality radar chart
  updateQualityChart(results) {
    if (!results) return;
    
    const speedScore = Math.min(100, (results.downloadSpeed?.overall?.average || 0) / 100 * 100);
    const latencyScore = Math.max(0, 100 - (results.latency?.overall?.average || 100));
    const stabilityScore = results.connectionStability?.stabilityScore || 0;
    const jitterScore = Math.max(0, 100 - (results.jitter?.average || 0));
    const packetLossScore = Math.max(0, 100 - (results.packetLoss?.percentage || 0) * 10);
    
    this.charts.quality.data.datasets[0].data = [
      speedScore,
      latencyScore,
      stabilityScore,
      jitterScore,
      packetLossScore
    ];
    this.charts.quality.update();
  }

  // Update statistics
  updateStatistics() {
    if (this.testHistory.length === 0) {
      this.updateElement('avgLatency', '--');
      this.updateElement('avgSpeed', '--');
      this.updateElement('bestScore', '--');
      this.updateElement('testsRun', '0');
      this.updateElement('lastUpdated', 'Never');
      return;
    }
    
    // Calculate averages
    let totalLatency = 0;
    let totalSpeed = 0;
    let bestScore = 0;
    let validTests = 0;
    
    this.testHistory.forEach(test => {
      if (test.results) {
        const latency = test.results.latency?.overall?.average;
        const speed = test.results.downloadSpeed?.overall?.average;
        const score = test.results.overallScore;
        
        if (latency) totalLatency += latency;
        if (speed) totalSpeed += speed;
        if (score > bestScore) bestScore = score;
        validTests++;
      }
    });
    
    const avgLatency = validTests > 0 ? Math.round(totalLatency / validTests) : 0;
    const avgSpeed = validTests > 0 ? Math.round(totalSpeed / validTests) : 0;
    
    // Update UI
    this.updateElement('avgLatency', `${avgLatency}ms`);
    this.updateElement('avgSpeed', `${avgSpeed} Mbps`);
    this.updateElement('bestScore', bestScore);
    this.updateElement('testsRun', this.testHistory.length);
    
    if (this.testHistory.length > 0) {
      const lastTest = this.testHistory[0];
      this.updateElement('lastUpdated', this.formatTime(lastTest.timestamp));
    }
    
    // Calculate uptime
    const startTime = sessionStorage.getItem('dashboardStartTime') || Date.now();
    sessionStorage.setItem('dashboardStartTime', startTime);
    const uptime = Date.now() - parseInt(startTime);
    this.updateElement('uptime', this.formatUptime(uptime));
  }

  // Start real-time updates
  startRealTimeUpdates() {
    this.stopRealTimeUpdates();
    
    // Update immediately
    this.updateRealTimeMetrics();
    
    // Set interval
    this.updateInterval = setInterval(() => {
      this.updateRealTimeMetrics();
    }, this.settings.chartUpdateInterval);
  }

  // Stop real-time updates
  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Restart real-time updates
  restartRealTimeUpdates() {
    if (this.settings.autoRefresh) {
      this.startRealTimeUpdates();
    }
  }

  // Update real-time metrics
  async updateRealTimeMetrics() {
    // Simple latency test
    const latency = await this.measureLatency();
    this.updateElement('currentLatency', Math.round(latency));
    
    // Update other metrics from last test
    if (this.testHistory.length > 0) {
      const lastTest = this.testHistory[0].results;
      
      this.updateElement('currentSpeed', Math.round(lastTest.downloadSpeed?.overall?.average || 0));
      this.updateElement('currentJitter', Math.round(lastTest.jitter?.average || 0));
      this.updateElement('networkScore', lastTest.overallScore || '--');
      this.updateElement('packetLoss', (lastTest.packetLoss?.percentage || 0).toFixed(1));
      
      // Update connection quality
      const quality = this.calculateQuality(lastTest);
      this.updateElement('connectionQuality', quality);
    }
    
    // Update statistics
    this.updateStatistics();
  }

  // Measure latency
  async measureLatency() {
    const start = performance.now();
    try {
      await fetch('https://www.google.com/generate_204', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return performance.now() - start;
    } catch (error) {
      return 999;
    }
  }

  // Calculate connection quality
  calculateQuality(results) {
    if (!results) return 'Unknown';
    
    const score = results.overallScore || 0;
    
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 45) return 'Poor';
    return 'Critical';
  }

  // Handle test results from background
  handleTestResults(results) {
    // Add to history
    const entry = {
      timestamp: new Date().toISOString(),
      results,
      score: results.overallScore,
      grade: results.grade
    };
    
    this.testHistory.unshift(entry);
    if (this.testHistory.length > 100) {
      this.testHistory = this.testHistory.slice(0, 100);
    }
    
    // Update UI
    this.updateChartsWithHistory();
    this.updateStatistics();
    this.updateRealTimeMetrics();
    
    // Show notification
    if (this.settings.showNotifications) {
      this.showNotification(
        `Test Complete! Score: ${results.overallScore}`,
        'success'
      );
    }
  }

  // Refresh dashboard
  async refreshDashboard() {
    this.showNotification('Refreshing dashboard...', 'info');
    
    await this.loadNetworkInfo();
    await this.loadTestHistory();
    this.updateRealTimeMetrics();
    
    this.showNotification('Dashboard refreshed!', 'success');
  }

  // Run quick test
  async runQuickTest() {
    try {
      this.showNotification('Starting quick test...', 'info');
      
      const response = await chrome.runtime.sendMessage({
        type: 'RUN_EPIC_TEST',
        mode: 'quick'
      });
      
      if (response.success) {
        this.handleTestResults(response.results);
      }
    } catch (error) {
      console.error('Quick test failed:', error);
      this.showNotification('Test failed. Please try again.', 'error');
    }
  }

  // Refresh specific chart
  refreshChart(chartType) {
    if (this.charts[chartType]) {
      this.charts[chartType].update();
      this.showNotification(`${chartType} chart refreshed`, 'info');
    }
  }

  // Expand chart in modal
  expandChart(chartType) {
    const modal = document.getElementById('chartModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalChart = document.getElementById('modalChart');
    
    // Set title
    const titles = {
      performance: 'Network Performance Over Time',
      speed: 'Speed Test History',
      latency: 'Latency Distribution',
      score: 'Network Score Trend',
      provider: 'Provider Performance',
      quality: 'Connection Quality'
    };
    
    modalTitle.textContent = titles[chartType] || 'Chart';
    
    // Clone chart data
    const originalChart = this.charts[chartType];
    const ctx = modalChart.getContext('2d');
    
    // Destroy existing modal chart if exists
    if (this.modalChart) {
      this.modalChart.destroy();
    }
    
    // Create new chart in modal
    this.modalChart = new Chart(ctx, {
      type: originalChart.config.type,
      data: JSON.parse(JSON.stringify(originalChart.data)),
      options: {
        ...originalChart.config.options,
        maintainAspectRatio: false
      }
    });
    
    // Show modal
    modal.classList.add('active');
  }

  // Close chart modal
  closeChartModal() {
    const modal = document.getElementById('chartModal');
    modal.classList.remove('active');
    
    if (this.modalChart) {
      this.modalChart.destroy();
      this.modalChart = null;
    }
  }

  // Move section up or down
  moveSection(section, direction) {
    const container = section.parentElement;
    const sections = Array.from(container.querySelectorAll('.dashboard-section'));
    const currentIndex = sections.indexOf(section);
    
    if (direction === 'up' && currentIndex > 0) {
      container.insertBefore(section, sections[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < sections.length - 1) {
      container.insertBefore(sections[currentIndex + 1], section);
    }
    
    this.saveSectionOrder();
  }

  // Save section order
  saveSectionOrder() {
    const sections = Array.from(document.querySelectorAll('.dashboard-section'));
    const order = sections.map(s => s.dataset.section);
    
    chrome.storage.local.set({ sectionOrder: order });
  }

  // Save chart order
  saveChartOrder() {
    const charts = Array.from(document.querySelectorAll('.chart-container'));
    const order = charts.map(c => c.dataset.chart);
    
    chrome.storage.local.set({ chartOrder: order });
  }

  // Toggle theme
  toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    chrome.storage.local.set({ darkMode: isDark });
    
    // Update charts theme
    this.updateChartsTheme(isDark);
  }

  // Update charts theme
  updateChartsTheme(isDark) {
    const textColor = isDark ? '#e2e8f0' : '#1f2937';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    
    Object.values(this.charts).forEach(chart => {
      if (chart.options.scales) {
        if (chart.options.scales.x) {
          chart.options.scales.x.ticks.color = textColor;
          chart.options.scales.x.grid.color = gridColor;
        }
        if (chart.options.scales.y) {
          chart.options.scales.y.ticks.color = textColor;
          chart.options.scales.y.grid.color = gridColor;
        }
        if (chart.options.scales.r) {
          chart.options.scales.r.ticks.color = textColor;
          chart.options.scales.r.grid.color = gridColor;
          chart.options.scales.r.pointLabels.color = textColor;
        }
      }
      if (chart.options.plugins?.legend) {
        chart.options.plugins.legend.labels.color = textColor;
      }
      chart.update();
    });
  }

  // Update chart animations
  updateChartAnimations() {
    Object.values(this.charts).forEach(chart => {
      chart.options.animation.duration = this.settings.chartAnimation ? 750 : 0;
      chart.update();
    });
  }

 // Toggle fullscreen
toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      document.body.classList.add('fullscreen-mode');
      this.showNotification('Entered fullscreen mode', 'info');
      // Re-render charts for new dimensions
      setTimeout(() => {
        this.resizeCharts();
      }, 300);
    });
  } else {
    document.exitFullscreen().then(() => {
      document.body.classList.remove('fullscreen-mode');
      this.showNotification('Exited fullscreen mode', 'info');
      // Re-render charts for normal dimensions
      setTimeout(() => {
        this.resizeCharts();
      }, 300);
    });
  }
}

// Resize charts when entering/exiting fullscreen
resizeCharts() {
  Object.values(this.charts).forEach(chart => {
    if (chart && chart.resize) {
      chart.resize();
    }
  });
}

  // Toggle settings panel
  toggleSettingsPanel(show) {
    const panel = document.getElementById('settingsFlyout');
    if (show === undefined) {
      panel.classList.toggle('active');
    } else {
      panel.classList.toggle('active', show);
    }
  }

  // Export data
  async exportData() {
    const exportData = {
      testHistory: this.testHistory,
      currentMetrics: this.currentMetrics,
      settings: this.settings,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `wifi-kickstart-export-${new Date().toISOString()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.showNotification('Data exported successfully!', 'success');
  }

  // Clear history
  async clearHistory() {
    if (confirm('Are you sure you want to clear all test history?')) {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' });
        if (response.success) {
          this.testHistory = [];
          this.updateChartsWithHistory();
          this.updateStatistics();
          this.showNotification('History cleared!', 'success');
        }
      } catch (error) {
        console.error('Failed to clear history:', error);
        this.showNotification('Failed to clear history.', 'error');
      }
    }
  }

  // Save settings
  saveSettings() {
    chrome.storage.local.set({ dashboardSettings: this.settings });
  }

  // Show notification
  showNotification(message, type = 'info') {
    if (!this.settings.showNotifications) return;
    
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
      notification.remove();
    });
  }

  // Update element with animation
  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.style.animation = 'fadeIn 0.3s ease';
      element.textContent = value;
    }
  }

  // Format time
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }

  // Format uptime
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

    // Toggle dashboard customizer (left panel)
  toggleCustomizer(show) {
    const panel = document.getElementById('dashboardCustomizer');
    if (show === undefined) {
      panel.classList.toggle('active');
    } else {
      panel.classList.toggle('active', show);
    }
  }

  // Toggle full settings panel (top panel)
  toggleFullSettings(show) {
    const panel = document.getElementById('fullSettingsPanel');
    if (show === undefined) {
      panel.classList.toggle('active');
    } else {
      panel.classList.toggle('active', show);
    }
  }

  // Handle pill toggle switches
  handlePillToggle(toggle) {
    toggle.classList.toggle('active');
    
    const chartId = toggle.dataset.chart;
    const sectionId = toggle.dataset.section;
    
    if (chartId) {
      // Hide/show chart
      const chartContainer = document.querySelector(`[data-chart="${chartId}"]`);
      if (chartContainer) {
        chartContainer.style.display = toggle.classList.contains('active') ? 'block' : 'none';
      }
    }
    
    if (sectionId) {
      // Hide/show section
      const section = document.getElementById(sectionId);
      if (section) {
        section.style.display = toggle.classList.contains('active') ? 'block' : 'none';
      }
    }
    
    // Save preferences
    this.saveCustomizerSettings();
  }

  // Save customizer settings
  saveCustomizerSettings() {
    const settings = {
      charts: {},
      sections: {}
    };
    
    document.querySelectorAll('.pill-toggle[data-chart]').forEach(toggle => {
      settings.charts[toggle.dataset.chart] = toggle.classList.contains('active');
    });
    
    document.querySelectorAll('.pill-toggle[data-section]').forEach(toggle => {
      settings.sections[toggle.dataset.section] = toggle.classList.contains('active');
    });
    
    chrome.storage.local.set({ dashboardCustomizer: settings });
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new DashboardController();
  dashboard.init();
  
  // Make dashboard globally available for debugging
  window.dashboard = dashboard;
});