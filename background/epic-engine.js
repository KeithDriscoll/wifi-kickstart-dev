// 🔥 EPIC NETWORK METRICS ENGINE - ENHANCED EDITION
// The most comprehensive network diagnostics suite ever built
// Makes Speedtest.net look like amateur hour!

export class EpicNetworkMetrics {
  constructor() {
    this.testServers = {
      cloudflare: [
        'https://speed.cloudflare.com/__down?bytes=',
        'https://speed.cloudflare.com/__up'
      ],
      netflix: [
        'https://fast.com/netflix/speedtest/',
        'https://api.fast.com/netflix/speedtest'
      ],
      google: [
        'https://www.google.com/generate_204',
        'https://www.gstatic.com/generate_204'
      ],
      thinkbroadband: [
        'https://download.thinkbroadband.com/',
        'https://ipv4.download.thinkbroadband.com/'
      ],
      ovh: [
        'https://proof.ovh.net/files/',
        'https://proof.ovh.ca/files/'
      ]
    };
    
    this.cdnServers = {
      netflix: 'fast.com',
      youtube: 'googlevideo.com',
      amazon: 'cloudfront.net',
      cloudflare: 'cdnjs.cloudflare.com',
      fastly: 'fastly.net',
      akamai: 'akamaihd.net'
    };
    
    this.config = {};
    this.metrics = {};
    this.isRunning = false;
    this.abortController = null;
  }

  // Update configuration
  updateConfig(config) {
    this.config = { ...this.config, ...config };
  }

  // 🚀 MASTER DIAGNOSTIC RUNNER - THE BEAST MODE
  async runCompleteAnalysis() {
    console.log('🔥 STARTING EPIC NETWORK ANALYSIS - BEAST MODE ACTIVATED!');
    this.isRunning = true;
    this.abortController = new AbortController();
    this.metrics = { 
      timestamp: new Date().toISOString(),
      startTime: performance.now()
    };

    try {
      // Run tests based on configuration
      const testPromises = [];
      
      // Core Speed Metrics
      if (this.config.downloadTests?.enabled) {
        testPromises.push(this.measureDownloadSpeed());
      }
      if (this.config.uploadTests?.enabled) {
        testPromises.push(this.measureUploadSpeed());
      }
      
      // Latency & Jitter
      if (this.config.latencyTests?.enabled) {
        testPromises.push(this.measureLatencyAdvanced());
        testPromises.push(this.measureJitterAdvanced());
        testPromises.push(this.measurePacketLoss());
      }
      
      // Advanced Tests
      if (this.config.advancedTests?.enabled) {
        if (this.config.advancedTests.dnsPerformance) {
          testPromises.push(this.measureDNSPerformance());
        }
        if (this.config.advancedTests.connectionStability) {
          testPromises.push(this.measureConnectionStability());
        }
        if (this.config.advancedTests.cdnTesting) {
          testPromises.push(this.measureCDNPerformance());
        }
        if (this.config.advancedTests.ipv6Testing) {
          testPromises.push(this.measureIPv4vsIPv6());
        }
        if (this.config.advancedTests.routingEfficiency) {
          testPromises.push(this.measureRoutingEfficiency());
        }
      }
      
      // Gaming Tests
      if (this.config.gamingTests?.enabled) {
        testPromises.push(this.measureGamingLatency());
        testPromises.push(this.measureStreamingQuality());
        testPromises.push(this.measureVoIPQuality());
      }
      
      // Run all tests concurrently if configured
      if (this.config.advancedTests?.concurrentTesting) {
        await Promise.all(testPromises);
      } else {
        // Run sequentially
        for (const promise of testPromises) {
          await promise;
        }
      }
      
      // Calculate final metrics
      this.metrics.duration = performance.now() - this.metrics.startTime;
      this.metrics.overallScore = this.calculateEpicScore();
      this.metrics.grade = this.getNetworkGrade();
      this.metrics.capabilities = this.assessCapabilities();
      this.metrics.insights = this.generateInsights();
      
      console.log('🎯 EPIC ANALYSIS COMPLETE! Results:', this.metrics);
      return this.metrics;

    } catch (error) {
      console.error('Epic analysis failed:', error);
      this.metrics.error = error.message;
      throw error;
    } finally {
      this.isRunning = false;
      this.abortController = null;
    }
  }

