// ⚡ LATENCY TESTS MODULE - Ping, Jitter & Network Response Testing
// Professional latency measurement with multiple targets and statistical analysis

export class LatencyTests {
  constructor() {
    this.results = {};
    this.isRunning = false;
    this.progressCallback = null;
    this.abortController = null;
    
    this.config = {
      enabled: true,
      sampleCount: 20,
      targets: ['google', 'cloudflare', 'microsoft'],
      interval: 100,
      timeout: 5000
    };
  }

  // Set progress callback for real-time updates
  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  // Update configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  // Send progress update
  updateProgress(type, value, phase = null) {
    if (this.progressCallback) {
      this.progressCallback({
        type,
        value,
        phase: phase || 'latency',
        timestamp: Date.now()
      });
    }
  }

  // Run complete latency analysis
  async runLatencyAnalysis() {
    console.log('⚡ Starting comprehensive latency analysis...');
    this.isRunning = true;
    this.abortController = new AbortController();
    this.results = {};

    try {
      const targets = this.getLatencyTargets();
      const sampleCount = this.config.sampleCount;
      const results = {
        targets: {},
        overall: { samples: [], average: 0, min: 0, max: 0, median: 0 },
        jitter: { samples: [], average: 0, max: 0 },
        packetLoss: { sent: 0, received: 0, percentage: 0 }
      };

      let totalSamples = 0;
      const totalTests = sampleCount;

      // Perform latency tests
      for (let i = 0; i < sampleCount; i++) {
        if (this.abortController?.signal.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        const target = targets[i % targets.length];
        const latency = await this.measureSingleLatency(target);

        if (latency !== null) {
          // Initialize target results if needed
          if (!results.targets[target.name]) {
            results.targets[target.name] = { samples: [], average: 0, min: 0, max: 0 };
          }

          // Store results
          results.targets[target.name].samples.push(latency);
          results.overall.samples.push(latency);
          results.packetLoss.received++;

          console.log(`⚡ Latency to ${target.name}: ${Math.round(latency)}ms`);
        }

        results.packetLoss.sent++;
        totalSamples++;

        // Update progress
        const progress = Math.round((totalSamples / totalTests) * 100);
        this.updateProgress('latency', progress, `Testing latency (${totalSamples}/${totalTests})`);

        // Wait before next test
        if (i < sampleCount - 1) {
          await new Promise(resolve => setTimeout(resolve, this.config.interval));
        }
      }

      // Calculate statistics
      this.calculateLatencyStatistics(results);
      this.calculateJitter(results);
      this.calculatePacketLoss(results);

      this.results = results;
      console.log('✅ Latency analysis completed successfully');
      return results;

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Latency analysis failed:', error);
        throw error;
      }
    } finally {
      this.isRunning = false;
      this.abortController = null;
    }
  }

