import chalk from 'chalk'; // Import chalk

// --- Helper functions for HA-style logging with colors ---
const log = (level, message, color = chalk.white) => {
  // Use chalk to color the level
  console.log(`[${new Date().toISOString()}] [${color(level)}] ${message}`);
};

export const logInfo = (message) => log('INFO', message, chalk.blue); // Blue for INFO
export const logWarning = (message) => log('WARNING', message, chalk.yellow); // Yellow for WARNING
export const logError = (message) => log('ERROR', message, chalk.red); // Red for ERROR