# Gateway Program

This directory contains the gateway program that connects to the Impinj R420 RFID reader and forwards chip readings to the web application.

## Installation

```bash
cd gateway
npm install
```

## Configuration

Create a `.env` file in the parent directory with:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
IMPINJ_READER_IP=192.168.1.100
IMPINJ_READER_USERNAME=root
IMPINJ_READER_PASSWORD=impinj
CURRENT_RACE_ID=your-race-id
```

## Running

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Production Implementation

The current implementation includes a mock reader for testing. For production use, you need to:

1. Install LLRP library: `npm install node-llrp` (or similar)
2. Implement LLRP protocol communication in `index.js`
3. Configure reader settings (ROSpec, antenna configuration)
4. Handle tag reports and forward to API

## Impinj R420 Setup

1. Connect the reader to your network
2. Access the web interface at the reader's IP address
3. Configure:
   - Network settings (static IP recommended)
   - Reader mode (appropriate for your use case)
   - Antenna settings (all 4 antennas)
   - Tag filters if needed
4. Note the IP address and credentials for the gateway configuration

## LLRP Protocol

The Impinj R420 uses LLRP (Low Level Reader Protocol) for communication. Key concepts:

- **ROSpec** (Reader Operation Specification): Defines when and how to read tags
- **Tag Reports**: Real-time notifications when tags are read
- **Antenna Configuration**: Settings for each of the 4 antennas
- **GPO/GPI**: General Purpose Input/Output for external triggers

## Testing

The mock reader simulates chip reads every 10 seconds for testing without hardware.
