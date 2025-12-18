document.addEventListener('DOMContentLoaded', () => {

    // --- Utility Function to update the clock ---
    const updateSystemTime = () => {
        const timeElement = document.getElementById('system-time');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleTimeString('en-IN', { hour12: false });
        }
    };
    setInterval(updateSystemTime, 1000);
    updateSystemTime();

    // --- Data & Chart Configuration ---
    const feederLines = [
        { id: 'l1', name: 'Feeder Line 01', location: 'Trivandrum North' },
        { id: 'l2', name: 'Feeder Line 02', location: 'Kollam Industrial' },
        { id: 'l3', name: 'Feeder Line 03', location: 'Kochi Metro' },
        { id: 'l4', name: 'Feeder Line 04', location: 'Palakkad Rural' }
    ];

    const gridContainer = document.getElementById('live-monitor-grid');
    const chartInstances = {}; // To store the Chart.js objects
    const lineChartData = {}; // To store the historical data for each line's graph
    const MAX_DATA_POINTS = 20; // How many data points to show on the graph at once

    /**
     * Creates the initial HTML structure and Chart.js instances for each line.
     */
    const initializeGraphs = () => {
        gridContainer.innerHTML = ''; // Clear placeholder cards

        feederLines.forEach(line => {
            // Create the data storage for this line's graph
            lineChartData[line.id] = {
                labels: [],
                voltage: [],
                current: [],
                temperature: []
            };

            // Create the HTML card that will hold the details and the graph canvas
            const card = document.createElement('div');
            card.className = 'live-graph-card';
            card.id = `graph-card-${line.id}`;
            card.innerHTML = `
                <div class="graph-details">
                    <h3 class="line-name">${line.name}</h3>
                    <p class="line-location">${line.location}</p>
                    <div class="graph-metrics">
                        <div class="data-point">
                            <span class="data-label">Voltage:</span>
                            <span class="data-value" id="val-volt-${line.id}">--- V</span>
                        </div>
                        <div class="data-point">
                            <span class="data-label">Current:</span>
                            <span class="data-value" id="val-curr-${line.id}">--- A</span>
                        </div>
                        <div class="data-point">
                            <span class="data-label">Temp:</span>
                            <span class="data-value" id="val-temp-${line.id}">--- °C</span>
                        </div>
                    </div>
                </div>
                <div class="chart-wrapper">
                    <canvas id="chart-${line.id}"></canvas>
                </div>
            `;
            gridContainer.appendChild(card);

            // Create and configure the Chart.js graph instance
            const ctx = document.getElementById(`chart-${line.id}`).getContext('2d');
            chartInstances[line.id] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: lineChartData[line.id].labels,
                    datasets: [
                        { 
                            label: 'Voltage (V)', 
                            data: lineChartData[line.id].voltage, 
                            borderColor: 'rgba(54, 162, 235, 1)', 
                            backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            tension: 0.3, 
                            yAxisID: 'y',
                            fill: false,
                            pointRadius: 2,
                            pointHoverRadius: 4
                        },
                        { 
                            label: 'Current (A)', 
                            data: lineChartData[line.id].current, 
                            borderColor: 'rgba(255, 206, 86, 1)', 
                            backgroundColor: 'rgba(255, 206, 86, 0.1)',
                            tension: 0.3, 
                            yAxisID: 'y1',
                            fill: false,
                            pointRadius: 2,
                            pointHoverRadius: 4
                        },
                        { 
                            label: 'Temp (°C)', 
                            data: lineChartData[line.id].temperature, 
                            borderColor: 'rgba(255, 99, 132, 1)', 
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            tension: 0.3, 
                            yAxisID: 'y1',
                            fill: false,
                            pointRadius: 2,
                            pointHoverRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: { 
                        legend: { 
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#e2e8f0',
                                font: {
                                    size: 11
                                },
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(45, 55, 72, 0.95)',
                            titleColor: '#f7fafc',
                            bodyColor: '#e2e8f0',
                            borderColor: 'rgba(99, 179, 237, 0.5)',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: { 
                            ticks: { 
                                display: false,
                                color: '#a0aec0'
                            }, 
                            grid: { 
                                color: 'rgba(255,255,255,0.1)',
                                drawBorder: false
                            }
                        },
                        y: { 
                            position: 'left', 
                            grid: { 
                                color: 'rgba(255,255,255,0.1)',
                                drawBorder: false
                            }, 
                            suggestedMin: 230, 
                            suggestedMax: 250, 
                            ticks: { 
                                color: '#a0aec0',
                                font: {
                                    size: 10
                                }
                            },
                            title: {
                                display: true,
                                text: 'Voltage (V)',
                                color: '#a0aec0',
                                font: {
                                    size: 10
                                }
                            }
                        },
                        y1: { 
                            type: 'linear',
                            display: true,
                            position: 'right', 
                            grid: { 
                                drawOnChartArea: false,
                                color: 'rgba(255,255,255,0.1)',
                                drawBorder: false
                            }, 
                            suggestedMin: 0, 
                            suggestedMax: 60, 
                            ticks: { 
                                color: '#a0aec0',
                                font: {
                                    size: 10
                                }
                            },
                            title: {
                                display: true,
                                text: 'Current (A) / Temp (°C)',
                                color: '#a0aec0',
                                font: {
                                    size: 10
                                }
                            }
                        }
                    },
                    elements: {
                        line: {
                            borderWidth: 2
                        }
                    }
                }
            });
        });
    };

    /**
     * Generates new simulated data and updates both the text details and the graphs.
     */
    const updateLiveMonitor = () => {
        feederLines.forEach(line => {
            // --- DATA SIMULATION ---
            const voltage = (Math.random() * 10 + 235);
            const current = (Math.random() * 15 + 10);
            const temperature = (Math.random() * 25 + 30);
            const hasFault = voltage > 242 || current > 22 || temperature > 50;
            const timeLabel = new Date().toLocaleTimeString('en-IN', { hour12: false });
            
            // --- UPDATE TEXT DETAILS ---
            const voltageElement = document.getElementById(`val-volt-${line.id}`);
            const currentElement = document.getElementById(`val-curr-${line.id}`);
            const tempElement = document.getElementById(`val-temp-${line.id}`);
            const cardElement = document.getElementById(`graph-card-${line.id}`);
            
            if (voltageElement) voltageElement.textContent = `${voltage.toFixed(1)} V`;
            if (currentElement) currentElement.textContent = `${current.toFixed(1)} A`;
            if (tempElement) tempElement.textContent = `${temperature.toFixed(1)} °C`;
            
            if (cardElement) {
                cardElement.classList.toggle('fault', hasFault);
            }

            // --- UPDATE GRAPH DATA ---
            const data = lineChartData[line.id];
            data.labels.push(timeLabel);
            data.voltage.push(voltage);
            data.current.push(current);
            data.temperature.push(temperature);

            // Keep the graph from getting too crowded by removing the oldest data point
            if (data.labels.length > MAX_DATA_POINTS) {
                data.labels.shift();
                data.voltage.shift();
                data.current.shift();
                data.temperature.shift();
            }

            // Redraw the chart with the new data
            if (chartInstances[line.id]) {
                chartInstances[line.id].update('none'); // 'none' for smooth animation
            }
        });
    };

    // --- ERROR HANDLING ---
    const handleError = (error) => {
        console.error('Live Monitor Error:', error);
        // You could display error messages to users here
    };

    // --- INITIALIZATION ---
    try {
        initializeGraphs(); // Set up the page structure and charts first
        updateLiveMonitor(); // Populate with the first set of data
        setInterval(updateLiveMonitor, 3000); // Refresh every 3 seconds
    } catch (error) {
        handleError(error);
    }

    // --- CLEANUP ON PAGE UNLOAD ---
    window.addEventListener('beforeunload', () => {
        Object.values(chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
    });
});