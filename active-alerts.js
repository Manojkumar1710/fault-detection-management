document.addEventListener('DOMContentLoaded', () => {
    // Initialize the page
    updateSystemTime();
    setInterval(updateSystemTime, 1000);
    
    loadActiveAlerts();
    setInterval(loadActiveAlerts, 7000); // Refresh every 7 seconds
    
    setupEventListeners();
    updateAlertStatistics();
});

// Enhanced threshold configuration with multiple alert types
const ALERT_THRESHOLDS = {
    critical: {
        voltage: { max: 12000, min: 10000, unit: 'V' },
        current: { max: 300, min: 0, unit: 'A' },
        power: { max: 50, min: 0, unit: 'MW' },
        temperature: { max: 90, min: 0, unit: '°C' }
    },
    warning: {
        voltage: { max: 11800, min: 10200, unit: 'V' },
        current: { max: 280, min: 0, unit: 'A' },
        power: { max: 45, min: 0, unit: 'MW' },
        temperature: { max: 80, min: 0, unit: '°C' },
        voltageFluctuation: 5, // percentage
        loadImbalance: 15, // percentage
        communicationDelay: 30 // seconds
    },
    info: {
        maintenanceDue: 7, // days
        statusUpdate: true
    }
};

let currentFilter = 'all';
let alertHistory = [];

// Utility function to update system time
function updateSystemTime() {
    const timeElement = document.getElementById('system-time');
    if (timeElement) {
        timeElement.textContent = new Date().toLocaleTimeString('en-IN', { hour12: false });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-alerts');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.classList.add('loading');
            loadActiveAlerts().finally(() => {
                setTimeout(() => refreshBtn.classList.remove('loading'), 1000);
            });
        });
    }
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.getAttribute('data-filter');
            updateFilterButtons();
            filterAlerts();
        });
    });
}

function updateFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === currentFilter);
    });
}

// Enhanced alert generation with multiple alert types
async function loadActiveAlerts() {
    try {
        // Simulate API response with comprehensive line data
        const allLines = [
            { 
                id: 1, name: '1', location: 'Trivandrum North', 
                voltageLoad: 11000, currentLoad: 250, power: 4.5, temperature: 75,
                lastCommunication: new Date(Date.now() - 15000),
                maintenanceDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            },
            { 
                id: 2, name: '2', location: 'Kollam Industrial', 
                voltageLoad: 11500, currentLoad: 310, power: 5.2, temperature: 95,
                lastCommunication: new Date(Date.now() - 5000),
                maintenanceDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            },
            { 
                id: 3, name: '3', location: 'Kochi Metro', 
                voltageLoad: 12500, currentLoad: 280, power: 4.8, temperature: 80,
                lastCommunication: new Date(Date.now() - 35000),
                maintenanceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            },
            { 
                id: 4, name: '4', location: 'Palakkad Rural', 
                voltageLoad: 11200, currentLoad: 290, power: 4.9, temperature: 85,
                lastCommunication: new Date(Date.now() - 10000),
                maintenanceDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
            },
            {
                id: 5, name: '5', location: 'Thrissur Urban',
                voltageLoad: 9800, currentLoad: 320, power: 3.8, temperature: 88,
                lastCommunication: new Date(Date.now() - 8000),
                maintenanceDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
            }
        ];

        // Generate alerts based on comprehensive threshold checking
        const generatedAlerts = [];
        
        allLines.forEach(line => {
            const alerts = generateAlertsForLine(line);
            generatedAlerts.push(...alerts);
        });

        // Store for filtering
        alertHistory = generatedAlerts;
        
        // Update counts
        updateAlertCounts(generatedAlerts);
        
        // Display alerts
        displayAlerts(generatedAlerts);
        
    } catch (error) {
        console.error('Failed to fetch active alerts:', error);
        displayErrorMessage();
    }
}

