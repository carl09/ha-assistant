import 'dotenv/config';
import express from 'express';
import { logInfo, logWarning } from './logging.js';
import { getConfig } from './config.js';
import { AzureChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

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

app.get('/', async (req, res) => {
  logInfo('Received request on /');

  console.log('Request headers:', req.headers); // Log the request headers
  console.log('Request method:', req.method); // Log the request method
  console.log('Request URL:', req.url); // Log the request URL
  console.log('Request query:', req.query); // Log the request query parameters

  const c = config.logins.at(0);

  const model = new AzureChatOpenAI({
    temperature: 0.9,
    azureOpenAIApiKey: c.apikey,
    azureOpenAIEndpoint: c.endpoint,
    azureOpenAIApiDeploymentName: c.model,
    azureOpenAIApiVersion: config.apiVersion,
  });

  const prompt = ChatPromptTemplate.fromTemplate(
    'tell me a joke about {topic}'
  );

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const result = await chain.invoke({ topic: 'cats' });
  logInfo(`Result: ${result}`);

  res.send(`${message} ${result}`);
});

app.get('/api/tags', (req, res) => {
  logInfo('Received request on /api/tags');
  res.send(`'tag1', 'tag2', 'tag3'`);
});

app.post('/api/chat', async (req, res) => {
  logInfo('Received POST request on /');

  console.log('Request body:', req.body); // Log the request body

  const { body } = req;

  //   body = {
  //     "model": model,
  //     "messages": [{"role": "user", "content": prompt}],
  //     "stream": False,
  //     "options": {"temperature": DEFAULT_TEMPERATURE, "num_predict": max_tok},
  // }

  const c =
    config.logins.find((x) => x.model === body.model) || config.logins.at(0);

  logInfo('Using model:', c.model);

  const model = new AzureChatOpenAI({
    temperature: body.options.temperature || 0.9,
    azureOpenAIApiKey: c.apikey,
    azureOpenAIEndpoint: c.endpoint,
    azureOpenAIApiDeploymentName: c.model,
    azureOpenAIApiVersion: config.apiVersion,
  });

  const prompt = ChatPromptTemplate.fromTemplate('{input}');

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const result = await chain.invoke({ input: body.messages.at(0).content });

  console.log('Result:', result); // Log the result

  res.send({
    message: {
      content: result,
    },
  });
});

app.use((req, res, next) => {
  logWarning(`404 Not Found: ${req.method} ${req.originalUrl}`);
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
