// 🚀 SPEED TESTS MODULE - Download & Upload Speed Testing
// Professional speed testing with multiple servers and real-time progress

export class SpeedTests {
  constructor() {
    this.results = {};
    this.isRunning = false;
    this.progressCallback = null;
    this.speedCallback = null;
    this.abortController = null;
    
    this.config = {
      download: {
        enabled: true,
        fileSizes: ['1MB', '5MB', '10MB'],
        iterations: 3,
        parallelConnections: 4,
        timeout: 30000,
        servers: ['cloudflare', 'google', 'amazon']
      },
      upload: {
        enabled: true,
        fileSizes: ['1MB', '5MB'],
        iterations: 2,
        parallelConnections: 2,
        timeout: 30000
      }
    };
  }

  // Set progress callback for real-time updates
  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  // Set speed callback for speedometer updates
  setSpeedCallback(callback) {
    this.speedCallback = callback;
  }

  // Update configuration
  updateConfig(downloadConfig, uploadConfig) {
    this.config.download = { ...this.config.download, ...downloadConfig };
    this.config.upload = { ...this.config.upload, ...uploadConfig };
  }

  // Send progress update
  updateProgress(type, value, phase = null) {
    if (this.progressCallback) {
      this.progressCallback({
        type,
        value,
        phase: phase || 'speed',
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

  // Run complete speed analysis
  async runSpeedAnalysis() {
    console.log('🚀 Starting comprehensive speed analysis...');
    this.isRunning = true;
    this.abortController = new AbortController();
    this.results = {};

    try {
      let completedTests = 0;
      const totalTests = (this.config.download.enabled ? 1 : 0) + (this.config.upload.enabled ? 1 : 0);

      // Download speed tests
      if (this.config.download.enabled) {
        this.updateProgress('download', 0, 'Testing download speed...');
        this.results.download = await this.measureDownloadSpeed();
        completedTests++;
        this.updateProgress('download', Math.round((completedTests / totalTests) * 100));
      }

      // Upload speed tests
      if (this.config.upload.enabled) {
        this.updateProgress('upload', 0, 'Testing upload speed...');
        this.results.upload = await this.measureUploadSpeed();
        completedTests++;
        this.updateProgress('upload', 100);
      }

      console.log('✅ Speed analysis completed successfully');
      return this.results;

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Speed analysis failed:', error);
        throw error;
      }
    } finally {
      this.isRunning = false;
      this.abortController = null;
    }
  }

  // Measure download speed with multiple servers and file sizes
  async measureDownloadSpeed() {
    const config = this.config.download;
    const servers = this.getDownloadServers();
    const results = {
      servers: {},
      fileSizes: {},
      overall: { speeds: [], average: 0, peak: 0, min: 0 }
    };

    let testCount = 0;
    const totalTests = servers.length * config.fileSizes.length * config.iterations;

    for (const server of servers) {
      results.servers[server.name] = { speeds: [], average: 0 };

      for (const fileSize of config.fileSizes) {
        if (!results.fileSizes[fileSize]) {
          results.fileSizes[fileSize] = { speeds: [], average: 0 };
        }

        for (let iteration = 0; iteration < config.iterations; iteration++) {
          if (this.abortController?.signal.aborted) throw new DOMException('Aborted', 'AbortError');

          const url = this.buildDownloadUrl(server, fileSize);
          const speed = await this.performDownloadTest(url, fileSize);

          if (speed > 0) {
            // Update results
            results.servers[server.name].speeds.push(speed);
            results.fileSizes[fileSize].speeds.push(speed);
            results.overall.speeds.push(speed);

            // Real-time speed update
            this.updateSpeed(speed, 'download');
          }

          testCount++;
          this.updateProgress('download', Math.round((testCount / totalTests) * 100));

          // Brief pause between tests
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // Calculate averages
    this.calculateAverages(results);

    return results;
  }

  // Perform individual download test
  async performDownloadTest(url, fileSize) {
    const startTime = performance.now();
    const expectedBytes = this.parseFileSize(fileSize);

    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(this.config.download.timeout)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Stream the response and measure progress
      const reader = response.body?.getReader();
      if (!reader) throw new Error('ReadableStream not supported');

      let receivedBytes = 0;
      let lastProgressUpdate = startTime;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        receivedBytes += value.length;

        // Update speed in real-time (every 250ms)
        const now = performance.now();
        if (now - lastProgressUpdate > 250) {
          const currentSpeed = this.calculateCurrentSpeed(receivedBytes, now - startTime);
          this.updateSpeed(currentSpeed, 'download');
          lastProgressUpdate = now;
        }
      }

      const duration = performance.now() - startTime;
      const speed = this.calculateSpeed(receivedBytes, duration);

      console.log(`📥 Download test: ${fileSize} in ${Math.round(duration)}ms = ${speed.toFixed(1)} Mbps`);
      return speed;

    } catch (error) {
      console.warn(`Download test failed for ${fileSize}:`, error.message);
      return 0;
    }
  }

  // Measure upload speed
  async measureUploadSpeed() {
    const config = this.config.upload;
    const results = {
      fileSizes: {},
      overall: { speeds: [], average: 0, peak: 0, min: 0 }
    };

    let testCount = 0;
    const totalTests = config.fileSizes.length * config.iterations;

    for (const fileSize of config.fileSizes) {
      results.fileSizes[fileSize] = { speeds: [], average: 0 };

      for (let iteration = 0; iteration < config.iterations; iteration++) {
        if (this.abortController?.signal.aborted) throw new DOMException('Aborted', 'AbortError');

        const speed = await this.performUploadTest(fileSize);

        if (speed > 0) {
          results.fileSizes[fileSize].speeds.push(speed);
          results.overall.speeds.push(speed);

          // Real-time speed update
          this.updateSpeed(speed, 'upload');
        }

        testCount++;
        this.updateProgress('upload', Math.round((testCount / totalTests) * 100));

        // Brief pause between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Calculate averages
    this.calculateAverages(results);

    return results;
  }

  // Perform individual upload test
  async performUploadTest(fileSize) {
    const data = this.generateTestData(fileSize);
    const startTime = performance.now();

    try {
      const response = await fetch('https://httpbin.org/post', {
        method: 'POST',
        body: data,
        cache: 'no-cache',
        signal: AbortSignal.timeout(this.config.upload.timeout)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const duration = performance.now() - startTime;
      const speed = this.calculateSpeed(data.size || data.length, duration);

      console.log(`📤 Upload test: ${fileSize} in ${Math.round(duration)}ms = ${speed.toFixed(1)} Mbps`);
      return speed;

    } catch (error) {
      console.warn(`Upload test failed for ${fileSize}:`, error.message);
      return 0;
    }
  }

  // Get download server configurations
  getDownloadServers() {
    return [
      {
        name: 'Cloudflare',
        baseUrl: 'https://speed.cloudflare.com/__down'
      },
      {
        name: 'Google',
        baseUrl: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'
      },
      {
        name: 'GitHub',
        baseUrl: 'https://github.com'
      }
    ];
  }

  // Build download URL for server and file size
  buildDownloadUrl(server, fileSize) {
    const bytes = this.parseFileSize(fileSize);
    
    switch (server.name) {
      case 'Cloudflare':
        return `${server.baseUrl}?bytes=${bytes}`;
      case 'Google':
        return `${server.baseUrl}?cachebust=${Date.now()}`;
      default:
        return `${server.baseUrl}/favicon.ico?cachebust=${Date.now()}`;
    }
  }

  // Generate test data for uploads
  generateTestData(fileSize) {
    const bytes = this.parseFileSize(fileSize);
    const chunk = 'a'.repeat(1024); // 1KB chunk
    const chunks = Math.ceil(bytes / 1024);
    
    return new Blob([chunk.repeat(chunks)], { type: 'text/plain' });
  }

  // Parse file size string to bytes
  parseFileSize(sizeStr) {
    const units = { 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([A-Z]{2})$/i);
    
    if (!match) return 1024 * 1024; // Default 1MB
    
    const size = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    
    return Math.round(size * (units[unit] || 1024 * 1024));
  }

  // Calculate speed in Mbps
  calculateSpeed(bytes, milliseconds) {
    const megabits = (bytes * 8) / (1024 * 1024);
    const seconds = milliseconds / 1000;
    return seconds > 0 ? megabits / seconds : 0;
  }

  // Calculate current speed during test
  calculateCurrentSpeed(bytesReceived, milliseconds) {
    return this.calculateSpeed(bytesReceived, milliseconds);
  }

  // Calculate averages for all result categories
  calculateAverages(results) {
    // Calculate server averages
    if (results.servers) {
      for (const serverName in results.servers) {
        const server = results.servers[serverName];
        if (server.speeds.length > 0) {
          server.average = server.speeds.reduce((a, b) => a + b, 0) / server.speeds.length;
        }
      }
    }

    // Calculate file size averages
    for (const fileSize in results.fileSizes) {
      const fileSizeData = results.fileSizes[fileSize];
      if (fileSizeData.speeds.length > 0) {
        fileSizeData.average = fileSizeData.speeds.reduce((a, b) => a + b, 0) / fileSizeData.speeds.length;
      }
    }

    // Calculate overall averages
    if (results.overall.speeds.length > 0) {
      const speeds = results.overall.speeds;
      results.overall.average = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      results.overall.peak = Math.max(...speeds);
      results.overall.min = Math.min(...speeds);
    }
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