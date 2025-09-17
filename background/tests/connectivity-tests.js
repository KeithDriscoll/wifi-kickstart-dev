// 📡 CONNECTIVITY TESTS MODULE - ENHANCED
// Lightweight connectivity testing, badge management, uptime tracking, and ISP detection

export class ConnectivityTests {
  constructor() {
    this.lastConnectivityCheck = null;
    this.connectivityHistory = [];
    this.monitoringInterval = null;
    
    // 🕐 UPTIME TRACKING
    this.connectionStartTime = null;
    this.lastKnownIP = null;
    this.connectionDrops = 0;
    this.lastDropTime = null;
    
    // 📊 NETWORK INFO CACHE
    this.cachedNetworkInfo = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // 🚀 STEALTH CONNECTIVITY CHECK - Ultra lightweight for badge updates
  async stealthConnectivityCheck() {
    const start = performance.now();
    try {
      await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(1000) // 1 second timeout
      });
      const latency = performance.now() - start;
      
      const currentTime = Date.now();
      const wasConnected = this.lastConnectivityCheck?.connected || false;
      
      this.lastConnectivityCheck = { 
        latency, 
        timestamp: currentTime, 
        connected: true 
      };

      // 🕐 TRACK CONNECTION START/RECOVERY
      if (!wasConnected) {
        // Connection restored or first time
        if (this.connectionStartTime === null) {
          // First connection
          this.connectionStartTime = currentTime;
          console.log('📶 Initial connection established');
        } else {
          // Connection recovered from drop
          this.connectionDrops++;
          this.lastDropTime = currentTime;
          this.connectionStartTime = currentTime; // Reset uptime counter
          console.log(`📶 Connection recovered (Drop #${this.connectionDrops})`);
        }
      }
      
      return latency;
    } catch (error) {
      const wasConnected = this.lastConnectivityCheck?.connected || false;
      
      this.lastConnectivityCheck = { 
        latency: null, 
        timestamp: Date.now(), 
        connected: false 
      };

      if (wasConnected) {
        console.log('📶 Connection dropped');
      }
      
      return null; // offline or blocked
    }
  }

  // ⚡ QUICK CONNECTIVITY CHECK - For popup instant tests
  async runQuickConnectivityCheck() {
    const latency = await this.stealthConnectivityCheck();
    
    if (latency === null) {
      return {
        connected: false,
        latency: null,
        status: 'Offline',
        uptime: this.getFormattedUptime(),
        timestamp: Date.now()
      };
    }

    let status = 'Excellent';
    if (latency > 150) status = 'Poor';
    else if (latency > 50) status = 'Good';

    return {
      connected: true,
      latency: Math.round(latency),
      status: status,
      uptime: this.getFormattedUptime(),
      timestamp: Date.now()
    };
  }

  // 🕐 GET FORMATTED UPTIME - "2h 15m" format
  getFormattedUptime() {
    if (!this.connectionStartTime || !this.lastConnectivityCheck?.connected) {
      return 'Not connected';
    }

    const uptimeMs = Date.now() - this.connectionStartTime;
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  }

  // 🌐 GET ISP NAME - Use SecurityTests for detailed network info
  async getISPName(testOrchestrator) {
    try {
      if (!testOrchestrator?.securityTests) {
        return 'Unknown ISP';
      }

      // Use runAnalysis instead of getBasicNetworkInfo
      const securityResults = await testOrchestrator.securityTests.runAnalysis();
      return securityResults.networkInfo?.isp || 
            securityResults.networkInfo?.org || 
            'Unknown ISP';
    } catch (error) {
      console.warn('Failed to get ISP info:', error);
      return 'Unknown ISP';
    }
}

  // 🎨 GET WIFI ICON COLOR - Based on security status
  async getWiFiIconColor(testOrchestrator) {
    try {
      if (!this.lastConnectivityCheck?.connected) {
        return '#ff0000'; // Red - Disconnected
      }

      // For now, just return green if connected (we'll enhance later)
      return '#50c878'; // Green - Connected
    } catch (error) {
      console.warn('Failed to determine WiFi security color:', error);
      return '#ffa500'; // Orange - Error state
  }
  }

  // 🏷️ SIMPLE BADGE UPDATE - Green = connected, Red = disconnected
  async updateBadge() {
  console.log('🏷️ Updating badge...');
  const latency = await this.stealthConnectivityCheck();
  
  if (latency === null) {
    console.log('🔴 Setting RED badge - offline');
    chrome.action.setBadgeBackgroundColor({ color: '#ff0000' });
    chrome.action.setBadgeText({ text: '✗' }); // ADD VISIBLE TEXT
  } else {
    console.log('🟢 Setting GREEN badge - online', latency + 'ms');
    chrome.action.setBadgeBackgroundColor({ color: '#50c878' });
    chrome.action.setBadgeText({ text: '✓' }); // ADD VISIBLE TEXT
  }
}

  // 🔄 START MONITORING - Runs every 3 seconds
  startNetworkMonitoring() {
    console.log('📡 Starting connectivity monitoring...');
    
    // Initial check
    this.updateBadge();
    
    // Check every 3 seconds using alarm (efficient)
    chrome.alarms.create('connectivityCheck', { periodInMinutes: 0.05 }); // 3 seconds
    
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'connectivityCheck') {
        this.updateBadge();
      }
    });
  }

  // 🛡️ CAPTIVE PORTAL CHECK
  async checkCaptivePortal() {
    try {
      const response = await fetch('http://neverssl.com/', {
        method: 'HEAD',
        cache: 'no-cache',
        redirect: 'manual',
        signal: AbortSignal.timeout(5000)
      });
      
      // If redirected, likely a captive portal
      return response.type === 'opaqueredirect' || response.status === 302;
    } catch (error) {
      return false;
    }
  }

  // 📊 GET NETWORK INFO FOR POPUP - Enhanced with ISP and uptime
  async getNetworkInfoQuick(testOrchestrator) {
    try {
      // Get quick connectivity status
      const quickCheck = await this.runQuickConnectivityCheck();
      
      // Check cache first
      if (this.cachedNetworkInfo && 
          (Date.now() - this.cachedNetworkInfo.timestamp < this.cacheExpiry)) {
        return {
          ...this.cachedNetworkInfo,
          latency: quickCheck.latency,
          connected: quickCheck.connected,
          status: quickCheck.status,
          uptime: quickCheck.uptime,
          timestamp: Date.now()
        };
      }

      // Get fresh detailed info
      let detailedInfo = {
        ip: 'Loading...',
        isp: 'Loading...',
        location: 'Loading...',
        vpnStatus: 'Checking...',
        warpStatus: 'Checking...',
        connectionType: 'Unknown',
        wifiIconColor: await this.getWiFiIconColor(testOrchestrator)
      };

      if (testOrchestrator?.securityTests) {
        try {
          const securityResults = await testOrchestrator.securityTests.runAnalysis();
          
          detailedInfo = {
            ip: securityResults.networkInfo?.ip || 'Unknown',
            isp: securityResults.networkInfo?.isp || 
                 securityResults.networkInfo?.org || 'Unknown ISP',
            location: securityResults.networkInfo?.location || 'Unknown',
            vpnStatus: securityResults.vpnStatus?.status || 'Unknown',
            warpStatus: securityResults.warpStatus || 'Unknown',
            connectionType: securityResults.networkInfo?.connectionType?.type || 'Unknown',
            wifiIconColor: await this.getWiFiIconColor(testOrchestrator)
          };

          // Cache the results
          this.cachedNetworkInfo = {
            ...detailedInfo,
            timestamp: Date.now()
          };
          
        } catch (error) {
          console.warn('Security info fetch failed:', error);
        }
      }

      return {
        ...detailedInfo,
        latency: quickCheck.latency,
        connected: quickCheck.connected,
        status: quickCheck.status,
        uptime: quickCheck.uptime,
        drops: this.connectionDrops,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Failed to get network info:', error);
      return { 
        error: error.message,
        connected: false,
        uptime: 'Not connected',
        wifiIconColor: '#ff0000',
        timestamp: Date.now()
      };
    }
  }

  // 🛑 STOP MONITORING
  stopNetworkMonitoring() {
    chrome.alarms.clear('connectivityCheck');
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // 🔄 RESET UPTIME - For testing or manual reset
  resetUptime() {
    this.connectionStartTime = Date.now();
    this.connectionDrops = 0;
    this.lastDropTime = null;
    console.log('📶 Uptime counter reset');
  }

  // 📈 GET RESULTS - Enhanced with uptime stats
  getResults() {
    return {
      lastCheck: this.lastConnectivityCheck,
      history: this.connectivityHistory,
      uptime: {
        startTime: this.connectionStartTime,
        formattedUptime: this.getFormattedUptime(),
        drops: this.connectionDrops,
        lastDropTime: this.lastDropTime
      }
    };
  }
}