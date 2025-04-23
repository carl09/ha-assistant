const express = require('express');
const app = express();
const port = 8099; // Default port, can be overridden by options

console.log('Node.js application starting...');

// Access options from Home Assistant configuration
// Use bashio library or environment variables if needed for more complex interactions
const message = process.env.CONFIG_MESSAGE || 'Default message if not set'; 

app.get('/', (req, res) => {
  console.log('Received request on /');
  res.send(`Hello from the Azure Ollama add-on! Message: ${message}`);
});

app.listen(port, () => {
  console.log(`Node.js app listening at http://localhost:${port}`);
});

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  // Perform cleanup if necessary
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  // Perform cleanup if necessary
  process.exit(0);
});
