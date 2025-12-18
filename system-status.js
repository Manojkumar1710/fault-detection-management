document.addEventListener('DOMContentLoaded', () => {
    // This function uses mock data for demonstration
    function updateSystemHealth() {
        // In a real project, this data would come from a backend API endpoint
        const healthData = {
            apiStatus: '⚡Online',
            dbStatus: '🔌Connected',
            simulationStatus: '▶Running'
        };

        document.getElementById('api-status').textContent = healthData.apiStatus;
        document.getElementById('db-status').textContent = healthData.dbStatus;
        document.getElementById('sim-status').textContent = healthData.simulationStatus;
    }

    updateSystemHealth();
});
