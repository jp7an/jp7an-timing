/**
 * JP7AN Timing System Gateway
 * 
 * This program connects to the Impinj R420 RFID reader and forwards
 * chip readings to the web application API.
 * 
 * The Impinj R420 uses the Low Level Reader Protocol (LLRP) for communication.
 * For production use, you should implement LLRP client or use a library like 'node-llrp'.
 * 
 * This is a basic structure showing how the gateway should work.
 */

require('dotenv').config({ path: '../.env' });
const axios = require('axios');

// Configuration from environment variables
const config = {
  apiUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  readerIp: process.env.IMPINJ_READER_IP || '192.168.1.100',
  readerUsername: process.env.IMPINJ_READER_USERNAME || 'root',
  readerPassword: process.env.IMPINJ_READER_PASSWORD || 'impinj',
  raceId: process.env.CURRENT_RACE_ID || null
};

console.log('JP7AN Timing Gateway Starting...');
console.log('Configuration:', {
  apiUrl: config.apiUrl,
  readerIp: config.readerIp,
  raceId: config.raceId || 'Not set - will need to be configured'
});

/**
 * Send chip reading to the web application API
 */
async function sendChipReading(chipData) {
  if (!config.raceId) {
    console.error('ERROR: CURRENT_RACE_ID not set in environment');
    return;
  }

  try {
    const response = await axios.post(`${config.apiUrl}/api/readings`, {
      raceId: config.raceId,
      chipEpc: chipData.epc,
      timestamp: chipData.timestamp,
      antennaId: chipData.antennaId,
      rssi: chipData.rssi
    });

    console.log('✓ Chip reading sent:', chipData.epc, response.data);
  } catch (error) {
    console.error('✗ Error sending chip reading:', error.message);
    if (error.response) {
      console.error('  Response:', error.response.data);
    }
  }
}

/**
 * Mock function to simulate chip reads for testing
 * In production, this would be replaced with actual LLRP communication
 */
function startMockReader() {
  console.log('\n=== MOCK READER MODE ===');
  console.log('Simulating chip reads every 10 seconds');
  console.log('To use real Impinj reader, implement LLRP protocol');
  console.log('========================\n');

  // Simulate some chip reads
  const mockChips = [
    'E280116060000209F8EF0C41',
    'E280116060000209F8EF0C42',
    'E280116060000209F8EF0C43'
  ];

  let index = 0;
  setInterval(() => {
    const chipData = {
      epc: mockChips[index % mockChips.length],
      timestamp: new Date().toISOString(),
      antennaId: Math.floor(Math.random() * 4) + 1,
      rssi: -45 - Math.random() * 20
    };

    console.log('Mock chip read:', chipData);
    sendChipReading(chipData);

    index++;
  }, 10000);
}

/**
 * Connect to Impinj R420 using LLRP
 * This is a placeholder - actual LLRP implementation needed
 */
function connectToReader() {
  console.log(`\nConnecting to Impinj R420 at ${config.readerIp}...`);
  
  // TODO: Implement LLRP connection
  // For production, use a library like 'node-llrp' or implement LLRP protocol
  // The LLRP protocol allows you to:
  // - Configure reader settings
  // - Start/stop inventory (tag reading)
  // - Receive tag reports in real-time
  // - Configure antenna settings
  
  console.log('LLRP implementation needed for production use');
  console.log('Starting mock reader for testing...\n');
  
  startMockReader();
}

/**
 * Graceful shutdown
 */
process.on('SIGINT', () => {
  console.log('\nShutting down gateway...');
  // TODO: Close LLRP connection properly
  process.exit(0);
});

// Start the gateway
console.log('Starting gateway...\n');
connectToReader();

// Keep the process running
process.stdin.resume();
