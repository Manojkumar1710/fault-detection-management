document.addEventListener('DOMContentLoaded', () => {
    loadAnalyticsData();
});

async function loadAnalyticsData() {
    try {
        const response = await fetch('http://localhost:5000/api/data/analytics');
        if (!response.ok) throw new Error('Network response was not ok');
        const alerts = await response.json();

        const tableBody = document.getElementById('analytics-table-body');
        tableBody.innerHTML = ''; // Clear existing rows

        if (alerts.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No historical alert data found.</td></tr>';
            return;
        }

        alerts.forEach(alert => {
            const row = document.createElement('tr');
            
            const detectedDate = new Date(alert.timestamp).toLocaleString();
            const resolvedDate = alert.resolvedTimestamp ? new Date(alert.resolvedTimestamp).toLocaleString() : 'N/A';

            row.innerHTML = `
                <td>${alert.type}</td>
                <td>${alert.lineName}</td>
                <td>${detectedDate}</td>
                <td>${resolvedDate}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        const tableBody = document.getElementById('analytics-table-body');
        tableBody.innerHTML = '<tr><td colspan="4" class="error-message">Could not load analytics data from the server.</td></tr>';
    }
}