// import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
// import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
// import {
//   BatchSpanProcessor,
//   NodeTracerProvider,
// } from '@opentelemetry/sdk-trace-node';

const isDevelopment = process.env.NODE_ENV !== 'production';

// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Create a trace exporter
const traceExporter = new OTLPTraceExporter({
  url: 'http://192.168.10.2:4318/v1/traces',
  // url: 'http://192.168.10.2:4318',
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: isDevelopment ? 'ha-assistant-dev' : 'ha-assistant',
  }),
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry

// sdk.start();



// sdk
//   .start()
//   .then(() => {
//     console.log('OpenTelemetry SDK started');
//   })
//   .catch((err) => {
//     console.error('Error starting OpenTelemetry SDK', err);
//   });

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error: Error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});


// const exporter = new ZipkinExporter({
//   url: 'http://192.168.10.2:9411/api/v2/spans',
// });

// const tracerProvider = new NodeTracerProvider({
//   spanProcessors: [new BatchSpanProcessor(exporter)],
// });

// const tracer = tracerProvider.getTracer(
//   isDevelopment ? 'ha-assistant-dev' : 'ha-assistant'
// );

// tracerProvider.register({

// })

export default sdk;