  // 1. DOWNLOAD SPEED - Multi-server, multi-threaded
  async measureDownloadSpeed() {
    console.log('📊 Measuring download speed (multi-server)...');
    const results = [];
    const fileSizes = this.config.downloadTests?.fileSizes || ['1MB', '5MB', '10MB'];
    const iterations = this.config.downloadTests?.iterations || 3;
    const parallelConnections = this.config.downloadTests?.parallelConnections || 4;
    
    for (const size of fileSizes) {
      const sizeResults = [];
      const bytes = this.parseFileSize(size);
      
      // Test with multiple servers
      const servers = this.getActiveServers();
      
      for (let i = 0; i < iterations; i++) {
        // Parallel downloads
        const parallelTests = [];
        
        for (let j = 0; j < Math.min(parallelConnections, servers.length); j++) {
          const server = servers[j % servers.length];
          parallelTests.push(this.downloadFromServer(server, bytes));
        }
        
        const parallelResults = await Promise.all(parallelTests);
        const avgSpeed = parallelResults.reduce((a, b) => a + b, 0) / parallelResults.length;
        sizeResults.push(avgSpeed);
      }
      
      results.push({
        size,
        speeds: sizeResults,
        average: sizeResults.reduce((a, b) => a + b, 0) / sizeResults.length,
        max: Math.max(...sizeResults),
        min: Math.min(...sizeResults)
      });
    }
    
    this.metrics.downloadSpeed = {
      results,
      overall: {
        max: Math.max(...results.map(r => r.max)),
        average: results.reduce((a, r) => a + r.average, 0) / results.length,
        min: Math.min(...results.map(r => r.min)),
        consistency: this.calculateConsistency(results.map(r => r.average))
      }
    };
  }

