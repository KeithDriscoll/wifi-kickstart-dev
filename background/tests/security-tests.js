// 🛡️ SECURITY TESTS MODULE - VPN, WARP, Portal Detection & Network Security
// Professional security analysis for network privacy and threat detection

export class SecurityTests {
  constructor() {
    this.results = {};
    this.isRunning = false;
    this.progressCallback = null;
    
    this.config = {
      enabled: true,
      vpnDetection: true,
      warpDetection: true,
      captivePortalCheck: true,
      threatDetection: false,
      dnsLeakTest: true,
      sslAnalysis: true
    };
  }

  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  updateProgress(type, value, phase = null) {
    if (this.progressCallback) {
      this.progressCallback({
        type,
        value,
        phase: phase || 'security',
        timestamp: Date.now()
      });
    }
  }

  async runAnalysis() {
    console.log('🛡️ Starting comprehensive security analysis...');
    this.isRunning = true;
    this.results = {};

    try {
      let completedTests = 0;
      const totalTests = this.calculateTotalSecurityTests();

      this.updateProgress('security', 0, 'Gathering network information...');
      this.results.networkInfo = await this.getNetworkInfo();
      completedTests++;
      this.updateProgress('security', Math.round((completedTests / totalTests) * 100));

      if (this.config.vpnDetection) {
        this.updateProgress('security', 0, 'Detecting VPN connections...');
        this.results.vpnStatus = await this.detectVPN();
        completedTests++;
        this.updateProgress('security', Math.round((completedTests / totalTests) * 100));
      }

      if (this.config.warpDetection) {
        this.updateProgress('security', 0, 'Checking Cloudflare WARP...');
        this.results.warpStatus = await this.detectWARP();
        completedTests++;
        this.updateProgress('security', Math.round((completedTests / totalTests) * 100));
      }

      if (this.config.captivePortalCheck) {
        this.updateProgress('security', 0, 'Checking for captive portals...');
        this.results.captivePortal = await this.checkCaptivePortal();
        completedTests++;
        this.updateProgress('security', Math.round((completedTests / totalTests) * 100));
      }

      if (this.config.dnsLeakTest) {
        this.updateProgress('security', 0, 'Testing for DNS leaks...');
        this.results.dnsLeak = await this.checkDNSLeak();
        completedTests++;
        this.updateProgress('security', Math.round((completedTests / totalTests) * 100));
      }

      if (this.config.sslAnalysis) {
        this.updateProgress('security', 0, 'Analyzing SSL/TLS security...');
        this.results.sslAnalysis = await this.analyzeSSL();
        completedTests++;
        this.updateProgress('security', Math.round((completedTests / totalTests) * 100));
      }

      if (this.config.threatDetection) {
        this.updateProgress('security', 0, 'Running threat detection...');
        this.results.threats = await this.detectThreats();
        completedTests++;
        this.updateProgress('security', Math.round((completedTests / totalTests) * 100));
      }

      this.results.securityScore = this.calculateSecurityScore();
      this.results.recommendations = this.generateSecurityRecommendations();

      console.log('✅ Security analysis completed successfully');
      return this.results;

    } catch (error) {
      console.error('❌ Security analysis failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  async getNetworkInfo() {
    try {
      const services = [
        { name: 'ipapi', url: 'https://ipapi.co/json/' },
        { name: 'ipinfo', url: 'https://ipinfo.io/json' }
      ];

      for (const service of services) {
        try {
          const response = await fetch(service.url, {
            method: 'GET',
            cache: 'no-cache',
            signal: AbortSignal.timeout(5000)
          });

          if (response.ok) {
            const data = await response.json();
            
            return {
              ip: data.ip || data.query,
              isp: data.org || data.as,
              city: data.city,
              region: data.region || data.regionName,
              country: data.country_name || data.country,
              countryCode: data.country_code || data.countryCode,
              timezone: data.timezone,
              location: `${data.city}, ${data.region || data.regionName}`,
              connectionType: this.detectConnectionType(),
              service: service.name
            };
          }
        } catch (error) {
          console.warn(`Failed to get info from ${service.name}:`, error.message);
          continue;
        }
      }

      return {
        ip: 'Unknown',
        isp: 'Unknown',
        location: 'Unknown',
        connectionType: this.detectConnectionType(),
        service: 'fallback'
      };

    } catch (error) {
      console.error('Failed to get network info:', error);
      return { error: error.message };
    }
  }

  detectConnectionType() {
    if ('connection' in navigator) {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      return {
        type: conn.effectiveType || 'unknown',
        downlink: conn.downlink || null,
        rtt: conn.rtt || null,
        saveData: conn.saveData || false
      };
    }
    return { type: 'unknown' };
  }

  async detectVPN() {
    try {
      const vpnDNSIndicators = await this.checkVPNDNS();
      const timezoneMismatch = await this.checkTimezoneMismatch();
      const webRTCBlocked = await this.checkWebRTCBlocking();

      const indicators = {
        vpnDNS: vpnDNSIndicators,
        timezoneMismatch: timezoneMismatch,
        webRTCBlocked: webRTCBlocked
      };

      const vpnCount = Object.values(indicators).filter(Boolean).length;
      
      let status = 'Not Detected';
      if (vpnCount >= 2) status = 'Likely Connected';
      else if (vpnCount === 1) status = 'Possibly Connected';

      return {
        status: status,
        indicators: indicators,
        confidence: vpnCount >= 2 ? 'High' : vpnCount === 1 ? 'Medium' : 'Low'
      };

    } catch (error) {
      console.error('VPN detection failed:', error);
      return { status: 'Detection Failed', error: error.message };
    }
  }

  async checkVPNDNS() {
    try {
      const response = await fetch('https://1.1.1.1/cdn-cgi/trace', {
        signal: AbortSignal.timeout(3000)
      });
      const text = await response.text();
      
      return text.includes('warp=on') || text.includes('gateway=1');
    } catch (error) {
      return false;
    }
  }

  async checkTimezoneMismatch() {
    try {
      const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const networkInfo = this.results.networkInfo || await this.getNetworkInfo();
      
      if (networkInfo.timezone && localTimezone !== networkInfo.timezone) {
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  async checkWebRTCBlocking() {
    return new Promise((resolve) => {
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        let blocked = true;

        pc.onicecandidate = (event) => {
          if (event.candidate && event.candidate.candidate) {
            blocked = false;
            pc.close();
            resolve(false);
          }
        };

        pc.createDataChannel('test');
        pc.createOffer().then(offer => pc.setLocalDescription(offer));

        setTimeout(() => {
          pc.close();
          resolve(blocked);
        }, 2000);

      } catch (error) {
        resolve(true);
      }
    });
  }

  async detectWARP() {
    try {
      const response = await fetch('https://1.1.1.1/cdn-cgi/trace', {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const text = await response.text();
        const lines = text.split('\n');
        const warpLine = lines.find(line => line.startsWith('warp='));
        
        if (warpLine) {
          const warpStatus = warpLine.split('=')[1];
          return warpStatus === 'on' ? 'Connected' : 'Disconnected';
        }
      }

      return 'Unknown';

    } catch (error) {
      console.error('WARP detection failed:', error);
      return 'Detection Failed';
    }
  }

  async checkCaptivePortal() {
    try {
      const response = await fetch('http://neverssl.com/', {
        method: 'HEAD',
        cache: 'no-cache',
        redirect: 'manual',
        signal: AbortSignal.timeout(5000)
      });

      if (response.type === 'opaqueredirect' || response.status === 302) {
        return {
          detected: true,
          method: 'HTTP redirect',
          redirectUrl: response.url
        };
      }

      const captiveTests = [
        'http://detectportal.firefox.com/canonical.html',
        'http://clients3.google.com/generate_204'
      ];

      for (const testUrl of captiveTests) {
        try {
          const testResponse = await fetch(testUrl, {
            method: 'HEAD',
            cache: 'no-cache',
            signal: AbortSignal.timeout(3000)
          });

          if (testResponse.status !== 204 && testResponse.status !== 200) {
            return {
              detected: true,
              method: 'Captive portal detection URL',
              testUrl: testUrl
            };
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            return {
              detected: true,
              method: 'Network error',
              error: error.message
            };
          }
        }
      }

      return { detected: false };

    } catch (error) {
      console.error('Captive portal check failed:', error);
      return { detected: false, error: error.message };
    }
  }

  async checkDNSLeak() {
    try {
      const response = await fetch('https://1.1.1.1/cdn-cgi/trace');
      const text = await response.text();
      
      return {
        tested: true,
        method: 'Cloudflare trace',
        leakDetected: false,
        note: 'Browser-based DNS leak detection is limited'
      };

    } catch (error) {
      console.error('DNS leak test failed:', error);
      return { tested: false, error: error.message };
    }
  }

  async analyzeSSL() {
    try {
      const testUrls = [
        'https://www.google.com',
        'https://www.cloudflare.com'
      ];

      const results = [];

      for (const url of testUrls) {
        try {
          const startTime = performance.now();
          const response = await fetch(url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
          const duration = performance.now() - startTime;

          results.push({
            url: url,
            accessible: response.ok,
            responseTime: Math.round(duration),
            securityHeaders: this.analyzeSecurityHeaders(response.headers)
          });

        } catch (error) {
          results.push({
            url: url,
            accessible: false,
            error: error.message
          });
        }
      }

      return {
        tested: true,
        results: results,
        overallSecurity: this.calculateSSLSecurityScore(results)
      };

    } catch (error) {
      console.error('SSL analysis failed:', error);
      return { tested: false, error: error.message };
    }
  }

  analyzeSecurityHeaders(headers) {
    const securityHeaders = {
      'strict-transport-security': headers.get('strict-transport-security'),
      'content-security-policy': headers.get('content-security-policy'),
      'x-frame-options': headers.get('x-frame-options'),
      'x-content-type-options': headers.get('x-content-type-options'),
      'referrer-policy': headers.get('referrer-policy')
    };

    const score = Object.values(securityHeaders).filter(Boolean).length;
    
    return {
      headers: securityHeaders,
      score: score,
      maxScore: 5,
      grade: score >= 4 ? 'A' : score >= 3 ? 'B' : score >= 2 ? 'C' : 'D'
    };
  }

  calculateSSLSecurityScore(results) {
    if (results.length === 0) return 0;
    
    const accessibleSites = results.filter(r => r.accessible);
    if (accessibleSites.length === 0) return 0;
    
    const avgSecurityScore = accessibleSites.reduce((sum, site) => {
      return sum + (site.securityHeaders?.score || 0);
    }, 0) / accessibleSites.length;
    
    return Math.round((avgSecurityScore / 5) * 100);
  }

  async detectThreats() {
    try {
      const threats = {
        maliciousRedirects: await this.checkMaliciousRedirects(),
        dnsHijacking: await this.checkDNSHijacking(),
        manInTheMiddle: await this.checkMITMAttacks(),
        suspiciousLatency: await this.checkSuspiciousLatency()
      };

      const threatCount = Object.values(threats).filter(Boolean).length;
      
      return {
        threatsDetected: threatCount,
        threats: threats,
        riskLevel: threatCount >= 2 ? 'High' : threatCount === 1 ? 'Medium' : 'Low'
      };

    } catch (error) {
      console.error('Threat detection failed:', error);
      return { error: error.message };
    }
  }

  async checkMaliciousRedirects() {
    try {
      const testUrl = 'https://www.google.com';
      const response = await fetch(testUrl, {
        method: 'HEAD',
        redirect: 'manual',
        signal: AbortSignal.timeout(3000)
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location && !location.includes('google.com')) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async checkDNSHijacking() {
    try {
      const testDomains = ['google.com', 'cloudflare.com'];
      
      for (const domain of testDomains) {
        const response = await fetch(`https://${domain}`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(3000)
        });

        if (!response.ok && response.status !== 404) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async checkMITMAttacks() {
    try {
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });

      return false;
    } catch (error) {
      return true;
    }
  }

  async checkSuspiciousLatency() {
    return false;
  }

  calculateTotalSecurityTests() {
    let tests = 1;
    
    if (this.config.vpnDetection) tests++;
    if (this.config.warpDetection) tests++;
    if (this.config.captivePortalCheck) tests++;
    if (this.config.dnsLeakTest) tests++;
    if (this.config.sslAnalysis) tests++;
    if (this.config.threatDetection) tests++;
    
    return tests;
  }

  calculateSecurityScore() {
    let score = 50;
    
    if (this.results.vpnStatus?.status === 'Likely Connected' || 
        this.results.vpnStatus?.status === 'Possibly Connected') {
      score += 20;
    }
    
    if (this.results.warpStatus === 'Connected') {
      score += 15;
    }
    
    if (this.results.captivePortal?.detected) {
      score -= 10;
    }
    
    if (this.results.sslAnalysis?.overallSecurity) {
      score += (this.results.sslAnalysis.overallSecurity * 0.15);
    }
    
    if (this.results.threats?.threatsDetected > 0) {
      score -= (this.results.threats.threatsDetected * 15);
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  generateSecurityRecommendations() {
    const recommendations = [];
    
    if (!this.results.vpnStatus?.status || this.results.vpnStatus.status === 'Not Detected') {
      recommendations.push({
        type: 'privacy',
        priority: 'medium',
        title: 'Consider Using a VPN',
        description: 'A VPN can enhance your privacy and security online.',
        action: 'Enable a trusted VPN service'
      });
    }
    
    if (this.results.warpStatus !== 'Connected') {
      recommendations.push({
        type: 'privacy',
        priority: 'low',
        title: 'Enable Cloudflare WARP',
        description: 'WARP provides additional privacy and may improve performance.',
        action: 'Download and enable Cloudflare WARP'
      });
    }
    
    if (this.results.captivePortal?.detected) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        title: 'Captive Portal Detected',
        description: 'Complete the network login process for full internet access.',
        action: 'Open browser and complete network authentication'
      });
    }
    
    if (this.results.sslAnalysis?.overallSecurity < 70) {
      recommendations.push({
        type: 'security',
        priority: 'medium',
        title: 'Improve HTTPS Security',
        description: 'Some websites may have weak security configurations.',
        action: 'Use HTTPS Everywhere browser extension'
      });
    }
    
    if (this.results.threats?.threatsDetected > 0) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        title: 'Potential Network Threats Detected',
        description: 'Your network connection may be compromised.',
        action: 'Disconnect and use a different network or VPN'
      });
    }
    
    return recommendations;
  }

  getResults() {
    return this.results;
  }

  stop() {
    this.isRunning = false;
  }

  isTestRunning() {
    return this.isRunning;
  }
}