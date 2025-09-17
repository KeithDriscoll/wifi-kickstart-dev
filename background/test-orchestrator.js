// 🚀 NETWORK TEST ORCHESTRATOR V3.0 - Professional Network Analysis Engine
// Coordinates multiple test modules and provides real-time progress streaming

import { ConnectivityTests } from './tests/connectivity-tests.js';
import { SpeedTests } from './tests/speed-tests.js';
import { LatencyTests } from './tests/latency-tests.js';
import { SecurityTests } from './tests/security-tests.js';
import { ProtocolTests } from './tests/protocol-tests.js';

export class TestOrchestrator {
  constructor() {
    this.metrics = {};
    this.config = this.getDefaultConfig();
    this.progressCallback = null;
    this.speedCallback = null;
    this.currentPhase = 'idle';
    this.overallProgress = 0;
    this.phaseProgress = {};
    
    // Initialize test modules
    this.speedTests = new SpeedTests();
    this.latencyTests = new LatencyTests();
    this.securityTests = new SecurityTests();
    this.protocolTests = new ProtocolTests();
    this.connectivityTests = new ConnectivityTests();
  }

  // Set progress callback for real-time updates
  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  // Set speed callback for speedometer updates
  setSpeedCallback(callback) {
    this.speedCallback = callback;
  }

  // Send progress update
  updateProgress(type, value, phase = null) {
    if (this.progressCallback) {
      this.progressCallback({
        type,
        value,
        phase: phase || this.currentPhase,
        timestamp: Date.now()
      });
    }
  }

  // Send speed update
  updateSpeed(speed, type = 'current') {
    if (this.speedCallback) {
      this.speedCallback({
        speed,
        type,
        timestamp: Date.now()
      });
    }
  }

