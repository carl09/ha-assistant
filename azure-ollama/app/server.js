import 'dotenv/config';
import express from 'express';
import { logInfo, logWarning } from './logging.js';
import { getConfig } from './config.js';
import { AzureChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const app = express();
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

app.post('/', async (req, res) => {
  logInfo('Received POST request on /');

  


  console.log('Request body:', req.body); // Log the request body

  //   body = {
  //     "model": model,
  //     "messages": [{"role": "user", "content": prompt}],
  //     "stream": False,
  //     "options": {"temperature": DEFAULT_TEMPERATURE, "num_predict": max_tok},
  // }

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

  res.send({
    massage: {
      content: result,
    },
  });
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
