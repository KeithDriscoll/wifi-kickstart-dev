/**
 * 🎨 CUSTOM THEME BUILDER CONTROLLER
 * Interactive theme creation with live preview
 */

class CustomThemeBuilder {
  constructor() {
    this.currentTheme = {
      name: '',
      description: '',
      colors: {},
      gradients: {},
      settings: {}
    };
    
    this.previewMode = 'popup';
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    console.log('🎨 Initializing Custom Theme Builder...');
    
    // Wait for ThemeManager to be ready
    if (!window.ThemeManager || !window.ThemeManager.isInitialized) {
      setTimeout(() => this.init(), 100);
      return;
    }
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Load default template
    this.loadTemplate('professional');
    
    // Setup live preview
    this.setupLivePreview();
    
    this.isInitialized = true;
    console.log('✅ Theme Builder initialized!');
  }

  // Setup all event listeners
  setupEventListeners() {
    // Template buttons
    document.querySelectorAll('.template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const template = e.target.dataset.template;
        this.loadTemplate(template);
      });
    });

    // Color inputs
    this.setupColorInputs();

    // Background upload
    this.setupBackgroundUpload();

    // Sliders
    this.setupSliders();

    // Preview mode buttons
    document.querySelectorAll('.preview-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchPreviewMode(e.target.dataset.mode);
      });
    });

    // Action buttons
    document.getElementById('saveThemeBtn').addEventListener('click', () => {
      this.saveTheme();
    });

    document.getElementById('exportThemeBtn').addEventListener('click', () => {
      this.exportTheme();
    });

    document.getElementById('resetThemeBtn').addEventListener('click', () => {
      this.resetTheme();
    });

    document.getElementById('importThemeBtn').addEventListener('click', () => {
      document.getElementById('importThemeFile').click();
    });

    document.getElementById('importThemeFile').addEventListener('change', (e) => {
      this.importTheme(e.target.files[0]);
    });

    // Real-time updates
    document.getElementById('themeName').addEventListener('input', (e) => {
      this.currentTheme.name = e.target.value;
    });

    document.getElementById('themeDescription').addEventListener('input', (e) => {
      this.currentTheme.description = e.target.value;
    });
  }

  // Setup color input synchronization
  setupColorInputs() {
    const colorInputs = [
      'primaryColor', 'secondaryColor', 'backgroundColor', 'surfaceColor',
      'textPrimaryColor', 'textSecondaryColor', 'successColor', 'warningColor',
      'errorColor', 'infoColor'
    ];

    colorInputs.forEach(inputId => {
      const colorPicker = document.getElementById(inputId);
      const textInput = document.getElementById(inputId + 'Text');

      if (colorPicker && textInput) {
        // Sync color picker to text input
        colorPicker.addEventListener('input', (e) => {
          textInput.value = e.target.value;
          this.updateThemeColor(inputId, e.target.value);
        });

        // Sync text input to color picker
        textInput.addEventListener('input', (e) => {
          const color = e.target.value;
          if (this.isValidColor(color)) {
            colorPicker.value = color;
            this.updateThemeColor(inputId, color);
          }
        });
      }
    });
  }

  // Setup background upload functionality
  setupBackgroundUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('backgroundUpload');
    const preview = document.getElementById('backgroundPreview');
    const previewImg = document.getElementById('backgroundImage');
    const removeBtn = document.getElementById('removeBgBtn');

    // Click to upload
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleBackgroundUpload(files[0]);
      }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleBackgroundUpload(e.target.files[0]);
      }
    });

    // Remove background
    removeBtn.addEventListener('click', () => {
      this.removeBackground();
    });
  }

  // Setup slider controls
  setupSliders() {
    const sliders = [
      'backgroundOpacity', 'backgroundBlur', 'borderRadius', 'shadowIntensity'
    ];

    sliders.forEach(sliderId => {
      const slider = document.getElementById(sliderId);
      const valueDisplay = slider?.parentElement?.querySelector('.slider-value');

      if (slider && valueDisplay) {
        slider.addEventListener('input', (e) => {
          const value = e.target.value;
          this.updateSliderValue(sliderId, value, valueDisplay);
          this.updateThemeSetting(sliderId, value);
        });
      }
    });
  }

  // Load template theme
  loadTemplate(templateName) {
    const templates = {
      professional: {
        name: 'Professional Theme',
        description: 'Clean and professional design',
        colors: {
          primaryColor: '#2563eb',
          secondaryColor: '#059669',
          backgroundColor: '#ffffff',
          surfaceColor: '#f8fafc',
          textPrimaryColor: '#1f2937',
          textSecondaryColor: '#6b7280',
          successColor: '#059669',
          warningColor: '#d97706',
          errorColor: '#dc2626',
          infoColor: '#2563eb'
        }
      },
      creative: {
        name: 'Creative Theme',
        description: 'Vibrant and artistic design',
        colors: {
          primaryColor: '#8b5cf6',
          secondaryColor: '#06b6d4',
          backgroundColor: '#fafafa',
          surfaceColor: '#ffffff',
          textPrimaryColor: '#18181b',
          textSecondaryColor: '#52525b',
          successColor: '#10b981',
          warningColor: '#f59e0b',
          errorColor: '#ef4444',
          infoColor: '#8b5cf6'
        }
      },
      gaming: {
        name: 'Gaming Theme',
        description: 'RGB and neon aesthetics',
        colors: {
          primaryColor: '#9c88ff',
          secondaryColor: '#ff6b9d',
          backgroundColor: '#1a1a2e',
          surfaceColor: '#16213e',
          textPrimaryColor: '#ffffff',
          textSecondaryColor: '#c7d2fe',
          successColor: '#4ade80',
          warningColor: '#fbbf24',
          errorColor: '#f87171',
          infoColor: '#9c88ff'
        }
      },
      minimal: {
        name: 'Minimal Theme',
        description: 'Clean and simple design',
        colors: {
          primaryColor: '#000000',
          secondaryColor: '#6b7280',
          backgroundColor: '#ffffff',
          surfaceColor: '#f9fafb',
          textPrimaryColor: '#111827',
          textSecondaryColor: '#6b7280',
          successColor: '#10b981',
          warningColor: '#f59e0b',
          errorColor: '#ef4444',
          infoColor: '#3b82f6'
        }
      }
    };

    const template = templates[templateName];
    if (!template) return;

    // Update theme data
    this.currentTheme.name = template.name;
    this.currentTheme.description = template.description;
    this.currentTheme.colors = { ...template.colors };

    // Update UI
    document.getElementById('themeName').value = template.name;
    document.getElementById('themeDescription').value = template.description;

    // Update color inputs
    Object.entries(template.colors).forEach(([key, value]) => {
      const colorPicker = document.getElementById(key);
      const textInput = document.getElementById(key + 'Text');
      
      if (colorPicker) colorPicker.value = value;
      if (textInput) textInput.value = value;
    });

    // Apply to preview
    this.applyThemeToPreview();

    // Mark active template
    document.querySelectorAll('.template-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.template === templateName);
    });

    console.log(`📝 Loaded template: ${template.name}`);
  }

  // Update theme color
  updateThemeColor(colorKey, value) {
    const colorMap = {
      primaryColor: 'primary',
      secondaryColor: 'secondary',
      backgroundColor: 'background',
      surfaceColor: 'surface',
      textPrimaryColor: 'textPrimary',
      textSecondaryColor: 'textSecondary',
      successColor: 'success',
      warningColor: 'warning',
      errorColor: 'error',
      infoColor: 'info'
    };

    const cssVar = colorMap[colorKey];
    if (cssVar) {
      this.currentTheme.colors[cssVar] = value;
      this.applyThemeToPreview();
    }
  }

  // Update theme setting
  updateThemeSetting(key, value) {
    this.currentTheme.settings[key] = value;
    this.applyThemeToPreview();
  }

  // Update slider display value
  updateSliderValue(sliderId, value, display) {
    let displayValue = value;
    
    switch (sliderId) {
      case 'backgroundOpacity':
        displayValue = Math.round(value * 100) + '%';
        break;
      case 'backgroundBlur':
        displayValue = value + 'px';
        break;
      case 'borderRadius':
        displayValue = value + 'px';
        break;
      case 'shadowIntensity':
        displayValue = value + '%';
        break;
    }
    
    display.textContent = displayValue;
  }

  // Handle background image upload
  async handleBackgroundUpload(file) {
    try {
      const imageData = await window.ThemeManager.uploadBackgroundImage(file);
      
      // Show preview
      const preview = document.getElementById('backgroundPreview');
      const previewImg = document.getElementById('backgroundImage');
      const uploadArea = document.getElementById('uploadArea');
      
      previewImg.src = imageData;
      preview.style.display = 'block';
      uploadArea.style.display = 'none';
      
      // Apply to theme preview
      this.applyThemeToPreview();
      
      this.showToast('Background image uploaded successfully!', 'success');
      
    } catch (error) {
      this.showToast(error.message, 'error');
      console.error('Background upload error:', error);
    }
  }

  // Remove background image
  removeBackground() {
    window.ThemeManager.removeBackgroundImage();
    
    // Hide preview
    const preview = document.getElementById('backgroundPreview');
    const uploadArea = document.getElementById('uploadArea');
    
    preview.style.display = 'none';
    uploadArea.style.display = 'block';
    
    // Update theme preview
    this.applyThemeToPreview();
    
    this.showToast('Background image removed', 'success');
  }

  // Apply current theme to preview
  applyThemeToPreview() {
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(this.currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Apply settings
    Object.entries(this.currentTheme.settings).forEach(([key, value]) => {
      switch (key) {
        case 'borderRadius':
          root.style.setProperty('--radius', value + 'px');
          root.style.setProperty('--radius-sm', (value * 0.6) + 'px');
          root.style.setProperty('--radius-lg', (value * 1.3) + 'px');
          break;
        case 'backgroundOpacity':
          root.style.setProperty('--background-overlay', value);
          break;
        case 'backgroundBlur':
          root.style.setProperty('--background-blur', value + 'px');
          break;
        case 'shadowIntensity':
          const intensity = value / 100;
          root.style.setProperty('--shadow', `0 4px 6px rgba(0, 0, 0, ${0.3 * intensity})`);
          root.style.setProperty('--shadow-lg', `0 10px 25px rgba(0, 0, 0, ${0.5 * intensity})`);
          break;
      }
    });
    
    // Update gradients
    if (this.currentTheme.colors.primary && this.currentTheme.colors.secondary) {
      const gradient = `linear-gradient(135deg, ${this.currentTheme.colors.primary} 0%, ${this.currentTheme.colors.secondary} 100%)`;
      root.style.setProperty('--gradient-primary', gradient);
    }
  }

  // Switch preview mode
  switchPreviewMode(mode) {
    this.previewMode = mode;
    
    // Update active button
    document.querySelectorAll('.preview-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Show correct preview
    document.querySelectorAll('.preview-content').forEach(content => {
      content.classList.toggle('active', content.id === mode + 'Preview');
    });
    
    console.log(`👁️ Switched to ${mode} preview`);
  }

  // Setup live preview
  setupLivePreview() {
    // Apply initial theme
    this.applyThemeToPreview();
    
    // Setup mutation observer for real-time updates
    const observer = new MutationObserver(() => {
      this.applyThemeToPreview();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });
  }

  // Save custom theme
  async saveTheme() {
    if (!this.currentTheme.name.trim()) {
      this.showToast('Please enter a theme name', 'warning');
      return;
    }

    try {
      // Generate gradients
      const gradients = {
        primary: `linear-gradient(135deg, ${this.currentTheme.colors.primary} 0%, ${this.currentTheme.colors.secondary} 100%)`,
        surface: `linear-gradient(135deg, ${this.currentTheme.colors.surface} 0%, ${this.currentTheme.colors.background} 100%)`,
        epic: `linear-gradient(135deg, ${this.currentTheme.colors.background} 0%, ${this.currentTheme.colors.surface} 50%, ${this.currentTheme.colors.primary}22 100%)`
      };

      // Create theme
      const themeId = window.ThemeManager.createCustomTheme(
        this.currentTheme.name,
        this.currentTheme.colors,
        gradients
      );

      // Apply the new theme
      window.ThemeManager.applyTheme(themeId);

      this.showToast(`Theme "${this.currentTheme.name}" saved successfully!`, 'success');
      
      console.log(`💾 Saved custom theme: ${this.currentTheme.name}`);
      
    } catch (error) {
      this.showToast('Failed to save theme: ' + error.message, 'error');
      console.error('Save theme error:', error);
    }
  }

  // Export theme
  exportTheme() {
    if (!this.currentTheme.name.trim()) {
      this.showToast('Please enter a theme name before exporting', 'warning');
      return;
    }

    try {
      // Create export data
      const exportData = {
        name: this.currentTheme.name,
        description: this.currentTheme.description,
        colors: this.currentTheme.colors,
        settings: this.currentTheme.settings,
        version: '1.0',
        exported: new Date().toISOString()
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.currentTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
      a.click();

      URL.revokeObjectURL(url);

      this.showToast('Theme exported successfully!', 'success');
      console.log(`📤 Exported theme: ${this.currentTheme.name}`);
      
    } catch (error) {
      this.showToast('Failed to export theme: ' + error.message, 'error');
      console.error('Export theme error:', error);
    }
  }

  // Import theme
  async importTheme(file) {
    if (!file) return;

    try {
      const themeData = await window.ThemeManager.importTheme(file);
      
      // Load the imported theme into builder
      this.currentTheme.name = themeData.theme.name;
      this.currentTheme.description = themeData.theme.description || '';
      this.currentTheme.colors = { ...themeData.theme.colors };
      this.currentTheme.settings = { ...themeData.theme.settings || {} };

      // Update UI
      document.getElementById('themeName').value = this.currentTheme.name;
      document.getElementById('themeDescription').value = this.currentTheme.description;

      // Update color inputs
      Object.entries(this.currentTheme.colors).forEach(([key, value]) => {
        const colorKey = this.findColorInputKey(key);
        if (colorKey) {
          const colorPicker = document.getElementById(colorKey);
          const textInput = document.getElementById(colorKey + 'Text');
          
          if (colorPicker) colorPicker.value = value;
          if (textInput) textInput.value = value;
        }
      });

      // Apply to preview
      this.applyThemeToPreview();

      this.showToast(`Theme "${themeData.theme.name}" imported successfully!`, 'success');
      console.log(`📥 Imported theme: ${themeData.theme.name}`);
      
    } catch (error) {
      this.showToast('Failed to import theme: ' + error.message, 'error');
      console.error('Import theme error:', error);
    }
  }

  // Reset theme to default
  resetTheme() {
    if (confirm('Are you sure you want to reset the theme? All changes will be lost.')) {
      this.loadTemplate('professional');
      this.removeBackground();
      
      // Reset sliders
      document.getElementById('backgroundOpacity').value = 0.7;
      document.getElementById('backgroundBlur').value = 0;
      document.getElementById('borderRadius').value = 12;
      document.getElementById('shadowIntensity').value = 50;
      
      // Update slider displays
      document.querySelectorAll('.slider-value').forEach((el, index) => {
        const values = ['70%', '0px', '12px', '50%'];
        el.textContent = values[index] || '0';
      });
      
      this.showToast('Theme reset to defaults', 'success');
      console.log('🔄 Theme reset to defaults');
    }
  }

  // Helper: Find color input key
  findColorInputKey(colorKey) {
    const colorMap = {
      primary: 'primaryColor',
      secondary: 'secondaryColor',
      background: 'backgroundColor',
      surface: 'surfaceColor',
      textPrimary: 'textPrimaryColor',
      textSecondary: 'textSecondaryColor',
      success: 'successColor',
      warning: 'warningColor',
      error: 'errorColor',
      info: 'infoColor'
    };
    
    return colorMap[colorKey];
  }

  // Helper: Validate color
  isValidColor(color) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  // Show toast notification
  showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${this.getToastIcon(type)}</div>
      <div class="toast-message">${message}</div>
    `;

    // Add to page
    document.body.appendChild(toast);

    // Show with animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  // Get toast icon
  getToastIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.customThemeBuilder = new CustomThemeBuilder();
});

// Add toast styles
const toastStyles = `
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: var(--shadow-lg);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  max-width: 300px;
}

.toast.show {
  transform: translateX(0);
}

.toast.success {
  border-left: 4px solid var(--success);
}

.toast.error {
  border-left: 4px solid var(--error);
}

.toast.warning {
  border-left: 4px solid var(--warning);
}

.toast.info {
  border-left: 4px solid var(--info);
}

.toast-icon {
  font-size: 16px;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}
`;

// Inject toast styles
const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);