function generateAlertsForLine(line) {
    const alerts = [];
    const now = new Date();
    
    // Critical alerts
    if (line.voltageLoad > ALERT_THRESHOLDS.critical.voltage.max) {
        alerts.push({
            id: `${line.id}-voltage-high`,
            type: 'critical',
            category: 'voltage',
            title: 'High Voltage Alert',
            message: `Voltage exceeded critical threshold: ${line.voltageLoad}V > ${ALERT_THRESHOLDS.critical.voltage.max}V`,
            line: line,
            timestamp: now,
            acknowledged: false
        });
    }
    
    if (line.voltageLoad < ALERT_THRESHOLDS.critical.voltage.min) {
        alerts.push({
            id: `${line.id}-voltage-low`,
            type: 'critical',
            category: 'voltage',
            title: 'Low Voltage Alert',
            message: `Voltage below critical threshold: ${line.voltageLoad}V < ${ALERT_THRESHOLDS.critical.voltage.min}V`,
            line: line,
            timestamp: now,
            acknowledged: false
        });
    }
    
    if (line.currentLoad > ALERT_THRESHOLDS.critical.current.max) {
        alerts.push({
            id: `${line.id}-current-high`,
            type: 'critical',
            category: 'current',
            title: 'Overcurrent Alert',
            message: `Current exceeded safe limit: ${line.currentLoad}A > ${ALERT_THRESHOLDS.critical.current.max}A`,
            line: line,
            timestamp: now,
            acknowledged: false
        });
    }
    
    if (line.temperature > ALERT_THRESHOLDS.critical.temperature.max) {
        alerts.push({
            id: `${line.id}-temp-high`,
            type: 'critical',
            category: 'temperature',
            title: 'Overheating Alert',
            message: `Temperature exceeded critical limit: ${line.temperature}°C > ${ALERT_THRESHOLDS.critical.temperature.max}°C`,
            line: line,
            timestamp: now,
            acknowledged: false
        });
    }
    
    if (line.power > ALERT_THRESHOLDS.critical.power.max) {
        alerts.push({
            id: `${line.id}-power-high`,
            type: 'critical',
            category: 'power',
            title: 'Power Overload Alert',
            message: `Power consumption exceeded limit: ${line.power}MW > ${ALERT_THRESHOLDS.critical.power.max}MW`,
            line: line,
            timestamp: now,
            acknowledged: false
        });
    }
    
    // Warning alerts
    if (line.voltageLoad > ALERT_THRESHOLDS.warning.voltage.max && line.voltageLoad <= ALERT_THRESHOLDS.critical.voltage.max) {
        alerts.push({
            id: `${line.id}-voltage-warn`,
            type: 'warning',
            category: 'voltage',
            title: 'Voltage Warning',
            message: `Voltage approaching critical level: ${line.voltageLoad}V`,
            line: line,
            timestamp: now,
            acknowledged: false
        });
    }
    
    if (line.currentLoad > ALERT_THRESHOLDS.warning.current.max && line.currentLoad <= ALERT_THRESHOLDS.critical.current.max) {
        alerts.push({
            id: `${line.id}-current-warn`,
            type: 'warning',
            category: 'current',
            title: 'Current Warning',
            message: `Current load approaching maximum: ${line.currentLoad}A`,
            line: line,
            timestamp: now,
            acknowledged: false
        });
    }
    
    // Communication delay warning
    const commDelaySeconds = (now - line.lastCommunication) / 1000;
    if (commDelaySeconds > ALERT_THRESHOLDS.warning.communicationDelay) {
        alerts.push({
            id: `${line.id}-comm-delay`,
            type: 'warning',
            category: 'communication',
            title: 'Communication Delay',
            message: `Data transmission delayed: ${Math.round(commDelaySeconds)}s since last update`,
            line: line,
            timestamp: now,
            acknowledged: false
        });
    }
    
    // Maintenance due information
    const daysToMaintenance = (line.maintenanceDate - now) / (1000 * 60 * 60 * 24);
    if (daysToMaintenance <= ALERT_THRESHOLDS.info.maintenanceDue) {
        alerts.push({
            id: `${line.id}-maintenance`,
            type: 'info',
            category: 'maintenance',
            title: 'Maintenance Due',
            message: `Scheduled maintenance in ${Math.ceil(daysToMaintenance)} days`,
            line: line,
            timestamp: now,
            acknowledged: false
        });
    }
    
    return alerts;
}

function updateAlertCounts(alerts) {
    const counts = {
        critical: alerts.filter(a => a.type === 'critical').length,
        warning: alerts.filter(a => a.type === 'warning').length,
        info: alerts.filter(a => a.type === 'info').length
    };
    
    const criticalElement = document.getElementById('critical-count');
    const warningElement = document.getElementById('warning-count');
    const infoElement = document.getElementById('info-count');
    
    if (criticalElement) criticalElement.textContent = counts.critical;
    if (warningElement) warningElement.textContent = counts.warning;
    if (infoElement) infoElement.textContent = counts.info;
}

