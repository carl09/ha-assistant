import express from 'express';
import chalk from 'chalk'; // Import chalk
import { getConfig } from './config.js';

// --- Helper functions for HA-style logging with colors ---
const log = (level, message, color = chalk.white) => {
  // Use chalk to color the level
  console.log(`[${new Date().toISOString()}] [${color(level)}] ${message}`);
};

const logInfo = (message) => log('INFO', message, chalk.blue); // Blue for INFO
const logWarning = (message) => log('WARNING', message, chalk.yellow); // Yellow for WARNING
const logError = (message) => log('ERROR', message, chalk.red); // Red for ERROR
// --- End helper functions ---

const app = express();

const config = getConfig();

// Use logInfo for informational messages
logInfo(`Node.js SERVER_PORT from config: ${config.port}`);

// Use the port from config if available, otherwise default
const port = config.port || 8099;

logInfo('Node.js application starting...');

// Access options from Home Assistant configuration
const message = process.env.CONFIG_MESSAGE || 'Default message if not set';
if (!process.env.CONFIG_MESSAGE) {
  logWarning('CONFIG_MESSAGE environment variable not set, using default.');
}

app.get('/', (req, res) => {
  logInfo('Received request on /');
  res.send(`Hello from the Azure Ollama add-on! Message: ${message}`);
});

app.listen(port, () => {
  logInfo(`Node.js app listening on port ${port}`);
});

// Handle termination signals
process.on('SIGTERM', () => {
  logInfo('SIGTERM signal received: closing HTTP server');
  // Perform cleanup if necessary
  process.exit(0);
});

process.on('SIGINT', () => {
  logInfo('SIGINT signal received: closing HTTP server');
  // Perform cleanup if necessary
  process.exit(0);
});