  // Measure latency to a single target
  async measureSingleLatency(target) {
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(target.url, {
        method: 'HEAD',
        cache: 'no-cache',
        mode: 'no-cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latency = performance.now() - startTime;

      return latency;

    } catch (error) {
      // For CORS errors, we still get timing info
      if (error.name !== 'AbortError') {
        const latency = performance.now() - startTime;
        if (latency < this.config.timeout) {
          return latency;
        }
      }
      
      console.warn(`Latency test failed for ${target.name}:`, error.message);
      return null;
    }
  }

  // Get latency test targets
  getLatencyTargets() {
    const targets = [
      { name: 'Google', url: 'https://www.google.com/favicon.ico' },
      { name: 'Cloudflare', url: 'https://www.cloudflare.com/favicon.ico' },
      { name: 'Microsoft', url: 'https://www.microsoft.com/favicon.ico' },
      { name: 'Amazon', url: 'https://www.amazon.com/favicon.ico' },
      { name: 'GitHub', url: 'https://github.com/favicon.ico' }
    ];

    return targets.filter(target => 
      this.config.targets.includes(target.name.toLowerCase())
    );
  }

  // Calculate comprehensive latency statistics
  calculateLatencyStatistics(results) {
    // Calculate overall statistics
    if (results.overall.samples.length > 0) {
      const samples = results.overall.samples.sort((a, b) => a - b);
      
      results.overall.average = samples.reduce((a, b) => a + b, 0) / samples.length;
      results.overall.min = Math.min(...samples);
      results.overall.max = Math.max(...samples);
      results.overall.median = this.calculateMedian(samples);
      results.overall.p95 = this.calculatePercentile(samples, 95);
      results.overall.p99 = this.calculatePercentile(samples, 99);
      results.overall.standardDeviation = this.calculateStandardDeviation(samples);
    }

    // Calculate per-target statistics
    for (const targetName in results.targets) {
      const target = results.targets[targetName];
      if (target.samples.length > 0) {
        const samples = target.samples.sort((a, b) => a - b);
        
        target.average = samples.reduce((a, b) => a + b, 0) / samples.length;
        target.min = Math.min(...samples);
        target.max = Math.max(...samples);
        target.median = this.calculateMedian(samples);
        target.standardDeviation = this.calculateStandardDeviation(samples);
      }
    }
  }

  // Calculate jitter (latency variation)
  calculateJitter(results) {
    if (results.overall.samples.length < 2) return;

    const samples = results.overall.samples;
    const jitterSamples = [];

    // Calculate difference between consecutive samples
    for (let i = 1; i < samples.length; i++) {
      const jitter = Math.abs(samples[i] - samples[i - 1]);
      jitterSamples.push(jitter);
    }

    if (jitterSamples.length > 0) {
      results.jitter.samples = jitterSamples;
      results.jitter.average = jitterSamples.reduce((a, b) => a + b, 0) / jitterSamples.length;
      results.jitter.max = Math.max(...jitterSamples);
      results.jitter.min = Math.min(...jitterSamples);
      results.jitter.standardDeviation = this.calculateStandardDeviation(jitterSamples);
    }
  }

  // Calculate packet loss percentage
  calculatePacketLoss(results) {
    if (results.packetLoss.sent > 0) {
      const lost = results.packetLoss.sent - results.packetLoss.received;
      results.packetLoss.lost = lost;
      results.packetLoss.percentage = (lost / results.packetLoss.sent) * 100;
    }
  }

  // Calculate median value
  calculateMedian(sortedArray) {
    const mid = Math.floor(sortedArray.length / 2);
    
    if (sortedArray.length % 2 === 0) {
      return (sortedArray[mid - 1] + sortedArray[mid]) / 2;
    } else {
      return sortedArray[mid];
    }
  }

  // Calculate percentile
  calculatePercentile(sortedArray, percentile) {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
  }

  // Calculate standard deviation
  calculateStandardDeviation(samples) {
    if (samples.length < 2) return 0;
    
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const squaredDifferences = samples.map(sample => Math.pow(sample - mean, 2));
    const variance = squaredDifferences.reduce((a, b) => a + b, 0) / samples.length;
    
    return Math.sqrt(variance);
  }

  // Advanced latency analysis for gaming and real-time applications
  async runGamingLatencyTest() {
    console.log('🎮 Running gaming-optimized latency test...');
    
    const results = {
      burstTest: await this.runBurstLatencyTest(),
      consistencyTest: await this.runConsistencyTest(),
      loadTest: await this.runLoadLatencyTest()
    };

    return results;
  }

  // Burst latency test (rapid-fire requests)
  async runBurstLatencyTest() {
    const burstSize = 10;
    const target = this.getLatencyTargets()[0];
    const results = [];

    const promises = Array(burstSize).fill().map(async () => {
      return await this.measureSingleLatency(target);
    });

    const latencies = await Promise.all(promises);
    const validLatencies = latencies.filter(l => l !== null);

    if (validLatencies.length > 0) {
      return {
        samples: validLatencies,
        average: validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length,
        min: Math.min(...validLatencies),
        max: Math.max(...validLatencies),
        consistency: this.calculateConsistencyScore(validLatencies)
      };
    }

    return null;
  }

  // Consistency test (measures stability over time)
  async runConsistencyTest() {
    const samples = 30;
    const interval = 200;
    const target = this.getLatencyTargets()[0];
    const results = [];

    for (let i = 0; i < samples; i++) {
      const latency = await this.measureSingleLatency(target);
      if (latency !== null) {
        results.push(latency);
      }
      
      if (i < samples - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    if (results.length > 0) {
      return {
        samples: results,
        average: results.reduce((a, b) => a + b, 0) / results.length,
        standardDeviation: this.calculateStandardDeviation(results),
        consistencyScore: this.calculateConsistencyScore(results)
      };
    }

    return null;
  }

  // Load latency test (latency under simultaneous requests)
  async runLoadLatencyTest() {
    const concurrentRequests = 5;
    const iterations = 3;
    const target = this.getLatencyTargets()[0];
    const results = [];

    for (let i = 0; i < iterations; i++) {
      const promises = Array(concurrentRequests).fill().map(async () => {
        return await this.measureSingleLatency(target);
      });

      const latencies = await Promise.all(promises);
      const validLatencies = latencies.filter(l => l !== null);
      
      if (validLatencies.length > 0) {
        results.push(...validLatencies);
      }

      // Brief pause between iterations
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (results.length > 0) {
      return {
        samples: results,
        average: results.reduce((a, b) => a + b, 0) / results.length,
        degradation: this.calculateLoadDegradation(results)
      };
    }

    return null;
  }

  // Calculate consistency score (0-100, higher is better)
  calculateConsistencyScore(samples) {
    if (samples.length < 2) return 100;
    
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const stdDev = this.calculateStandardDeviation(samples);
    
    // Lower coefficient of variation = higher consistency
    const coefficientOfVariation = stdDev / mean;
    const consistencyScore = Math.max(0, 100 - (coefficientOfVariation * 100));
    
    return Math.round(consistencyScore);
  }

  // Calculate load degradation percentage
  calculateLoadDegradation(samples) {
    if (samples.length < 2) return 0;
    
    const baseline = Math.min(...samples);
    const worst = Math.max(...samples);
    
    return ((worst - baseline) / baseline) * 100;
  }

  // Get current results
  getResults() {
    return this.results;
  }

  // Stop all running tests
  stop() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.isRunning = false;
  }

  // Check if tests are currently running
  isTestRunning() {
    return this.isRunning;
  }
}