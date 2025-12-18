// =============================================================================
// 1. SETUP - Import all necessary packages
// =============================================================================
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Line = require('./models/Line');
const Alert = require('./models/Alert');

// =============================================================================
// 2. INITIALIZE APP & MIDDLEWARE
// =============================================================================
const app = express();
app.use(cors());
app.use(express.json());

// =============================================================================
// 3. DATABASE CONNECTION
// =============================================================================
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected successfully!');
        await seedDatabase();
        runDataSimulation();
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// =============================================================================
// 4. API ROUTES
// =============================================================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/data'));

// =============================================================================
// 5. SIMULATION LOGIC (UPDATED)
// =============================================================================
async function seedDatabase() {
    try {
        if (await Line.countDocuments() === 0) {
            console.log('🌱 No lines found. Seeding initial data...');
            const initialLines = [
                { name: 'Feeder Line 01', location: 'Trivandrum North' },
                { name: 'Feeder Line 02', location: 'Kollam Industrial' },
                { name: 'Feeder Line 03', location: 'Kochi Metro' },
                { name: 'Feeder Line 04', location: 'Palakkad Rural' },
            ];
            await Line.insertMany(initialLines);
            console.log('Database seeded successfully with 4 lines.');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

function runDataSimulation() {
    console.log('⚡ Starting real-time data simulation...');
    setInterval(async () => {
        try {
            const lines = await Line.find();
            for (const line of lines) {
                // Determine the status first
                if (line.status === 'Operational' && Math.random() < 0.05) { // 5% chance to fault
                    line.status = 'Fault';
                    console.log(`SIMULATION: ❗ Fault detected on ${line.name}!`);
                    await new Alert({ lineId: line._id, lineName: line.name }).save();
                } else if (line.status === 'Fault' && Math.random() < 0.20) { // 20% chance to resolve
                    line.status = 'Operational';
                    console.log(`SIMULATION: ✅ Resolving fault on ${line.name}.`);
                    await Alert.findOneAndUpdate({ lineId: line._id, status: 'Active' }, { status: 'Resolved', resolvedTimestamp: Date.now() });
                }

                // Update values based on the status
                if (line.status === 'Operational') {
                    line.voltage = 230.0 + (Math.random() - 0.5) * 10; // ~225V to 235V
                    line.current = 15.0 + (Math.random() - 0.5) * 8;   // ~11A to 19A
                    line.temperature = 45.0 + (Math.random() - 0.5) * 15; // ~37.5°C to 52.5°C
                } else { // If status is 'Fault'
                    line.voltage = 120.0 + (Math.random() - 0.5) * 100; // Drastic voltage drop
                    line.current = 40.0 + (Math.random() - 0.5) * 20;   // Current spike
                    line.temperature = 80.0 + (Math.random() - 0.5) * 20; // Overheating
                }

                // Calculate power (P=V*I) and currentLoad (kW)
                line.power = line.voltage * line.current;
                line.currentLoad = line.power / 1000;

                await line.save();
            }
        } catch (error) {
            console.error('Error during simulation tick:', error);
        }
    }, 5000); // Run simulation every 5 seconds
}

// =============================================================================
// 6. START THE SERVER
// =============================================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});