  // Download from specific server
  async downloadFromServer(serverUrl, bytes) {
    try {
      const start = performance.now();
      const url = serverUrl.includes('cloudflare') ? 
        `${serverUrl}${bytes}` : 
        `${serverUrl}${this.getFileSizeUrl(bytes)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-cache',
        signal: this.abortController?.signal
      });
      
      const blob = await response.blob();
      const duration = (performance.now() - start) / 1000;
      const mbps = ((blob.size * 8) / duration) / 1_000_000;
      
      return mbps;
    } catch (error) {
      console.warn(`Download from ${serverUrl} failed:`, error);
      return 0;
    }
  }

  // 2. UPLOAD SPEED - Real upload test
  async measureUploadSpeed() {
    console.log('📤 Measuring upload speed...');
    const fileSizes = this.config.uploadTests?.fileSizes || ['1MB', '5MB'];
    const iterations = this.config.uploadTests?.iterations || 2;
    const results = [];
    
    for (const size of fileSizes) {
      const bytes = this.parseFileSize(size);
      const sizeResults = [];
      
      for (let i = 0; i < iterations; i++) {
        const testData = new Blob([new ArrayBuffer(bytes)]);
        const start = performance.now();
        
        try {
          const formData = new FormData();
          formData.append('file', testData);
          
          await fetch('https://httpbin.org/post', {
            method: 'POST',
            body: formData,
            signal: this.abortController?.signal
          });
          
          const duration = (performance.now() - start) / 1000;
          const mbps = ((testData.size * 8) / duration) / 1_000_000;
          sizeResults.push(mbps);
        } catch (error) {
          console.warn('Upload test failed:', error);
          sizeResults.push(0);
        }
      }
      
      results.push({
        size,
        speeds: sizeResults,
        average: sizeResults.reduce((a, b) => a + b, 0) / sizeResults.length
      });
    }
    
    this.metrics.uploadSpeed = {
      results,
      overall: {
        average: results.reduce((a, r) => a + r.average, 0) / results.length,
        max: Math.max(...results.map(r => Math.max(...r.speeds))),
        min: Math.min(...results.filter(r => r.speeds.some(s => s > 0))
          .map(r => Math.min(...r.speeds.filter(s => s > 0))))
      }
    };
  }

  // 3. ADVANCED LATENCY - Multiple targets
  async measureLatencyAdvanced() {
    console.log('⚡ Measuring advanced latency...');
    const targets = this.getLatencyTargets();
    const sampleCount = this.config.latencyTests?.sampleCount || 20;
    const results = [];
    
    for (const target of targets) {
      const targetResults = [];
      
      for (let i = 0; i < sampleCount; i++) {
        const start = performance.now();
        try {
          await fetch(target.url, { 
            method: 'HEAD', 
            cache: 'no-cache',
            signal: AbortSignal.timeout(5000)
          });
          targetResults.push(performance.now() - start);
        } catch (error) {
          // Skip failed attempts
        }
        
        // Small delay between samples
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      if (targetResults.length > 0) {
        results.push({
          target: target.name,
          samples: targetResults,
          average: targetResults.reduce((a, b) => a + b, 0) / targetResults.length,
          min: Math.min(...targetResults),
          max: Math.max(...targetResults),
          p95: this.calculatePercentile(targetResults, 95),
          p99: this.calculatePercentile(targetResults, 99)
        });
      }
    }
    
    // Overall latency metrics
    const allSamples = results.flatMap(r => r.samples);
    this.metrics.latency = {
      targets: results,
      overall: {
        average: allSamples.reduce((a, b) => a + b, 0) / allSamples.length,
        min: Math.min(...allSamples),
        max: Math.max(...allSamples),
        p95: this.calculatePercentile(allSamples, 95),
        p99: this.calculatePercentile(allSamples, 99),
        samples: allSamples.length
      }
    };
  }

  // 4. JITTER ANALYSIS - Statistical jitter
  async measureJitterAdvanced() {
    console.log('📈 Measuring network jitter...');
    const samples = [];
    const sampleCount = Math.min(this.config.latencyTests?.sampleCount || 20, 30);
    
    for (let i = 0; i < sampleCount; i++) {
      const start = performance.now();
      try {
        await fetch('https://www.google.com/generate_204', { 
          method: 'HEAD', 
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        });
        samples.push(performance.now() - start);
      } catch (error) {
        // Skip failed samples
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (samples.length > 1) {
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance = samples.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / samples.length;
      const stdDev = Math.sqrt(variance);
      
      // Calculate jitter as difference between consecutive samples
      const jitterSamples = [];
      for (let i = 1; i < samples.length; i++) {
        jitterSamples.push(Math.abs(samples[i] - samples[i-1]));
      }
      
      const avgJitter = jitterSamples.reduce((a, b) => a + b, 0) / jitterSamples.length;
      
      this.metrics.jitter = {
        average: Math.round(avgJitter),
        standardDeviation: Math.round(stdDev),
        coefficient: Math.round((stdDev / avg) * 100),
        quality: this.getJitterQuality(stdDev),
        samples: samples.length
      };
    }
  }

  // 5. PACKET LOSS - Critical for gaming/VoIP
  async measurePacketLoss() {
    console.log('📦 Measuring packet loss...');
    const tests = 30;
    let successful = 0;
    let totalTime = 0;
    
    for (let i = 0; i < tests; i++) {
      const start = performance.now();
      try {
        await fetch('https://www.google.com/generate_204', { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        });
        successful++;
        totalTime += performance.now() - start;
      } catch (error) {
        // Packet lost
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const lossPercentage = ((tests - successful) / tests) * 100;
    
    this.metrics.packetLoss = {
      percentage: Math.round(lossPercentage * 100) / 100,
      successful: successful,
      total: tests,
      avgResponseTime: successful > 0 ? totalTime / successful : 0,
      quality: this.getPacketLossQuality(lossPercentage)
    };
  }

  // 6. DNS PERFORMANCE - Website loading critical
  async measureDNSPerformance() {
    console.log('🌍 Measuring DNS performance...');
    const domains = [
      { name: 'Google', url: 'https://google.com/favicon.ico' },
      { name: 'Cloudflare', url: 'https://cloudflare.com/favicon.ico' },
      { name: 'Amazon', url: 'https://amazon.com/favicon.ico' },
      { name: 'Netflix', url: 'https://netflix.com/favicon.ico' },
      { name: 'YouTube', url: 'https://youtube.com/favicon.ico' },
      { name: 'Microsoft', url: 'https://microsoft.com/favicon.ico' }
    ];
    
    const results = [];
    
    for (const domain of domains) {
      const start = performance.now();
      try {
        await fetch(domain.url, { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        });
        const time = performance.now() - start;
        results.push({
          domain: domain.name,
          time,
          status: 'success'
        });
      } catch (error) {
        results.push({
          domain: domain.name,
          time: 5000,
          status: 'failed'
        });
      }
    }
    
    const successfulResults = results.filter(r => r.status === 'success');
    
    this.metrics.dnsPerformance = {
      results,
      averageTime: successfulResults.length > 0 ?
        successfulResults.reduce((a, r) => a + r.time, 0) / successfulResults.length : 0,
      fastestTime: successfulResults.length > 0 ?
        Math.min(...successfulResults.map(r => r.time)) : 0,
      slowestTime: successfulResults.length > 0 ?
        Math.max(...successfulResults.map(r => r.time)) : 0,
      successRate: (successfulResults.length / domains.length) * 100
    };
  }

  // 7. CONNECTION STABILITY - Long-term monitoring
  async measureConnectionStability() {
    console.log('🔒 Measuring connection stability...');
    const testDuration = 15; // 15 seconds (reduced from 30)
    const interval = 1000; // 1 second
    const tests = testDuration;
    
    let successful = 0;
    const latencies = [];
    
    for (let i = 0; i < tests; i++) {
      const start = performance.now();
      try {
        await fetch('https://www.google.com/generate_204', { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(2000)
        });
        const latency = performance.now() - start;
        latencies.push(latency);
        successful++;
      } catch (error) {
        // Connection unstable
        latencies.push(null);
      }
      
      if (i < tests - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    const validLatencies = latencies.filter(l => l !== null);
    
    this.metrics.connectionStability = {
      stabilityScore: (successful / tests) * 100,
      averageLatency: validLatencies.length > 0 ?
        validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length : 0,
      latencyVariation: this.calculateVariation(validLatencies),
      dropouts: tests - successful,
      qualityGrade: this.getStabilityGrade(successful / tests)
    };
  }

  // 8. CDN PERFORMANCE - Real-world content delivery
  async measureCDNPerformance() {
    console.log('🚀 Measuring CDN performance...');
    const cdnTests = [];
    
    const cdns = [
      { name: 'Cloudflare', url: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js' },
      { name: 'jsDelivr', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css' },
      { name: 'unpkg', url: 'https://unpkg.com/react@17/umd/react.production.min.js' },
      { name: 'Google', url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js' }
    ];
    
    for (const cdn of cdns) {
      const start = performance.now();
      try {
        const response = await fetch(cdn.url, { 
          cache: 'no-cache',
          signal: AbortSignal.timeout(10000)
        });
        const blob = await response.blob();
        const duration = performance.now() - start;
        const speed = ((blob.size * 8) / (duration / 1000)) / 1_000_000;
        
        cdnTests.push({
          name: cdn.name,
          speed: Math.round(speed * 10) / 10,
          latency: Math.round(duration),
          size: blob.size,
          status: 'success'
        });
      } catch (error) {
        cdnTests.push({
          name: cdn.name,
          error: error.message,
          status: 'failed'
        });
      }
    }
    
    this.metrics.cdnPerformance = {
      tests: cdnTests,
      averageSpeed: cdnTests.filter(t => t.status === 'success')
        .reduce((a, t) => a + t.speed, 0) / cdnTests.filter(t => t.status === 'success').length,
      successRate: (cdnTests.filter(t => t.status === 'success').length / cdnTests.length) * 100
    };
  }

  // 9. GAMING LATENCY - Specialized for gamers
  async measureGamingLatency() {
    console.log('🎮 Measuring gaming latency...');
    const sampleCount = this.config.gamingTests?.sampleCount || 100;
    const gameServers = [
      'https://www.google.com/generate_204',
      'https://www.cloudflare.com/cdn-cgi/trace'
    ];
    
    const results = [];
    
    // Burst test - rapid fire requests
    if (this.config.gamingTests?.burstTests) {
      const burstResults = [];
      for (let i = 0; i < 20; i++) {
        const start = performance.now();
        try {
          await fetch(gameServers[0], { 
            method: 'HEAD', 
            cache: 'no-cache',
            signal: AbortSignal.timeout(1000)
          });
          burstResults.push(performance.now() - start);
        } catch (error) {
          burstResults.push(1000);
        }
      }
      results.push(...burstResults);
    }
    
    // Regular sampling
    for (let i = 0; i < sampleCount; i++) {
      const server = gameServers[i % gameServers.length];
      const start = performance.now();
      try {
        await fetch(server, { 
          method: 'HEAD', 
          cache: 'no-cache',
          signal: AbortSignal.timeout(500)
        });
        results.push(performance.now() - start);
      } catch (error) {
        // Skip failed attempts
      }
      
      // Simulate game tick rate (60 FPS = 16.67ms)
      await new Promise(resolve => setTimeout(resolve, 16));
    }
    
    this.metrics.gamingLatency = {
      average: results.reduce((a, b) => a + b, 0) / results.length,
      p99: this.calculatePercentile(results, 99),
      p95: this.calculatePercentile(results, 95),
      p50: this.calculatePercentile(results, 50),
      consistency: this.calculateConsistency(results),
      gamingGrade: this.getGamingGrade(results),
      samples: results.length
    };
  }

  // 10. STREAMING QUALITY
  async measureStreamingQuality() {
    console.log('📺 Measuring streaming quality...');
    
    const streamingMetrics = {
      '4K': { required: 25, recommended: 35 },
      '1080p': { required: 5, recommended: 10 },
      '720p': { required: 2.5, recommended: 5 },
      '480p': { required: 1.1, recommended: 2 }
    };
    
    const downloadSpeed = this.metrics.downloadSpeed?.overall?.average || 0;
    const latency = this.metrics.latency?.overall?.average || 0;
    const packetLoss = this.metrics.packetLoss?.percentage || 0;
    
    const capabilities = {};
    
    for (const [quality, speeds] of Object.entries(streamingMetrics)) {
      capabilities[quality] = {
        supported: downloadSpeed >= speeds.required,
        optimal: downloadSpeed >= speeds.recommended && latency < 50 && packetLoss < 0.5,
        bufferFree: downloadSpeed >= speeds.recommended * 1.5
      };
    }
    
    this.metrics.streamingQuality = {
      capabilities,
      maxQuality: Object.entries(capabilities)
        .reverse()
        .find(([_, cap]) => cap.optimal)?.[0] || 'None',
      bufferRisk: packetLoss > 1 || latency > 100 ? 'High' :
                  packetLoss > 0.5 || latency > 50 ? 'Medium' : 'Low'
    };
  }

  // 11. VoIP QUALITY
  async measureVoIPQuality() {
    console.log('📞 Measuring VoIP quality...');
    
    const latency = this.metrics.latency?.overall?.average || 0;
    const jitter = this.metrics.jitter?.average || 0;
    const packetLoss = this.metrics.packetLoss?.percentage || 0;
    
    // MOS (Mean Opinion Score) calculation
    let mos = 5;
    
    // Deduct for latency
    if (latency > 150) mos -= 1;
    else if (latency > 100) mos -= 0.5;
    else if (latency > 50) mos -= 0.2;
    
    // Deduct for jitter
    if (jitter > 30) mos -= 1;
    else if (jitter > 20) mos -= 0.5;
    else if (jitter > 10) mos -= 0.2;
    
    // Deduct for packet loss
    if (packetLoss > 1) mos -= 1.5;
    else if (packetLoss > 0.5) mos -= 0.8;
    else if (packetLoss > 0.1) mos -= 0.3;
    
    mos = Math.max(1, Math.min(5, mos));
    
    this.metrics.voipQuality = {
      mos: Math.round(mos * 10) / 10,
      quality: mos >= 4 ? 'Excellent' :
               mos >= 3.5 ? 'Good' :
               mos >= 3 ? 'Fair' :
               mos >= 2 ? 'Poor' : 'Unacceptable',
      metrics: {
        latency,
        jitter,
        packetLoss
      }
    };
  }

  // 12. IPv4 vs IPv6 COMPARISON
  async measureIPv4vsIPv6() {
    console.log('🌐 Comparing IPv4 vs IPv6...');
    
    try {
      // Test IPv4
      const ipv4Start = performance.now();
      const ipv4Response = await fetch('https://ipv4.google.com/generate_204', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      const ipv4Time = performance.now() - ipv4Start;
      
      // Test IPv6
      const ipv6Start = performance.now();
      const ipv6Response = await fetch('https://ipv6.google.com/generate_204', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      const ipv6Time = performance.now() - ipv6Start;
      
      this.metrics.ipComparison = {
        ipv4: {
          latency: Math.round(ipv4Time),
          available: ipv4Response.ok
        },
        ipv6: {
          latency: Math.round(ipv6Time),
          available: ipv6Response.ok
        },
        difference: Math.round(Math.abs(ipv4Time - ipv6Time)),
        faster: ipv4Time < ipv6Time ? 'IPv4' : 'IPv6',
        ipv6Advantage: Math.round(((ipv4Time - ipv6Time) / ipv4Time) * 100)
      };
    } catch (error) {
      this.metrics.ipComparison = { 
        error: 'IPv6 not supported or available',
        ipv4Only: true 
      };
    }
  }

  // 13. ROUTING EFFICIENCY
  async measureRoutingEfficiency() {
    console.log('🗺️ Measuring routing efficiency...');
    
    const targets = [
      { name: 'Local', url: 'https://www.google.com/generate_204', expected: 50 },
      { name: 'Regional', url: 'https://www.microsoft.com/favicon.ico', expected: 100 },
      { name: 'Global', url: 'https://www.amazon.co.jp/favicon.ico', expected: 200 }
    ];
    
    const results = [];
    
    for (const target of targets) {
      const samples = [];
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        try {
          await fetch(target.url, {
            method: 'HEAD',
            cache: 'no-cache',
            signal: AbortSignal.timeout(5000)
          });
          samples.push(performance.now() - start);
        } catch (error) {
          samples.push(5000);
        }
      }
      
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      results.push({
        name: target.name,
        latency: avg,
        expected: target.expected,
        efficiency: Math.max(0, 100 - ((avg - target.expected) / target.expected * 100))
      });
    }
    
    this.metrics.routingEfficiency = {
      results,
      overall: results.reduce((a, r) => a + r.efficiency, 0) / results.length
    };
  }

  // HELPER METHODS
  parseFileSize(size) {
    const units = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const match = size.match(/(\d+)(KB|MB|GB)/i);
    if (match) {
      return parseInt(match[1]) * units[match[2].toUpperCase()];
    }
    return 1024 * 1024; // Default 1MB
  }

  getFileSizeUrl(bytes) {
    const mb = Math.round(bytes / (1024 * 1024));
    if (mb <= 1) return '1MB.zip';
    if (mb <= 5) return '5MB.zip';
    if (mb <= 10) return '10MB.zip';
    if (mb <= 25) return '20MB.zip';
    if (mb <= 50) return '50MB.zip';
    return '100MB.zip';
  }

  getActiveServers() {
    const servers = [];
    if (this.config.downloadTests?.servers) {
      for (const server of this.config.downloadTests.servers) {
        if (this.testServers[server]) {
          servers.push(...this.testServers[server]);
        }
      }
    }
    
    // Fallback to default servers
    if (servers.length === 0) {
      servers.push(
        'https://speed.cloudflare.com/__down?bytes=',
        'https://download.thinkbroadband.com/',
        'https://proof.ovh.net/files/'
      );
    }
    
    return servers;
  }

  getLatencyTargets() {
    const targets = [];
    const configured = this.config.latencyTests?.targets || ['google', 'cloudflare'];
    
    const targetMap = {
      google: { name: 'Google', url: 'https://www.google.com/generate_204' },
      cloudflare: { name: 'Cloudflare', url: 'https://www.cloudflare.com/cdn-cgi/trace' },
      microsoft: { name: 'Microsoft', url: 'https://www.microsoft.com/favicon.ico' },
      amazon: { name: 'Amazon', url: 'https://www.amazon.com/favicon.ico' }
    };
    
    for (const target of configured) {
      if (targetMap[target]) {
        targets.push(targetMap[target]);
      }
    }
    
    return targets.length > 0 ? targets : [targetMap.google, targetMap.cloudflare];
  }

  calculateConsistency(values) {
    if (values.length < 2) return 100;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    const cv = (Math.sqrt(variance) / avg) * 100;
    return Math.max(0, 100 - cv);
  }

  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  calculateVariation(values) {
    if (values.length < 2) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // SCORING SYSTEM
  calculateEpicScore() {
    let score = 100;
    const weights = {
      download: 30,
      upload: 15,
      latency: 20,
      packetLoss: 15,
      jitter: 10,
      stability: 10
    };
    
    // Download speed impact
    const dlSpeed = this.metrics.downloadSpeed?.overall?.average || 0;
    if (dlSpeed < 5) score -= weights.download * 0.8;
    else if (dlSpeed < 25) score -= weights.download * 0.4;
    else if (dlSpeed < 100) score -= weights.download * 0.2;
    else if (dlSpeed >= 500) score += weights.download * 0.1; // Bonus for gigabit
    
    // Upload speed impact
    const ulSpeed = this.metrics.uploadSpeed?.overall?.average || 0;
    if (ulSpeed < 1) score -= weights.upload * 0.8;
    else if (ulSpeed < 10) score -= weights.upload * 0.4;
    else if (ulSpeed < 50) score -= weights.upload * 0.2;
    
    // Latency impact
    const latency = this.metrics.latency?.overall?.average || 100;
    if (latency > 100) score -= weights.latency * 0.8;
    else if (latency > 50) score -= weights.latency * 0.4;
    else if (latency > 20) score -= weights.latency * 0.2;
    else if (latency < 10) score += weights.latency * 0.1; // Bonus for ultra-low
    
    // Packet loss impact
    const packetLoss = this.metrics.packetLoss?.percentage || 0;
    if (packetLoss > 1) score -= weights.packetLoss * 0.8;
    else if (packetLoss > 0.5) score -= weights.packetLoss * 0.4;
    else if (packetLoss > 0.1) score -= weights.packetLoss * 0.2;
    
    // Jitter impact
    const jitter = this.metrics.jitter?.average || 0;
    if (jitter > 50) score -= weights.jitter * 0.8;
    else if (jitter > 20) score -= weights.jitter * 0.4;
    else if (jitter > 10) score -= weights.jitter * 0.2;
    
    // Stability impact
    const stability = this.metrics.connectionStability?.stabilityScore || 100;
    if (stability < 95) score -= weights.stability * 0.5;
    else if (stability < 99) score -= weights.stability * 0.2;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  getNetworkGrade() {
    const score = this.metrics.overallScore || 0;
    
    const grades = [
      { min: 95, grade: 'A+', description: 'World-Class Network Performance', color: '#00ff88' },
      { min: 90, grade: 'A', description: 'Exceptional Network Performance', color: '#32cd32' },
      { min: 85, grade: 'A-', description: 'Excellent Network Performance', color: '#50c878' },
      { min: 80, grade: 'B+', description: 'Very Good Network Performance', color: '#4a90e2' },
      { min: 75, grade: 'B', description: 'Good Network Performance', color: '#1e90ff' },
      { min: 70, grade: 'B-', description: 'Above Average Performance', color: '#87ceeb' },
      { min: 65, grade: 'C+', description: 'Average Network Performance', color: '#ffd700' },
      { min: 60, grade: 'C', description: 'Acceptable Network Performance', color: '#ffa500' },
      { min: 55, grade: 'C-', description: 'Below Average Performance', color: '#ff8c00' },
      { min: 50, grade: 'D+', description: 'Poor Network Performance', color: '#ff6347' },
      { min: 45, grade: 'D', description: 'Very Poor Performance', color: '#ff4500' },
      { min: 0, grade: 'F', description: 'Failing Network Performance', color: '#ff0000' }
    ];
    
    const gradeInfo = grades.find(g => score >= g.min);
    return gradeInfo || grades[grades.length - 1];
  }

  assessCapabilities() {
    const dlSpeed = this.metrics.downloadSpeed?.overall?.average || 0;
    const latency = this.metrics.latency?.overall?.average || 100;
    const packetLoss = this.metrics.packetLoss?.percentage || 0;
    const jitter = this.metrics.jitter?.average || 0;
    
    return {
      streaming4K: dlSpeed >= 25 && latency < 50 && packetLoss < 0.5,
      streaming1080p: dlSpeed >= 5 && latency < 100 && packetLoss < 1,
      gaming: latency < 50 && jitter < 20 && packetLoss < 0.5,
      videoConferencing: dlSpeed >= 3 && latency < 150 && jitter < 30,
      remoteWork: dlSpeed >= 10 && latency < 100 && packetLoss < 1,
      basicBrowsing: dlSpeed >= 1 && latency < 200
    };
  }

  generateInsights() {
    const insights = [];
    const dlSpeed = this.metrics.downloadSpeed?.overall?.average || 0;
    const ulSpeed = this.metrics.uploadSpeed?.overall?.average || 0;
    const latency = this.metrics.latency?.overall?.average || 100;
    const packetLoss = this.metrics.packetLoss?.percentage || 0;
    const jitter = this.metrics.jitter?.average || 0;
    
    // Speed insights
    if (dlSpeed >= 100) {
      insights.push('🚀 Your download speed is excellent for any online activity!');
    } else if (dlSpeed < 10) {
      insights.push('⚠️ Your download speed may struggle with HD streaming and large downloads.');
    }
    
    if (ulSpeed >= 50) {
      insights.push('📤 Outstanding upload speed - perfect for content creators!');
    } else if (ulSpeed < 5) {
      insights.push('📤 Upload speed may limit video calls and cloud backups.');
    }
    
    // Latency insights
    if (latency < 20) {
      insights.push('⚡ Ultra-low latency - ideal for competitive gaming!');
    } else if (latency > 100) {
      insights.push('⏱️ High latency detected - may affect real-time applications.');
    }
    
    // Quality insights
    if (packetLoss > 0) {
      insights.push(`📦 ${packetLoss}% packet loss detected - may cause connection issues.`);
    }
    
    if (jitter > 30) {
      insights.push('📊 High jitter may affect voice/video quality.');
    }
    
    // Capability insights
    const capabilities = this.assessCapabilities();
    if (capabilities.gaming && capabilities.streaming4K) {
      insights.push('🎮 Your network is optimized for both gaming and 4K streaming!');
    }
    
    return insights;
  }

  getJitterQuality(jitter) {
    if (jitter < 5) return 'Excellent';
    if (jitter < 15) return 'Good';
    if (jitter < 30) return 'Fair';
    if (jitter < 50) return 'Poor';
    return 'Very Poor';
  }

  getPacketLossQuality(loss) {
    if (loss === 0) return 'Perfect';
    if (loss < 0.1) return 'Excellent';
    if (loss < 0.5) return 'Good';
    if (loss < 1) return 'Fair';
    if (loss < 2) return 'Poor';
    return 'Critical';
  }

  getStabilityGrade(ratio) {
    if (ratio >= 0.99) return 'A+';
    if (ratio >= 0.95) return 'A';
    if (ratio >= 0.90) return 'B';
    if (ratio >= 0.85) return 'C';
    if (ratio >= 0.80) return 'D';
    return 'F';
  }

  getGamingGrade(latencies) {
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p99 = this.calculatePercentile(latencies, 99);
    
    if (avg < 10 && p99 < 20) return 'Professional Esports';
    if (avg < 20 && p99 < 40) return 'Competitive Gaming';
    if (avg < 30 && p99 < 60) return 'Excellent Gaming';
    if (avg < 50 && p99 < 100) return 'Good Gaming';
    if (avg < 75 && p99 < 150) return 'Casual Gaming';
    return 'Gaming Issues';
  }

  // Abort ongoing tests
  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.isRunning = false;
    }
  }
}