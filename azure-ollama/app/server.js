import 'dotenv/config';
import express from 'express';
import { logError, logInfo, logWarning } from './logging.js';
import { getConfig } from './config.js';
import { AzureChatOpenAI } from '@langchain/openai';
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  ToolMessage,
} from '@langchain/core/messages';

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
      logWarning(`AIMessage message: ${JSON.stringify(message)}`);
      messages.push(
        new AIMessage({
          content: message.content,
          tool_calls: (message.tool_calls || []).map((tool_call) => {
            return {
              name: tool_call.function.name,
              args: tool_call.function.arguments,
              id: tool_call.function.name,
              type: 'tool_call',
            };
          }),
        })
      );
    } else if (message.role === 'system') {
      messages.push(new SystemMessage(message.content));
    } else if (message.role === 'tool') {
      const id = messages.at(-1)?.tool_calls.at(0)?.id;
      // console.warn(`Tool message id: ${id}`);

      // logWarning(`Unknown role message: ${JSON.stringify(message)}`);

      messages.push(
        new ToolMessage({
          content: message.content,
          tool_call_id: id,
        })
      );
    } else {
      logWarning(`Unknown role: ${message.role}`);
      logWarning(`Unknown role message: ${JSON.stringify(message)}`);
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

  // if (body.tools) {
  //   logInfo(`Tools: ${JSON.stringify(body.tools)}`);
  // }

  const modelWithTools = model.bind({
    tools: (body.tools || []).map((tool) => {
      console.log('Tool:', tool.function.name);
      const t = {
        ...tool,
        function: {
          ...tool.function,
          parameters: {
            type: 'object',
            properties: Object.keys(tool.function.parameters || {}).reduce(
              (acc, key) => {
                const param = tool.function.parameters[key];
                acc[key] = {
                  type: param.type,
                  items:
                    param.type === 'array' ? { type: param.items } : undefined,
                  description: param.description,
                };
                return acc;
              },
              {}
            ),
          },
        },
      };
      return t;
    }),
  });

  const result = await modelWithTools.invoke(messages);

  // console.log('Result:', result.content);

  console.log(
    'Result tool_calls:',
    result.tool_calls,
    JSON.stringify(result.tool_calls)
  );

  const tool_calls = (result.tool_calls || []).map((tool_call, i) => {

    let toolArgs = tool_call.args;

    if ('properties' in tool_call.args) {
      toolArgs = tool_call.args.properties;
    }

    return {
      function: {
        name: tool_call.name,
        arguments: Object.keys(toolArgs).reduce((acc, key) => {
          const param = toolArgs[key];
          acc[key] = param;
          return acc;
        }, {}),
      },
    };
  });

  // console.log(
  //   'Result mapped tool_calls:',
  //   tool_calls,
  //   JSON.stringify(tool_calls)
  // );

  res.send({
    model: c.model,
    created_at: new Date().toISOString(),
    message: {
      role: 'assistant',
      content: result.content,
      tool_calls,
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
