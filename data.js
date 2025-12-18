const express = require('express');
const router = express.Router();
const Line = require('../models/Line');
const Alert = require('../models/Alert');

// @route   GET /api/data/dashboard
// @desc    Get aggregated data for the main dashboard overview
// @access  Public
router.get('/dashboard', async (req, res) => {
    try {
        const lines = await Line.find();
        const activeAlerts = await Alert.find({ status: 'Active' });

        // Calculate total system load by summing up the load of all operational lines
        const systemLoad = lines.reduce((acc, line) => {
            return line.status === 'Operational' ? acc + line.currentLoad : acc;
        }, 0);

        // Determine overall system status
        const isFault = lines.some(line => line.status === 'Fault');
        const systemStatus = isFault ? 'Fault Detected' : 'Operational';
        
        const dashboardData = {
            systemStatus: systemStatus,
            activeAlerts: activeAlerts.length,
            linesMonitored: lines.length,
            onlineLines: lines.filter(line => line.status !== 'Offline').length,
            systemLoad: parseFloat(systemLoad.toFixed(2)), // Format to 2 decimal places
        };

        res.json(dashboardData);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/data/live-monitor
// @desc    Get status of all individual lines for the live monitor page
// @access  Public
router.get('/live-monitor', async (req, res) => {
    try {
        const lines = await Line.find().sort({ name: 1 });
        res.json(lines);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/data/analytics
// @desc    Get historical data for analytics page (e.g., recent alerts)
// @access  Public
router.get('/analytics', async (req, res) => {
    try {
        // Fetch the last 20 resolved alerts for the analytics page
        const recentAlerts = await Alert.find({ status: 'Resolved' })
            .sort({ resolvedTimestamp: -1 })
            .limit(20);
        res.json(recentAlerts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/data/settings
// @desc    Placeholder for getting system settings
// @access  Public
router.get('/settings', (req, res) => {
    // In a real app, you would fetch settings from a DB or config file
    res.json({
        alertThreshold: 25.0, // in kW
        notificationEmail: 'admin@ksebl.com'
    });
});


module.exports = router;   