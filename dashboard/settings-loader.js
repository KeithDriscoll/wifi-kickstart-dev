/**
 * 🚀 PREMIUM SETTINGS LOADER - Dynamic Content Loading System
 * 
 * Professional-grade dynamic content loader with:
 * - Smart caching and memory management
 * - Graceful error handling and fallbacks
 * - CSS injection with proper scoping
 * - Event delegation and cleanup
 * - Loading states and user feedback
 * 
 * @author Future Robot™
 * @version 2.0.0
 */

export class SettingsLoader {
  constructor() {
    this.cache = {
      content: null,
      cssInjected: false,
      eventsBound: false,
      lastFetch: null
    };
    
    this.config = {
      CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
      FETCH_TIMEOUT: 10000, // 10 seconds
      RETRY_ATTEMPTS: 3,
      RETRY_DELAY: 1000 // 1 second
    };
    
    this.eventListeners = new Map();
    this.isLoading = false;
    this.loadPromise = null;
    
    console.log('🚀 Premium Settings Loader initialized');
  }

  /**
   * Main entry point - Load settings into container
   * @param {HTMLElement} container - Target container element
   * @param {Object} options - Loading options
   * @returns {Promise<boolean>} Success status
   */
  async loadSettings(container, options = {}) {
    const startTime = performance.now();
    
    try {
      // Prevent concurrent loading
      if (this.isLoading) {
        console.log('⏳ Settings already loading, waiting...');
        return await this.loadPromise;
      }

      this.isLoading = true;
      this.loadPromise = this._performLoad(container, options);
      
      const success = await this.loadPromise;
      const loadTime = performance.now() - startTime;
      
      console.log(`✅ Settings loaded successfully in ${loadTime.toFixed(2)}ms`);
      return success;
      
    } catch (error) {
      const loadTime = performance.now() - startTime;
      console.error(`❌ Settings loading failed after ${loadTime.toFixed(2)}ms:`, error);
      
      // Show user-friendly error
      this._showErrorState(container, error);
      return false;
      
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  /**
   * Perform the actual loading operation
   * @private
   */
  async _performLoad(container, options) {
    // Show loading state
    this._showLoadingState(container);
    
    // Check cache first
    if (this._isCacheValid()) {
      console.log('💾 Using cached settings content');
      await this._renderContent(container, this.cache.content);
      return true;
    }
    
    // Fetch fresh content
    console.log('🌐 Fetching fresh settings content...');
    const content = await this._fetchSettingsContent();
    
    // Process and cache content
    const processedContent = this._processContent(content);
    this._updateCache(processedContent);
    
    // Inject CSS if needed
    await this._ensureCSSInjected();
    
    // Render content
    await this._renderContent(container, processedContent);
    
    return true;
  }

  /**
   * Fetch settings content from settings.html
   * @private
   */
  async _fetchSettingsContent() {
    let lastError = null;
    
    for (let attempt = 1; attempt <= this.config.RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`🔄 Fetch attempt ${attempt}/${this.config.RETRY_ATTEMPTS}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.FETCH_TIMEOUT);
        
        const response = await fetch(chrome.runtime.getURL('settings/settings.html'), {
          method: 'GET',
          cache: 'no-cache',
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const content = await response.text();
        
        if (!content || content.length < 100) {
          throw new Error('Settings content appears to be empty or corrupted');
        }
        
        console.log(`✅ Settings fetched successfully (${content.length} bytes)`);
        return content;
        
      } catch (error) {
        lastError = error;
        
        if (error.name === 'AbortError') {
          console.warn(`⏰ Fetch timeout on attempt ${attempt}`);
        } else {
          console.warn(`⚠️ Fetch failed on attempt ${attempt}:`, error.message);
        }
        
        // Wait before retry (except on last attempt)
        if (attempt < this.config.RETRY_ATTEMPTS) {
          await this._delay(this.config.RETRY_DELAY * attempt);
        }
      }
    }
    
    throw new Error(`Failed to fetch settings after ${this.config.RETRY_ATTEMPTS} attempts: ${lastError.message}`);
  }

  /**
   * Process raw HTML content to extract settings container
   * @private
   */
  _processContent(htmlContent) {
    try {
      // Create temporary DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Extract settings container
      const settingsContainer = doc.querySelector('.settings-container');
      
      if (!settingsContainer) {
        throw new Error('Settings container not found in HTML content');
      }
      
      // Clean up any scripts (security measure)
      const scripts = settingsContainer.querySelectorAll('script');
      scripts.forEach(script => script.remove());
      
      // Add scoping wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'dynamic-settings-wrapper';
      wrapper.appendChild(settingsContainer.cloneNode(true));
      
      console.log('🔧 Settings content processed successfully');
      return wrapper.outerHTML;
      
    } catch (error) {
      console.error('❌ Content processing failed:', error);
      throw new Error(`Content processing failed: ${error.message}`);
    }
  }

  /**
   * Ensure settings CSS is injected
   * @private
   */
  async _ensureCSSInjected() {
    if (this.cache.cssInjected) {
      return;
    }
    
    try {
      console.log('🎨 Injecting settings CSS...');
      
      // Create scoped CSS link
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = chrome.runtime.getURL('settings/settings.css');
      cssLink.id = 'dynamic-settings-css';
      
      // Add to head
      document.head.appendChild(cssLink);
      
      // Wait for CSS to load
      await new Promise((resolve, reject) => {
        cssLink.onload = resolve;
        cssLink.onerror = () => reject(new Error('Failed to load settings CSS'));
        
        // Timeout fallback
        setTimeout(() => resolve(), 2000);
      });
      
      this.cache.cssInjected = true;
      console.log('✅ Settings CSS injected successfully');
      
    } catch (error) {
      console.warn('⚠️ CSS injection failed:', error.message);
      // Continue without CSS - better than failing completely
    }
  }

  /**
   * Render content into container
   * @private
   */
  async _renderContent(container, content) {
    try {
      // Clear container with animation
      await this._clearContainer(container);
      
      // Insert new content
      container.innerHTML = content;
      
      // Bind event listeners
      this._bindEventListeners(container);
      
      // Animate in
      await this._animateContentIn(container);
      
      console.log('🎯 Content rendered successfully');
      
    } catch (error) {
      console.error('❌ Content rendering failed:', error);
      throw error;
    }
  }

  /**
   * Bind event listeners to settings content
   * @private
   */
  _bindEventListeners(container) {
    if (this.cache.eventsBound) {
      return;
    }
    
    try {
      // Use event delegation for better performance
      const eventHandlers = [
        // Navigation handling
        {
          selector: '.nav-item',
          event: 'click',
          handler: (e) => this._handleNavigation(e)
        },
        
        // Form input changes
        {
          selector: 'input, select, textarea',
          event: 'change',
          handler: (e) => this._handleSettingChange(e)
        },
        
        // Toggle switches
        {
          selector: '.toggle-switch input',
          event: 'change',
          handler: (e) => this._handleToggle(e)
        },
        
        // Button actions
        {
          selector: 'button[id]',
          event: 'click',
          handler: (e) => this._handleButtonClick(e)
        },
        
        // Range sliders
        {
          selector: 'input[type="range"]',
          event: 'input',
          handler: (e) => this._handleSliderInput(e)
        }
      ];
      
      // Bind all handlers using delegation
      eventHandlers.forEach(({ selector, event, handler }) => {
        const boundHandler = (e) => {
          if (e.target.matches(selector)) {
            handler(e);
          }
        };
        
        container.addEventListener(event, boundHandler, true);
        
        // Store for cleanup
        const key = `${event}-${selector}`;
        this.eventListeners.set(key, {
          element: container,
          event,
          handler: boundHandler
        });
      });
      
      this.cache.eventsBound = true;
      console.log('🎮 Event listeners bound successfully');
      
    } catch (error) {
      console.error('❌ Event binding failed:', error);
      throw error;
    }
  }

  /**
   * Handle navigation between settings sections
   * @private
   */
  _handleNavigation(event) {
    event.preventDefault();
    
    const navItem = event.currentTarget;
    const section = navItem.dataset.section;
    
    if (!section) return;
    
    try {
      // Update active nav item
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
      });
      navItem.classList.add('active');
      
      // Show corresponding section
      document.querySelectorAll('.settings-section').forEach(sec => {
        sec.classList.remove('active');
      });
      
      const targetSection = document.getElementById(`${section}Section`);
      if (targetSection) {
        targetSection.classList.add('active');
      }
      
      console.log(`📄 Navigated to section: ${section}`);
      
    } catch (error) {
      console.error('❌ Navigation failed:', error);
    }
  }

  /**
   * Handle general setting changes
   * @private
   */
  _handleSettingChange(event) {
    const element = event.target;
    const settingKey = element.id || element.name;
    
    if (!settingKey) return;
    
    try {
      // Debounce rapid changes
      clearTimeout(element._changeTimeout);
      element._changeTimeout = setTimeout(() => {
        this._saveSetting(settingKey, element.value);
      }, 300);
      
    } catch (error) {
      console.error('❌ Setting change failed:', error);
    }
  }

  /**
   * Handle toggle switch changes
   * @private
   */
  _handleToggle(event) {
    const toggle = event.target;
    const settingKey = toggle.id;
    
    if (!settingKey) return;
    
    try {
      this._saveSetting(settingKey, toggle.checked);
      
      // Visual feedback
      this._showSettingSaved(toggle.closest('.setting-item'));
      
    } catch (error) {
      console.error('❌ Toggle change failed:', error);
    }
  }

  /**
   * Handle button clicks
   * @private
   */
  _handleButtonClick(event) {
    const button = event.currentTarget;
    const buttonId = button.id;
    
    // Prevent double-clicks
    if (button.disabled) return;
    
    try {
      // Dispatch to appropriate handler
      switch (buttonId) {
        case 'saveAllSettings':
          this._handleSaveAll();
          break;
        case 'resetSettings':
          this._handleReset();
          break;
        case 'exportSettings':
          this._handleExport();
          break;
        case 'importBtn':
          this._handleImport();
          break;
        default:
          console.log(`🔘 Button clicked: ${buttonId}`);
      }
      
    } catch (error) {
      console.error(`❌ Button action failed for ${buttonId}:`, error);
    }
  }

  /**
   * Handle slider input
   * @private
   */
  _handleSliderInput(event) {
    const slider = event.target;
    const value = slider.value;
    
    try {
      // Update display value
      const display = document.querySelector(`[data-slider="${slider.id}"]`);
      if (display) {
        display.textContent = this._formatSliderValue(slider, value);
      }
      
      // Save setting (debounced)
      clearTimeout(slider._inputTimeout);
      slider._inputTimeout = setTimeout(() => {
        this._saveSetting(slider.id, value);
      }, 150);
      
    } catch (error) {
      console.error('❌ Slider input failed:', error);
    }
  }

  /**
   * Save a setting to storage
   * @private
   */
  async _saveSetting(key, value) {
    try {
      // Send to background script
      const response = await chrome.runtime.sendMessage({
        type: 'UPDATE_SETTING',
        key,
        value
      });
      
      if (response?.success) {
        console.log(`💾 Setting saved: ${key} = ${value}`);
      } else {
        throw new Error(response?.error || 'Unknown save error');
      }
      
    } catch (error) {
      console.error(`❌ Failed to save setting ${key}:`, error);
      this._showErrorToast(`Failed to save ${key}`);
    }
  }

  /**
   * Show loading state
   * @private
   */
  _showLoadingState(container) {
    container.innerHTML = `
      <div class="settings-loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading Epic Settings...</div>
        <div class="loading-subtext">Fetching configuration options</div>
      </div>
    `;
    
    // Add loading styles
    if (!document.getElementById('settings-loading-styles')) {
      const styles = document.createElement('style');
      styles.id = 'settings-loading-styles';
      styles.textContent = this._getLoadingStyles();
      document.head.appendChild(styles);
    }
  }

  /**
   * Show error state
   * @private
   */
  _showErrorState(container, error) {
    container.innerHTML = `
      <div class="settings-error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-title">Unable to Load Settings</div>
        <div class="error-message">${this._getSafeErrorMessage(error)}</div>
        <div class="error-actions">
          <button class="retry-btn" onclick="window.dashboard?.settingsLoader?.loadSettings(this.closest('.full-settings-content'))">
            🔄 Retry
          </button>
          <button class="fallback-btn" onclick="chrome.runtime.sendMessage({type: 'OPEN_SETTINGS'})">
            🔗 Open Settings Page
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    try {
      // Remove event listeners
      this.eventListeners.forEach((listener, key) => {
        listener.element.removeEventListener(listener.event, listener.handler, true);
      });
      this.eventListeners.clear();
      
      // Clear cache
      this.cache = {
        content: null,
        cssInjected: false,
        eventsBound: false,
        lastFetch: null
      };
      
      // Remove injected styles
      const loadingStyles = document.getElementById('settings-loading-styles');
      if (loadingStyles) {
        loadingStyles.remove();
      }
      
      console.log('🧹 Settings loader cleaned up');
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }

  /**
   * Helper methods
   * @private
   */
  _isCacheValid() {
    if (!this.cache.content || !this.cache.lastFetch) {
      return false;
    }
    
    const age = Date.now() - this.cache.lastFetch;
    return age < this.config.CACHE_DURATION;
  }

  _updateCache(content) {
    this.cache.content = content;
    this.cache.lastFetch = Date.now();
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async _clearContainer(container) {
    container.style.opacity = '0';
    await this._delay(150);
  }

  async _animateContentIn(container) {
    container.style.opacity = '0';
    await this._delay(50);
    container.style.transition = 'opacity 0.3s ease';
    container.style.opacity = '1';
  }

  _getSafeErrorMessage(error) {
    // Sanitize error message for display
    const message = error?.message || 'Unknown error occurred';
    return message.replace(/<[^>]*>/g, ''); // Strip HTML
  }

  _formatSliderValue(slider, value) {
    // Format slider values based on context
    if (slider.id.includes('opacity')) {
      return `${Math.round(value * 100)}%`;
    }
    if (slider.id.includes('radius')) {
      return `${value}px`;
    }
    return value;
  }

  _showSettingSaved(element) {
    // Brief visual feedback
    element.style.backgroundColor = 'var(--success)';
    element.style.transition = 'background-color 0.3s ease';
    
    setTimeout(() => {
      element.style.backgroundColor = '';
    }, 1000);
  }

  _showErrorToast(message) {
    // Simple error toast
    const toast = document.createElement('div');
    toast.className = 'settings-error-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--error);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.style.opacity = '1', 100);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  _getLoadingStyles() {
    return `
      .settings-loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 40px;
        text-align: center;
        color: var(--text-primary);
      }
      
      .loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid var(--border);
        border-top: 4px solid var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .loading-text {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--text-primary);
      }
      
      .loading-subtext {
        font-size: 14px;
        color: var(--text-secondary);
        opacity: 0.8;
      }
      
      .settings-error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 40px;
        text-align: center;
        color: var(--text-primary);
      }
      
      .error-icon {
        font-size: 48px;
        margin-bottom: 20px;
      }
      
      .error-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--error);
      }
      
      .error-message {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 30px;
        max-width: 400px;
        line-height: 1.5;
      }
      
      .error-actions {
        display: flex;
        gap: 15px;
      }
      
      .retry-btn, .fallback-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      
      .retry-btn {
        background: var(--primary);
        color: white;
      }
      
      .retry-btn:hover {
        background: var(--primary-dark);
        transform: translateY(-1px);
      }
      
      .fallback-btn {
        background: var(--surface-light);
        color: var(--text-primary);
        border: 1px solid var(--border);
      }
      
      .fallback-btn:hover {
        background: var(--surface-hover);
      }
    `;
  }

  // Action handlers
  _handleSaveAll() {
    console.log('💾 Save all settings triggered');
    // Implementation will integrate with existing settings system
  }

  _handleReset() {
    if (confirm('Reset all settings to defaults?')) {
      console.log('🔄 Reset settings triggered');
      // Implementation will integrate with existing settings system
    }
  }

  _handleExport() {
    console.log('📤 Export settings triggered');
    // Implementation will integrate with existing settings system
  }

  _handleImport() {
    console.log('📥 Import settings triggered');
    // Implementation will integrate with existing settings system
  }
}