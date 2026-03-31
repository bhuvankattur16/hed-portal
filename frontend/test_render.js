const fs = require('fs');
const code = fs.readFileSync('src/components/AdminDashboard.jsx', 'utf8');

// Simple regex to find any metrics.xyz that isn't defined
const metricsMatches = code.match(/metrics\.([a-zA-Z_]+)/g) || [];
const uniqueMetrics = [...new Set(metricsMatches.map(m => m.split('.')[1]))];
console.log('Metrics properties used:', uniqueMetrics);

// Check if all used metrics exist in initial state
const initialStateMatch = code.match(/metrics, setMetrics\] = useState\(\{([\s\S]*?)\}\);/);
if (initialStateMatch) {
    const initialStateStr = initialStateMatch[1];
    uniqueMetrics.forEach(metric => {
        if (!initialStateStr.includes(metric)) {
            console.log('WARNING: Metric used but NOT found in initial state:', metric);
        }
    });
}
