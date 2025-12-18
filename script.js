// This script runs when the Dashboard.html document has been completely loaded.
document.addEventListener('DOMContentLoaded', () => {

    // --- Utility Functions ---
    const updateSystemTime = () => {
        const timeElement = document.getElementById('system-time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('en-IN', { hour12: false });
        }
    };
    setInterval(updateSystemTime, 1000);
    updateSystemTime();

    const updateLastRefreshTime = () => {
        const refreshElement = document.getElementById('last-refresh');
        if (refreshElement) {
            const now = new Date();
            refreshElement.textContent = now.toLocaleTimeString('en-IN', { hour12: false });
        }
    };

    // --- Dashboard Data Simulation & State ---
    let isEmergencyShutdown = false;
    let activeAlerts = 0;
    const past24hAlerts = 3;
    let dataRefreshInterval;
    
    const feederLines = [
        { id: 'l1', name: 'Feeder Line 01', topoId: 'topo-line-1', manualControl: false },
        { id: 'l2', name: 'Feeder Line 02', topoId: 'topo-line-2', manualControl: false },
        { id: 'l3', name: 'Feeder Line 03', topoId: 'topo-line-3', manualControl: false },
        { id: 'l4', name: 'Feeder Line 04', topoId: 'topo-line-4', manualControl: false }
    ];

    // Get references to the modal elements
    const modal = document.getElementById('manual-control-modal');
    const modalTitle = document.getElementById('modal-title');
    const voltageInput = document.getElementById('manual-voltage');
    const currentInput = document.getElementById('manual-current');
    const tempInput = document.getElementById('manual-temp');
    let lineCurrentlyEditing = null;

    
    // Function to generate and update random metric data
    const updateMetrics = () => {
        if (isEmergencyShutdown) return;

        let onlineLinesCount = 0;
        let totalSystemLoad = 0;

        feederLines.forEach((line, index) => {
            const lineNumber = index + 1;
            
            if (line.manualControl) {
                onlineLinesCount++;
                const power = parseFloat(document.getElementById(`${line.id}-voltage`).textContent) * parseFloat(document.getElementById(`${line.id}-current`).textContent);
                totalSystemLoad += (power / 1000);
                return;
            }

            const voltageElem = document.getElementById(`${line.id}-voltage`);
            const currentElem = document.getElementById(`${line.id}-current`);
            const tempElem = document.getElementById(`${line.id}-temp`);
            const powerElem = document.getElementById(`${line.id}-power`);
            const statusIndicator = document.getElementById(`${line.id}-status`);
            const topoIndicator = document.getElementById(line.topoId);
            const signalBars = document.getElementById(`${line.id}-signal`);
            const lineCard = document.getElementById(`line-${lineNumber}`);

            const voltage = (Math.random() * (245 - 235) + 235);
            const current = (Math.random() * (25 - 10) + 10);
            const temperature = (Math.random() * (55 - 30) + 30);
            const power = (voltage * current);
            totalSystemLoad += (power / 1000);

            if (voltageElem) voltageElem.textContent = voltage.toFixed(1);
            if (currentElem) currentElem.textContent = current.toFixed(1);
            if (tempElem) tempElem.textContent = temperature.toFixed(1);
            if (powerElem) powerElem.textContent = power.toFixed(0);

            if (voltage > 242 || current > 22 || temperature > 50) {
                if (statusIndicator) statusIndicator.className = 'status-indicator status-red';
                if (topoIndicator) topoIndicator.style.background = 'var(--status-critical)';
                if (lineCard) lineCard.style.borderLeftColor = 'var(--status-critical)';
                if (Math.random() > 0.5 && !line.inAlert) {
                    activeAlerts++;
                    line.inAlert = true;
                }
            } else {
                if (statusIndicator) statusIndicator.className = 'status-indicator status-green';
                if (topoIndicator) topoIndicator.style.background = 'var(--status-online)';
                if (lineCard) lineCard.style.borderLeftColor = 'var(--status-online)';
                onlineLinesCount++;
                line.inAlert = false;
            }

            const signalStrength = Math.floor(Math.random() * 4) + 1;
            if (signalBars) {
                signalBars.querySelectorAll('.bar').forEach((bar, i) => {
                    bar.classList.toggle('active', i < signalStrength);
                });
            }
        });

        const summaryStatusText = document.getElementById('summary-status-text');
        const summaryStatusIndicator = document.getElementById('summary-status-indicator');
        if (activeAlerts > 0) {
            if(summaryStatusText) summaryStatusText.textContent = 'Warning';
            if(summaryStatusIndicator) summaryStatusIndicator.className = 'status-indicator status-yellow';
        } else {
            if(summaryStatusText) summaryStatusText.textContent = 'Operational';
            if(summaryStatusIndicator) summaryStatusIndicator.className = 'status-indicator status-green';
        }

        document.getElementById('lines-online').textContent = `${onlineLinesCount}/${feederLines.length}`;
        document.getElementById('total-load').textContent = totalSystemLoad.toFixed(1);
    };

    const simulateAlerts = () => {
        if (isEmergencyShutdown) return;
        document.getElementById('summary-alerts').textContent = activeAlerts;
        document.getElementById('alerts-24h').textContent = past24hAlerts + activeAlerts;
        const indicator = document.getElementById('summary-alerts-indicator');
        if (indicator) {
            indicator.className = activeAlerts > 0 ? 'status-indicator status-red' : 'status-indicator status-green';
        }
    };
    
    const openManualControlModal = (line) => {
        lineCurrentlyEditing = line;
        modalTitle.textContent = `Manual Control: ${line.name}`;
        voltageInput.value = document.getElementById(`${line.id}-voltage`).textContent;
        currentInput.value = document.getElementById(`${line.id}-current`).textContent;
        tempInput.value = document.getElementById(`${line.id}-temp`).textContent;
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        lineCurrentlyEditing = null;
    };

    const saveManualValues = () => {
        if (!lineCurrentlyEditing) return;
        const line = lineCurrentlyEditing;
        line.manualControl = true;

        const newVoltage = parseFloat(voltageInput.value) || parseFloat(document.getElementById(`${line.id}-voltage`).textContent);
        const newCurrent = parseFloat(currentInput.value) || parseFloat(document.getElementById(`${line.id}-current`).textContent);
        const newTemp = parseFloat(tempInput.value) || parseFloat(document.getElementById(`${line.id}-temp`).textContent);
        const newPower = newVoltage * newCurrent;

        document.getElementById(`${line.id}-voltage`).textContent = newVoltage.toFixed(1);
        document.getElementById(`${line.id}-current`).textContent = newCurrent.toFixed(1);
        document.getElementById(`${line.id}-temp`).textContent = newTemp.toFixed(1);
        document.getElementById(`${line.id}-power`).textContent = newPower.toFixed(0);

        const manualButton = document.querySelector(`.btn-manual[data-line="${line.id.substring(1)}"]`);
        if (manualButton) {
            manualButton.textContent = 'Return to Auto';
            manualButton.classList.add('btn-warning');
        }
        closeModal();
    };

    // --- RE-ADDED --- Function to handle emergency shutdown
    const emergencyShutdown = () => {
        isEmergencyShutdown = true;
        clearInterval(dataRefreshInterval);

        document.getElementById('summary-status-text').textContent = 'EMERGENCY SHUTDOWN';
        document.getElementById('summary-status-indicator').className = 'status-indicator status-red';
        document.getElementById('summary-alerts').textContent = '0';
        document.getElementById('summary-alerts-indicator').className = 'status-indicator status-green';
        document.getElementById('lines-online').textContent = `0/${feederLines.length}`;
        document.getElementById('total-load').textContent = '0.0';

        feederLines.forEach(line => {
            const lineNumber = line.id.substring(1);
            document.getElementById(`${line.id}-voltage`).textContent = '0.0';
            document.getElementById(`${line.id}-current`).textContent = '0.0';
            document.getElementById(`${line.id}-temp`).textContent = '20.0';
            document.getElementById(`${line.id}-power`).textContent = '0';
            document.getElementById(`${line.id}-status`).className = 'status-indicator status-offline';
            document.getElementById(line.topoId).style.background = 'var(--status-offline)';
            document.getElementById(`line-${lineNumber}`).style.borderLeftColor = 'var(--status-offline)';
            document.getElementById(`${line.id}-signal`).querySelectorAll('.bar').forEach(bar => bar.classList.remove('active'));
        });
        alert('Emergency Shutdown initiated. All lines are de-energized.');
    };

    const startSimulation = () => {
        clearInterval(dataRefreshInterval);
        updateMetrics();
        simulateAlerts();
        updateLastRefreshTime();
        dataRefreshInterval = setInterval(() => {
            updateMetrics();
            simulateAlerts();
            updateLastRefreshTime();
        }, 2000);
    };

    const resetSystem = () => {
        isEmergencyShutdown = false;
        activeAlerts = 0;
        feederLines.forEach(line => {
            line.manualControl = false;
            const manualButton = document.querySelector(`.btn-manual[data-line="${line.id.substring(1)}"]`);
            if (manualButton) {
                manualButton.textContent = 'Manual Control';
                manualButton.classList.remove('btn-warning');
            }
        });
        alert('System is resetting and simulation will restart.');
        startSimulation();
    };

    // --- Event Listeners ---
    document.getElementById('manual-refresh').addEventListener('click', () => {
        if (isEmergencyShutdown) return;
        updateMetrics();
        simulateAlerts();
        updateLastRefreshTime();
    });

    document.getElementById('system-reset').addEventListener('click', resetSystem);
    // --- RE-ADDED --- Event listener for the emergency shutdown button
    document.getElementById('emergency-shutdown').addEventListener('click', emergencyShutdown);
    
    document.querySelectorAll('.btn-manual').forEach(button => {
        button.addEventListener('click', (event) => {
            const lineNumber = event.target.dataset.line;
            const line = feederLines[lineNumber - 1];

            if (line.manualControl) {
                line.manualControl = false;
                button.textContent = 'Manual Control';
                button.classList.remove('btn-warning');
            } else {
                openManualControlModal(line);
            }
        });
    });

    document.getElementById('save-manual-btn').addEventListener('click', saveManualValues);
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-manual-btn').addEventListener('click', closeModal);

    // Initial Start
    startSimulation();
});
// Add this line with your other event listeners
document.getElementById('run-diagnostics').addEventListener('click', runDiagnostics);