function displayAlerts(alerts) {
    const alertsGrid = document.getElementById('alerts-grid');
    
    if (!alerts || alerts.length === 0) {
        alertsGrid.innerHTML = `
            <div class="no-alerts-message">
                <div class="no-alerts-icon">✅</div>
                <div class="no-alerts-text">
                    <strong>All Clear</strong>
                    <p>No active alerts at this time. All systems operating normally.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Sort alerts by severity and timestamp
    const sortedAlerts = alerts.sort((a, b) => {
        const severityOrder = { critical: 3, warning: 2, info: 1 };
        if (severityOrder[a.type] !== severityOrder[b.type]) {
            return severityOrder[b.type] - severityOrder[a.type];
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    alertsGrid.innerHTML = '';
    
    sortedAlerts.forEach(alert => {
        const alertCard = createAlertCard(alert);
        alertsGrid.appendChild(alertCard);
    });
}

function createAlertCard(alert) {
    const card = document.createElement('div');
    card.className = `alert-card ${alert.type}`;
    card.setAttribute('data-type', alert.type);
    card.setAttribute('data-category', alert.category);
    
    const timeAgo = getTimeAgo(alert.timestamp);
    const priorityIcon = getPriorityIcon(alert.type);
    
    card.innerHTML = `
        <div class="alert-card-header">
            <div class="alert-priority">
                <span class="priority-icon">${priorityIcon}</span>
                <span class="alert-type">${alert.type.toUpperCase()}</span>
            </div>
            <div class="alert-time">${timeAgo}</div>
        </div>
        <div class="alert-card-body">
            <h4 class="alert-title">${alert.title}</h4>
            <p class="alert-message">${alert.message}</p>
            <div class="alert-source">
                <span class="source-line">Feeder Line ${alert.line.name}</span>
                <span class="source-location">${alert.line.location}</span>
            </div>
        </div>
        <div class="alert-card-footer">
            <div class="alert-metrics">
                <div class="metric-item">
                    <span class="metric-label">Voltage:</span>
                    <span class="metric-value ${alert.line.voltageLoad > ALERT_THRESHOLDS.critical.voltage.max || alert.line.voltageLoad < ALERT_THRESHOLDS.critical.voltage.min ? 'critical' : ''}">${alert.line.voltageLoad}V</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Current:</span>
                    <span class="metric-value ${alert.line.currentLoad > ALERT_THRESHOLDS.critical.current.max ? 'critical' : ''}">${alert.line.currentLoad}A</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Temp:</span>
                    <span class="metric-value ${alert.line.temperature > ALERT_THRESHOLDS.critical.temperature.max ? 'critical' : ''}">${alert.line.temperature}°C</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Power:</span>
                    <span class="metric-value ${alert.line.power > ALERT_THRESHOLDS.critical.power.max ? 'critical' : ''}">${alert.line.power}MW</span>
                </div>
            </div>
            <div class="alert-actions">
                <button class="btn-action acknowledge" onclick="acknowledgeAlert('${alert.id}')">
                    Acknowledge
                </button>
                <button class="btn-action details" onclick="viewAlertDetails('${alert.id}')">
                    Details
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function getPriorityIcon(type) {
    switch (type) {
        case 'critical': return '🔥';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return '📋';
    }
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
        return `${minutes}m ago`;
    } else {
        return `${seconds}s ago`;
    }
}

function filterAlerts() {
    const cards = document.querySelectorAll('.alert-card');
    
    cards.forEach(card => {
        const cardType = card.getAttribute('data-type');
        
        if (currentFilter === 'all' || cardType === currentFilter) {
            card.style.display = 'block';
            card.style.animation = 'slideInRight 0.3s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

function displayErrorMessage() {
    const alertsGrid = document.getElementById('alerts-grid');
    alertsGrid.innerHTML = `
        <div class="error-message">
            <div class="error-icon">❌</div>
            <div class="error-text">
                <strong>Connection Error</strong>
                <p>Could not load alert data. Please check your connection and try again.</p>
                <button class="btn btn-retry" onclick="loadActiveAlerts()">Retry</button>
            </div>
        </div>
    `;
}

function updateAlertStatistics() {
    // Simulate daily statistics
    const dailyAlertsElement = document.getElementById('daily-alerts');
    const avgResponseElement = document.getElementById('avg-response');
    const systemUptimeElement = document.getElementById('system-uptime');
    
    if (dailyAlertsElement) dailyAlertsElement.textContent = Math.floor(Math.random() * 50) + 25;
    if (avgResponseElement) avgResponseElement.textContent = `${(Math.random() * 3 + 1).toFixed(1)}m`;
    if (systemUptimeElement) {
        const uptime = (99.5 + Math.random() * 0.4).toFixed(1);
        systemUptimeElement.textContent = `${uptime}%`;
    }
}

// Alert action handlers
function acknowledgeAlert(alertId) {
    console.log(`Acknowledging alert: ${alertId}`);
    const alertCard = document.querySelector(`[data-alert-id="${alertId}"]`);
    if (alertCard) {
        alertCard.classList.add('acknowledged');
        // In a real system, this would send an API request
        showNotification('Alert acknowledged successfully', 'success');
    }
}

function viewAlertDetails(alertId) {
    console.log(`Viewing details for alert: ${alertId}`);
    // In a real system, this would open a detailed modal or navigate to details page
    showNotification('Alert details feature coming soon', 'info');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Export functions for testing
window.acknowledgeAlert = acknowledgeAlert;
window.viewAlertDetails = viewAlertDetails;