  // Get default configuration
  getDefaultConfig() {
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
      securityTests: {
        enabled: true,
        vpnDetection: true,
        warpDetection: true,
        captivePortalCheck: true,
        threatDetection: false
      },
      protocolTests: {
        enabled: false,
        ipv6Testing: true,
        cdnTesting: true,
        dnsPerformance: true,
        connectionStability: false,
        routingEfficiency: false
      },
      gamingTests: {
        enabled: false,
        sampleCount: 100,
        burstTests: true
      },
      advancedTests: {
        enabled: false,
        patternDetection: false,
        throttlingDetection: false,
        aiInsights: false
      }
    };
  }

  // Update configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Update test module configs
    this.speedTests.updateConfig(this.config.downloadTests, this.config.uploadTests);
    this.latencyTests.updateConfig(this.config.latencyTests);
    this.securityTests.updateConfig(this.config.securityTests);
    this.protocolTests.updateConfig(this.config.protocolTests);
  }

  // 🚀 MAIN NETWORK ANALYSIS WITH REAL-TIME PROGRESS
  async runCompleteAnalysis() {
    console.log('🚀 Starting Network Analysis with Test Orchestrator...');
    this.metrics = {};
    this.overallProgress = 0;
    this.currentPhase = 'initializing';
    
    const startTime = performance.now();
    
    // Calculate total steps for progress tracking
    const totalSteps = this.calculateTotalSteps();
    let completedSteps = 0;
    
    const updateOverallProgress = () => {
      this.overallProgress = Math.round((completedSteps / totalSteps) * 100);
      this.updateProgress('overall', this.overallProgress);
    };

    try {
      // Phase 1: Security & Basic Info (10% of total)
      this.currentPhase = 'security';
      this.updateProgress('phase', 0, 'Running security analysis...');
      await this.securityTests.runAnalysis();
      this.metrics.security = this.securityTests.getResults();
      completedSteps += 2;
      updateOverallProgress();

      // Phase 2: Latency Testing (15% of total)
      if (this.config.latencyTests.enabled) {
        this.currentPhase = 'latency';
        this.updateProgress('phase', 0, '⚡ Measuring network latency...');
        
        // Set up real-time callbacks for latency tests
        this.latencyTests.setProgressCallback((update) => {
          this.updateProgress('latency', update.value, update.phase);
        });
        
        await this.latencyTests.runLatencyAnalysis();
        this.metrics.latency = this.latencyTests.getResults();
        completedSteps += 3;
        updateOverallProgress();
      }

      // Phase 3: Speed Testing (60% of total)
      if (this.config.downloadTests.enabled || this.config.uploadTests.enabled) {
        this.currentPhase = 'speed';
        this.updateProgress('phase', 0, '🚀 Running speed tests...');
        
        // Set up real-time callbacks for speed tests
        this.speedTests.setProgressCallback((update) => {
          this.updateProgress('speed', update.value, update.phase);
        });
        
        this.speedTests.setSpeedCallback((update) => {
          this.updateSpeed(update.speed, update.type);
        });
        
        await this.speedTests.runSpeedAnalysis();
        this.metrics.speed = this.speedTests.getResults();
        completedSteps += 12;
        updateOverallProgress();
      }

      // Phase 4: Protocol Testing (15% of total) - Optional
      if (this.config.protocolTests.enabled) {
        this.currentPhase = 'protocols';
        this.updateProgress('phase', 0, '🌐 Testing network protocols...');
        
        await this.protocolTests.runProtocolAnalysis();
        this.metrics.protocols = this.protocolTests.getResults();
        completedSteps += 3;
        updateOverallProgress();
      }

      // Final Phase: Analysis Complete
      this.currentPhase = 'complete';
      const duration = performance.now() - startTime;
      
      // Generate comprehensive results
      const results = this.generateFinalResults(duration);
      
      this.updateProgress('complete', 100, 'Analysis complete!');
      console.log(`✅ Network analysis completed in ${Math.round(duration)}ms`);
      
      return results;

    } catch (error) {
      console.error('❌ Network analysis failed:', error);
      this.updateProgress('error', 0, `Error: ${error.message}`);
      throw error;
    }
  }

  // Calculate total steps for progress tracking
  calculateTotalSteps() {
    let steps = 2; // Security tests
    
    if (this.config.latencyTests.enabled) steps += 3;
    if (this.config.downloadTests.enabled || this.config.uploadTests.enabled) steps += 12;
    if (this.config.protocolTests.enabled) steps += 3;
    
    return steps;
  }

  // Generate final comprehensive results
  generateFinalResults(duration) {
    const results = {
      timestamp: Date.now(),
      duration: Math.round(duration),
      version: '3.0',
      testType: 'comprehensive',
      
      // Core metrics
      downloadSpeed: this.metrics.speed?.download || null,
      uploadSpeed: this.metrics.speed?.upload || null,
      latency: this.metrics.latency?.overall || null,
      jitter: this.metrics.latency?.jitter || null,
      
      // Security analysis
      security: this.metrics.security || null,
      
      // Protocol analysis
      protocols: this.metrics.protocols || null,
      
      // Performance scoring
      overallScore: this.calculateOverallScore(),
      networkGrade: this.calculateNetworkGrade(),
      
      // Capability assessment
      capabilities: this.assessNetworkCapabilities(),
      
      // AI-ready insights
      insights: this.generateInsights(),
      
      // Recommendations
      recommendations: this.generateRecommendations()
    };

    return results;
  }

  // Calculate overall network performance score
  calculateOverallScore() {
    let score = 0;
    let weight = 0;

    // Speed scoring (40% weight)
    if (this.metrics.speed?.download) {
      const dlSpeed = this.metrics.speed.download.overall.average;
      if (dlSpeed >= 100) score += 40;
      else if (dlSpeed >= 50) score += 30;
      else if (dlSpeed >= 25) score += 20;
      else if (dlSpeed >= 10) score += 10;
      weight += 40;
    }

    // Latency scoring (30% weight)
    if (this.metrics.latency?.overall) {
      const latency = this.metrics.latency.overall.average;
      if (latency < 20) score += 30;
      else if (latency < 50) score += 25;
      else if (latency < 100) score += 15;
      else if (latency < 200) score += 5;
      weight += 30;
    }

    // Security scoring (20% weight)
    if (this.metrics.security) {
      const securityScore = this.calculateSecurityScore();
      score += (securityScore * 0.2);
      weight += 20;
    }

    // Protocol efficiency scoring (10% weight)
    if (this.metrics.protocols) {
      const protocolScore = this.calculateProtocolScore();
      score += (protocolScore * 0.1);
      weight += 10;
    }

    return weight > 0 ? Math.round(score / weight * 100) : 0;
  }

  // Calculate security score
  calculateSecurityScore() {
    let score = 50; // Base score
    const security = this.metrics.security;
    
    if (security.vpnStatus === 'Connected') score += 25;
    if (security.warpStatus === 'Connected') score += 20;
    if (!security.captivePortal) score += 5;
    
    return Math.min(100, score);
  }

  // Calculate protocol efficiency score
  calculateProtocolScore() {
    if (!this.metrics.protocols) return 50;
    
    let score = 0;
    let tests = 0;
    
    if (this.metrics.protocols.ipv6?.supported) {
      score += 30;
      tests++;
    }
    
    if (this.metrics.protocols.cdn?.averageSpeed > 50) {
      score += 40;
      tests++;
    }
    
    if (this.metrics.protocols.dns?.averageTime < 50) {
      score += 30;
      tests++;
    }
    
    return tests > 0 ? score / tests : 50;
  }

  // Calculate network grade
  calculateNetworkGrade() {
    const score = this.calculateOverallScore();
    
    const grades = [
      { min: 95, grade: 'A+', description: 'Exceptional Network Performance' },
      { min: 90, grade: 'A', description: 'Excellent Network Performance' },
      { min: 85, grade: 'A-', description: 'Very Good Network Performance' },
      { min: 80, grade: 'B+', description: 'Good Network Performance' },
      { min: 75, grade: 'B', description: 'Above Average Performance' },
      { min: 70, grade: 'B-', description: 'Decent Network Performance' },
      { min: 65, grade: 'C+', description: 'Average Network Performance' },
      { min: 60, grade: 'C', description: 'Acceptable Network Performance' },
      { min: 55, grade: 'C-', description: 'Below Average Performance' },
      { min: 50, grade: 'D+', description: 'Poor Network Performance' },
      { min: 45, grade: 'D', description: 'Very Poor Performance' },
      { min: 0, grade: 'F', description: 'Failing Network Performance' }
    ];
    
    return grades.find(g => score >= g.min) || grades[grades.length - 1];
  }

  // Assess network capabilities
  assessNetworkCapabilities() {
    const dlSpeed = this.metrics.speed?.download?.overall?.average || 0;
    const ulSpeed = this.metrics.speed?.upload?.overall?.average || 0;
    const latency = this.metrics.latency?.overall?.average || 100;
    const jitter = this.metrics.latency?.jitter?.average || 0;
    
    return {
      streaming4K: dlSpeed >= 25 && latency < 50,
      streaming1080p: dlSpeed >= 5 && latency < 100,
      gaming: latency < 50 && jitter < 20,
      competitiveGaming: latency < 20 && jitter < 10,
      videoConferencing: dlSpeed >= 3 && ulSpeed >= 2 && latency < 150,
      remoteWork: dlSpeed >= 10 && ulSpeed >= 5 && latency < 100,
      basicBrowsing: dlSpeed >= 1 && latency < 200,
      fileSharing: ulSpeed >= 10,
      cloudBackup: ulSpeed >= 25
    };
  }

  // Generate AI-ready insights
  generateInsights() {
    const insights = [];
    const dlSpeed = this.metrics.speed?.download?.overall?.average || 0;
    const ulSpeed = this.metrics.speed?.upload?.overall?.average || 0;
    const latency = this.metrics.latency?.overall?.average || 100;
    const jitter = this.metrics.latency?.jitter?.average || 0;
    
    // Speed insights
    if (dlSpeed >= 100) {
      insights.push('🚀 Excellent download speed - perfect for any online activity!');
    } else if (dlSpeed < 10) {
      insights.push('⚠️ Download speed may impact HD streaming and large downloads.');
    }
    
    if (ulSpeed >= 50) {
      insights.push('📤 Outstanding upload speed - ideal for content creators!');
    } else if (ulSpeed < 5) {
      insights.push('📤 Upload speed may limit video calls and cloud backups.');
    }
    
    // Latency insights
    if (latency < 20) {
      insights.push('⚡ Ultra-low latency - excellent for competitive gaming!');
    } else if (latency > 100) {
      insights.push('⏱️ Higher latency detected - may affect real-time applications.');
    }
    
    // Jitter insights
    if (jitter > 30) {
      insights.push('📊 Network jitter detected - may impact voice/video quality.');
    }
    
    // Security insights
    if (this.metrics.security?.vpnStatus === 'Connected') {
      insights.push('🛡️ VPN detected - your connection is secured and private.');
    }
    
    if (this.metrics.security?.captivePortal) {
      insights.push('🌐 Captive portal detected - you may need to complete login.');
    }
    
    return insights;
  }

  // Generate actionable recommendations
  generateRecommendations() {
    const recommendations = [];
    const dlSpeed = this.metrics.speed?.download?.overall?.average || 0;
    const ulSpeed = this.metrics.speed?.upload?.overall?.average || 0;
    const latency = this.metrics.latency?.overall?.average || 100;
    
    if (dlSpeed < 25) {
      recommendations.push({
        type: 'speed',
        priority: 'high',
        title: 'Consider Internet Upgrade',
        description: 'Your current download speed may limit HD streaming and large downloads.',
        action: 'Contact your ISP about faster plans'
      });
    }
    
    if (latency > 100) {
      recommendations.push({
        type: 'latency',
        priority: 'medium',
        title: 'Optimize Network Path',
        description: 'High latency may affect real-time applications.',
        action: 'Try connecting via ethernet or moving closer to router'
      });
    }
    
    if (ulSpeed < 5) {
      recommendations.push({
        type: 'upload',
        priority: 'medium',
        title: 'Upload Speed Limitation',
        description: 'Low upload speeds may impact video calls and cloud syncing.',
        action: 'Consider upgrading your internet plan'
      });
    }
    
    if (!this.metrics.security?.vpnStatus || this.metrics.security.vpnStatus === 'Disconnected') {
      recommendations.push({
        type: 'security',
        priority: 'low',
        title: 'Consider VPN Protection',
        description: 'A VPN can enhance your privacy and security online.',
        action: 'Enable VPN or WARP for additional protection'
      });
    }
    
    return recommendations;
  }

  // Get current test results
  getResults() {
    return this.metrics;
  }

  // Get test configuration
  getConfig() {
    return this.config;
  }

  // Stop any running tests
  stopTests() {
    this.speedTests.stop();
    this.latencyTests.stop();
    this.securityTests.stop();
    this.protocolTests.stop();
    
    this.currentPhase = 'stopped';
    this.updateProgress('stopped', 0, 'Tests stopped by user');
  }
}