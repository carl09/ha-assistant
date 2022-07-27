import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { messages } from '@ha-assistant/listner';
import useWebSocket, { ReadyState } from 'react-use-websocket';

interface IConfig {
  port: number;
  ingressUrl?: string;
  homeAssistaneSocketUri: string;
  homeAssistaneApiKey: string;
}

const config: IConfig = (window as any).config || {};

console.log('window.config', config, location);

export const App = () => {
  const [devices, setDevices] = useState<{ [key: string]: unknown }>();

  const { sendMessage, lastJsonMessage, readyState } =
    useWebSocket<messages>('ws://localhost:8080/ws', {
      shouldReconnect: (e) => {
        return true;
      },
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    });

  useEffect(() => {
    if (lastJsonMessage !== null) {
      console.log('lastJsonMessage', lastJsonMessage);
      if (lastJsonMessage.type === 'devices') {
        setDevices(lastJsonMessage.value);
      }
    }
  }, [lastJsonMessage]);

  // useEffect(() => {
  //   const client = new WebSocket('ws://localhost:8080/ws');

  //   client.onopen = (e) => {
  //     client.send('Hello Server!');
  //   };

  //   client.onmessage = (e) => {
  //     const message: messages = JSON.parse(e.data);
  //     console.log('Message from server ', message);
  //     if (message.type === 'devices') {
  //       setDevices(message.value);
  //     }
  //   };

  //   return () => client.close();
  // }, []);

  useEffect(() => {
    fetch(`api`).then((resp) => {
      resp.json().then((data) => {
        setDevices({
          test: data,
        });
      });
    });
  }, []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <>
      <h1>Hello World {location.hostname}</h1>
      <span>The WebSocket is currently {connectionStatus}</span>

      <p>{JSON.stringify(config)}</p>

      {devices
        ? Object.keys(devices).map((x) => (
            <div key={x}>
              <div>{x}</div>
              <div>
                {/* <pre>{JSON.stringify(devices[x], null, 2)}</pre> */}
                <CodeMirror
                  value={JSON.stringify(devices[x], null, 2)}
                  height="200px"
                  extensions={[json()]}
                />
              </div>
            </div>
          ))
        : ''}
    </>
  );
};

