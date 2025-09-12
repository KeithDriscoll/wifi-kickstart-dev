// 👁️ Visibility Panel Controller
// Left-side panel for toggling chart and section visibility

export class VisibilityPanel {
  constructor() {
    this.isOpen = false;
    this.visibilitySettings = {
      sections: {},
      charts: {}
    };
  }

  // Initialize the visibility panel
  async init() {
    console.log('👁️ Initializing Visibility Panel...');
    
    // Load saved visibility settings
    await this.loadVisibilitySettings();
    
    // Create panel HTML
    this.createPanel();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Apply saved visibility states
    this.applyVisibilityStates();
    
    console.log('✅ Visibility Panel initialized!');
  }

  // Create the panel HTML structure
  createPanel() {
    const panel = document.createElement('div');
    panel.className = 'visibility-flyout';
    panel.id = 'visibilityFlyout';
    
    panel.innerHTML = `
      <div class="flyout-header">
        <h2 class="flyout-title">Show/Hide Elements</h2>
        <button class="flyout-close" id="closeVisibilityPanel">×</button>
      </div>
      
      <div class="flyout-content">
        <!-- Quick Actions -->
        <div class="flyout-section">
          <h3 class="flyout-section-title">Quick Actions</h3>
          <div class="quick-actions">
            <button class="action-btn" id="showAllBtn">Show All</button>
            <button class="action-btn" id="hideAllBtn">Hide All</button>
            <button class="action-btn" id="resetVisibilityBtn">Reset</button>
          </div>
        </div>
        
        <!-- Dashboard Sections -->
        <div class="flyout-section">
          <h3 class="flyout-section-title">Dashboard Sections</h3>
          <div id="sectionToggles" class="toggle-list">
            <!-- Section toggles will be populated here -->
          </div>
        </div>
        
        <!-- Charts -->
        <div class="flyout-section">
          <h3 class="flyout-section-title">Charts</h3>
          <div id="chartToggles" class="toggle-list">
            <!-- Chart toggles will be populated here -->
          </div>
        </div>
        
        <!-- Status Cards -->
        <div class="flyout-section">
          <h3 class="flyout-section-title">Status Cards</h3>
          <div id="statusToggles" class="toggle-list">
            <!-- Status card toggles will be populated here -->
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'visibility-panel-toggle';
    toggleBtn.id = 'visibilityPanelToggle';
    toggleBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    toggleBtn.title = 'Toggle Visibility Panel';
    
    document.body.appendChild(toggleBtn);
    
    // Populate toggles
    this.populateToggles();
  }

  // Populate toggle switches for all elements
  populateToggles() {
    // Get all dashboard sections
    const sections = document.querySelectorAll('.dashboard-section');
    const sectionContainer = document.getElementById('sectionToggles');
    
    sections.forEach(section => {
      const sectionId = section.dataset.section || section.id || `section-${Math.random().toString(36).substr(2, 9)}`;
      section.dataset.visibilityId = sectionId;
      
      const title = section.querySelector('.section-title')?.textContent || 
                   section.querySelector('h2')?.textContent || 
                   'Unnamed Section';
      
      sectionContainer.appendChild(this.createToggleRow(sectionId, title, 'section'));
    });
    
    // Get all charts
    const charts = document.querySelectorAll('.chart-container');
    const chartContainer = document.getElementById('chartToggles');
    
    charts.forEach(chart => {
      const chartId = chart.dataset.chart || chart.id || `chart-${Math.random().toString(36).substr(2, 9)}`;
      chart.dataset.visibilityId = chartId;
      
      const title = chart.querySelector('.chart-title')?.textContent || 
                   chart.querySelector('h3')?.textContent || 
                   'Unnamed Chart';
      
      chartContainer.appendChild(this.createToggleRow(chartId, title, 'chart'));
    });
    
    // Get all status cards
    const statusCards = document.querySelectorAll('.status-card');
    const statusContainer = document.getElementById('statusToggles');
    
    statusCards.forEach(card => {
      const cardId = card.dataset.status || card.id || `status-${Math.random().toString(36).substr(2, 9)}`;
      card.dataset.visibilityId = cardId;
      
      const title = card.querySelector('.status-label')?.textContent || 
                   card.querySelector('h4')?.textContent || 
                   'Unnamed Status';
      
      statusContainer.appendChild(this.createToggleRow(cardId, title, 'status'));
    });
  }

  // Create a toggle row
  createToggleRow(id, label, type) {
    const row = document.createElement('div');
    row.className = 'visibility-row';
    row.dataset.targetId = id;
    row.dataset.targetType = type;
    
    const isVisible = this.visibilitySettings[type + 's']?.[id] !== false;
    
    row.innerHTML = `
      <label class="visibility-label">${label}</label>
      <label class="toggle-switch">
        <input type="checkbox" class="visibility-toggle" 
               data-target="${id}" 
               data-type="${type}" 
               ${isVisible ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </label>
    `;
    
    return row;
  }

  // Setup event listeners
  setupEventListeners() {
    // Toggle panel button
    document.getElementById('visibilityPanelToggle').addEventListener('click', () => {
      this.toggle();
    });
    
    // Close button
    document.getElementById('closeVisibilityPanel').addEventListener('click', () => {
      this.close();
    });
    
    // Quick action buttons
    document.getElementById('showAllBtn').addEventListener('click', () => {
      this.toggleAll(true);
    });
    
    document.getElementById('hideAllBtn').addEventListener('click', () => {
      this.toggleAll(false);
    });
    
    document.getElementById('resetVisibilityBtn').addEventListener('click', () => {
      this.resetVisibility();
    });
    
    // Individual toggle switches
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('visibility-toggle')) {
        const targetId = e.target.dataset.target;
        const targetType = e.target.dataset.type;
        const isVisible = e.target.checked;
        
        this.toggleElement(targetId, targetType, isVisible);
      }
    });
    
    // Keyboard shortcut (Ctrl/Cmd + Shift + V)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  // Toggle panel visibility
  toggle() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('visibilityFlyout');
    panel.classList.toggle('active', this.isOpen);
  }

  // Open panel
  open() {
    this.isOpen = true;
    document.getElementById('visibilityFlyout').classList.add('active');
  }

  // Close panel
  close() {
    this.isOpen = false;
    document.getElementById('visibilityFlyout').classList.remove('active');
  }

  // Toggle element visibility
  toggleElement(id, type, isVisible) {
    const element = document.querySelector(`[data-visibility-id="${id}"]`);
    
    if (element) {
      if (isVisible) {
        element.classList.remove('hidden-by-toggle');
        element.style.display = '';
      } else {
        element.classList.add('hidden-by-toggle');
        element.style.display = 'none';
      }
      
      // Save setting
      if (!this.visibilitySettings[type + 's']) {
        this.visibilitySettings[type + 's'] = {};
      }
      this.visibilitySettings[type + 's'][id] = isVisible;
      this.saveVisibilitySettings();
    }
  }

  // Toggle all elements
  toggleAll(show) {
    const toggles = document.querySelectorAll('.visibility-toggle');
    
    toggles.forEach(toggle => {
      toggle.checked = show;
      const event = new Event('change', { bubbles: true });
      toggle.dispatchEvent(event);
    });
  }

  // Reset visibility to default
  resetVisibility() {
    this.visibilitySettings = {
      sections: {},
      charts: {}
    };
    
    // Show all elements
    document.querySelectorAll('.hidden-by-toggle').forEach(element => {
      element.classList.remove('hidden-by-toggle');
      element.style.display = '';
    });
    
    // Update all toggles
    document.querySelectorAll('.visibility-toggle').forEach(toggle => {
      toggle.checked = true;
    });
    
    this.saveVisibilitySettings();
  }

  // Apply saved visibility states
  applyVisibilityStates() {
    // Apply section visibility
    Object.entries(this.visibilitySettings.sections || {}).forEach(([id, isVisible]) => {
      if (!isVisible) {
        const element = document.querySelector(`[data-visibility-id="${id}"]`);
        if (element) {
          element.classList.add('hidden-by-toggle');
          element.style.display = 'none';
        }
      }
    });
    
    // Apply chart visibility
    Object.entries(this.visibilitySettings.charts || {}).forEach(([id, isVisible]) => {
      if (!isVisible) {
        const element = document.querySelector(`[data-visibility-id="${id}"]`);
        if (element) {
          element.classList.add('hidden-by-toggle');
          element.style.display = 'none';
        }
      }
    });
    
    // Apply status card visibility
    Object.entries(this.visibilitySettings.statuss || {}).forEach(([id, isVisible]) => {
      if (!isVisible) {
        const element = document.querySelector(`[data-visibility-id="${id}"]`);
        if (element) {
          element.classList.add('hidden-by-toggle');
          element.style.display = 'none';
        }
      }
    });
  }

  // Load visibility settings
  async loadVisibilitySettings() {
    try {
      const stored = await chrome.storage.local.get('visibilitySettings');
      if (stored.visibilitySettings) {
        this.visibilitySettings = stored.visibilitySettings;
      }
    } catch (error) {
      console.error('Failed to load visibility settings:', error);
    }
  }

  // Save visibility settings
  async saveVisibilitySettings() {
    try {
      await chrome.storage.local.set({
        visibilitySettings: this.visibilitySettings
      });
    } catch (error) {
      console.error('Failed to save visibility settings:', error);
    }
  }
}