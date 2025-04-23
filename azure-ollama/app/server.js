import 'dotenv/config';
import express from 'express';
import { logError, logInfo, logWarning } from './logging.js';
import { getConfig } from './config.js';
import { AzureChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const config = getConfig();
// Use the port from config if available, otherwise default
const port = config.port || 8099;

// Access options from Home Assistant configuration
const message = process.env.CONFIG_MESSAGE || 'Default message if not set';
if (!process.env.CONFIG_MESSAGE) {
  logWarning('CONFIG_MESSAGE environment variable not set, using default.');
}

app.get('/api/tags', (req, res) => {
  logInfo('Received request on /api/tags');

  res.send({
    models: config.logins.map((x) => ({
      name: x.model,
      model: x.model,
    })),
  });

  // res.send({
  //   models: [
  //     {
  //       name: 'gpt-4o',
  //       model: 'gpt-4o',
  //     },
  //   ],
  // });
});

app.post('/api/chat', async (req, res) => {
  logInfo('Received POST request on /');

  console.log('Request body:', req.body); // Log the request body

  const { body } = req;

  const messages = [];

  for (const message of body.messages) {
    if (message.role === 'user') {
      messages.push(new HumanMessage(message.content));
    } else if (message.role === 'assistant') {
    } else if (message.role === 'system') {
      messages.push(new SystemMessage(message.content));
    } else {
      logWarning(`Unknown role: ${message.role}`);
      continue;
    }
  }

  const c =
    config.logins.find((x) => x.model === body.model) || config.logins.at(0);

  logInfo(`Using model: ${c.model}`);

  const model = new AzureChatOpenAI({
    temperature: body.options.temperature || 0.9,
    azureOpenAIApiKey: c.apikey,
    azureOpenAIEndpoint: c.endpoint,
    azureOpenAIApiDeploymentName: c.model,
    azureOpenAIApiVersion: config.apiVersion,
  });

  const chain = model.pipe(new StringOutputParser());

  const result = await chain.invoke(messages);

  console.log('Result:', result);

  res.send({
    model: c.model,
    created_at: new Date().toISOString(),
    message: {
      role: 'assistant',
      content: result,
    },
  });
});

app.use((req, res, next) => {
  logError(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).send("Sorry, can't find that!");
});

logInfo('Node.js application starting...');

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
