// 🚀 Wi-Fi Kickstart - Shared Utility Functions
// Common utilities used across the extension

export const Utils = {
  // Format bytes to human readable
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  // Format speed (Mbps)
  formatSpeed(speed, decimals = 1) {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(decimals)} Gbps`;
    }
    return `${speed.toFixed(decimals)} Mbps`;
  },

  // Format time duration
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  },

  // Format timestamp
  formatTimestamp(timestamp, format = 'short') {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (format === 'relative') {
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    }
    
    if (format === 'short') {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    if (format === 'full') {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    return date.toISOString();
  },

  // Calculate percentile
  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  },

  // Calculate statistics
  calculateStats(values) {
    if (!values || values.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        median: 0,
        stdDev: 0,
        p95: 0,
        p99: 0
      };
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    
    // Standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Median
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? 
      (sorted[mid - 1] + sorted[mid]) / 2 : 
      sorted[mid];
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: avg,
      median: median,
      stdDev: stdDev,
      p95: this.calculatePercentile(values, 95),
      p99: this.calculatePercentile(values, 99)
    };
  },

  // Get network quality grade
  getNetworkGrade(score) {
    if (score >= 95) return { grade: 'A+', color: '#00ff88', description: 'World-Class' };
    if (score >= 90) return { grade: 'A', color: '#32cd32', description: 'Exceptional' };
    if (score >= 85) return { grade: 'A-', color: '#50c878', description: 'Excellent' };
    if (score >= 80) return { grade: 'B+', color: '#4a90e2', description: 'Very Good' };
    if (score >= 75) return { grade: 'B', color: '#1e90ff', description: 'Good' };
    if (score >= 70) return { grade: 'B-', color: '#87ceeb', description: 'Above Average' };
    if (score >= 65) return { grade: 'C+', color: '#ffd700', description: 'Average' };
    if (score >= 60) return { grade: 'C', color: '#ffa500', description: 'Acceptable' };
    if (score >= 55) return { grade: 'C-', color: '#ff8c00', description: 'Below Average' };
    if (score >= 50) return { grade: 'D+', color: '#ff6347', description: 'Poor' };
    if (score >= 45) return { grade: 'D', color: '#ff4500', description: 'Very Poor' };
    return { grade: 'F', color: '#ff0000', description: 'Failing' };
  },

  // Get quality assessment
  getQualityAssessment(metrics) {
    const assessments = [];
    
    // Speed assessment
    if (metrics.downloadSpeed > 100) {
      assessments.push({ type: 'speed', level: 'excellent', message: 'Blazing fast speeds!' });
    } else if (metrics.downloadSpeed > 50) {
      assessments.push({ type: 'speed', level: 'good', message: 'Good download speeds' });
    } else if (metrics.downloadSpeed > 25) {
      assessments.push({ type: 'speed', level: 'fair', message: 'Adequate speeds for most tasks' });
    } else {
      assessments.push({ type: 'speed', level: 'poor', message: 'Speed may limit activities' });
    }
    
    // Latency assessment
    if (metrics.latency < 20) {
      assessments.push({ type: 'latency', level: 'excellent', message: 'Ultra-low latency!' });
    } else if (metrics.latency < 50) {
      assessments.push({ type: 'latency', level: 'good', message: 'Good responsiveness' });
    } else if (metrics.latency < 100) {
      assessments.push({ type: 'latency', level: 'fair', message: 'Acceptable latency' });
    } else {
      assessments.push({ type: 'latency', level: 'poor', message: 'High latency detected' });
    }
    
    // Packet loss assessment
    if (metrics.packetLoss === 0) {
      assessments.push({ type: 'reliability', level: 'excellent', message: 'Perfect reliability!' });
    } else if (metrics.packetLoss < 0.5) {
      assessments.push({ type: 'reliability', level: 'good', message: 'Minimal packet loss' });
    } else if (metrics.packetLoss < 1) {
      assessments.push({ type: 'reliability', level: 'fair', message: 'Some packet loss detected' });
    } else {
      assessments.push({ type: 'reliability', level: 'poor', message: 'Significant packet loss' });
    }
    
    return assessments;
  },

  // Determine capability support
  getCapabilities(metrics) {
    return {
      streaming4K: metrics.downloadSpeed >= 25 && metrics.latency < 50 && metrics.packetLoss < 0.5,
      streaming1080p: metrics.downloadSpeed >= 5 && metrics.latency < 100 && metrics.packetLoss < 1,
      streaming720p: metrics.downloadSpeed >= 2.5 && metrics.latency < 150 && metrics.packetLoss < 2,
      gaming: metrics.latency < 50 && metrics.jitter < 20 && metrics.packetLoss < 0.5,
      competitiveGaming: metrics.latency < 20 && metrics.jitter < 10 && metrics.packetLoss === 0,
      videoConferencing: metrics.downloadSpeed >= 3 && metrics.uploadSpeed >= 3 && metrics.latency < 150,
      remoteWork: metrics.downloadSpeed >= 10 && metrics.uploadSpeed >= 5 && metrics.packetLoss < 1,
      basicBrowsing: metrics.downloadSpeed >= 1 && metrics.latency < 200,
      fileSharing: metrics.uploadSpeed >= 10 && metrics.packetLoss < 0.5,
      cloudBackup: metrics.uploadSpeed >= 25 && metrics.packetLoss === 0
    };
  },

  // Generate recommendations
  generateRecommendations(metrics, capabilities) {
    const recommendations = [];
    
    // Speed recommendations
    if (metrics.downloadSpeed < 25) {
      recommendations.push({
        category: 'Speed',
        priority: 'high',
        suggestion: 'Consider upgrading your internet plan for better performance',
        impact: 'Improved streaming and download speeds'
      });
    }
    
    if (metrics.uploadSpeed < 10) {
      recommendations.push({
        category: 'Upload',
        priority: 'medium',
        suggestion: 'Upload speed is limited - may affect video calls and cloud backups',
        impact: 'Better video conferencing and file sharing'
      });
    }
    
    // Latency recommendations
    if (metrics.latency > 50) {
      recommendations.push({
        category: 'Latency',
        priority: 'high',
        suggestion: 'High latency detected - consider using ethernet or moving closer to router',
        impact: 'Improved responsiveness for gaming and video calls'
      });
    }
    
    // Jitter recommendations
    if (metrics.jitter > 30) {
      recommendations.push({
        category: 'Stability',
        priority: 'medium',
        suggestion: 'Network instability detected - check for interference or congestion',
        impact: 'More consistent performance'
      });
    }
    
    // Packet loss recommendations
    if (metrics.packetLoss > 0) {
      recommendations.push({
        category: 'Reliability',
        priority: 'high',
        suggestion: 'Packet loss detected - check cables and router settings',
        impact: 'Improved connection reliability'
      });
    }
    
    // Gaming specific
    if (!capabilities.gaming && metrics.latency > 30) {
      recommendations.push({
        category: 'Gaming',
        priority: 'medium',
        suggestion: 'For better gaming: use ethernet, close background apps, enable QoS',
        impact: 'Reduced lag and better gaming experience'
      });
    }
    
    // Streaming specific
    if (!capabilities.streaming4K && metrics.downloadSpeed > 15) {
      recommendations.push({
        category: 'Streaming',
        priority: 'low',
        suggestion: 'Close to 4K streaming capability - small improvements needed',
        impact: 'Enable 4K streaming on supported platforms'
      });
    }
    
    return recommendations;
  },

  // Parse file size string
  parseFileSize(sizeStr) {
    const units = { 
      KB: 1024, 
      MB: 1024 * 1024, 
      GB: 1024 * 1024 * 1024 
    };
    
    const match = sizeStr.match(/(\d+)(KB|MB|GB)/i);
    if (match) {
      return parseInt(match[1]) * units[match[2].toUpperCase()];
    }
    return 1024 * 1024; // Default 1MB
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Debounce function
  debounce(func, delay) {
    let timeoutId;
    return function() {
      const args = arguments;
      const context = this;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
  },

  // Deep clone object
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = this.deepClone(obj[key]);
      }
    }
    return clonedObj;
  },

  // Merge objects deeply
  deepMerge(target, source) {
    const output = Object.assign({}, target);
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  },

  // Check if object
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  },

  // Generate UUID
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // Get browser info
  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    
    if (ua.indexOf('Chrome') > -1) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Safari';
      version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Edge') > -1) {
      browser = 'Edge';
      version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
    }
    
    return {
      browser,
      version,
      userAgent: ua,
      platform: navigator.platform,
      language: navigator.language
    };
  },

  // Check connection type
  getConnectionType() {
    const connection = navigator.connection || 
                      navigator.mozConnection || 
                      navigator.webkitConnection;
    
    if (!connection) return 'Unknown';
    
    return {
      effectiveType: connection.effectiveType || 'Unknown',
      downlink: connection.downlink || 'Unknown',
      rtt: connection.rtt || 'Unknown',
      saveData: connection.saveData || false
    };
  },

  // Export data as CSV
  exportToCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) return;
    
    // Get headers
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    // Convert data to CSV rows
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    // Combine headers and rows
    const csv = [csvHeaders, ...csvRows].join('\n');
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Color interpolation for gradients
  interpolateColor(color1, color2, factor) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    
    return this.rgbToHex(r, g, b);
  },

  // Hex to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // RGB to Hex
  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  // Get speed color based on value
  getSpeedColor(speed) {
    if (speed >= 100) return '#00ff88'; // Excellent
    if (speed >= 50) return '#4a90e2';  // Good
    if (speed >= 25) return '#ffa500';  // Fair
    return '#ff4444'; // Poor
  },

  // Get latency color based on value
  getLatencyColor(latency) {
    if (latency < 20) return '#00ff88';  // Excellent
    if (latency < 50) return '#4a90e2';  // Good
    if (latency < 100) return '#ffa500'; // Fair
    return '#ff4444'; // Poor
  },

  // Validate URL
  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  },

  // Calculate network score
  calculateNetworkScore(metrics) {
    let score = 100;
    
    // Speed impact (40%)
    const speedScore = Math.min(100, (metrics.downloadSpeed / 100) * 40);
    score = score * (speedScore / 40);
    
    // Latency impact (30%)
    const latencyScore = Math.max(0, 100 - metrics.latency) * 0.3;
    score = score * (latencyScore / 30);
    
    // Packet loss impact (20%)
    const packetScore = Math.max(0, 100 - (metrics.packetLoss * 100)) * 0.2;
    score = score * (packetScore / 20);
    
    // Jitter impact (10%)
    const jitterScore = Math.max(0, 100 - (metrics.jitter * 2)) * 0.1;
    score = score * (jitterScore / 10);
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }
};