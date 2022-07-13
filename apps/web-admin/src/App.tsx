import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

// const homeAssistaneApiKey = process.env.HA_API_KEY || '';
// const homeAssistaneSocketUri = process.env.HA_SOCKET_URL || '';

// const socket = getHomeAssistantDataAccess(
//   homeAssistaneSocketUri,
//   homeAssistaneApiKey
// );

console.log('window.config', (window as any).config);

export const App = () => {
  const [devices, setDevices] = useState<{ [key: string]: unknown }>();

  // useEffect(() => {
  //   const deviceStatus$ = getDeviceStatusV2$(socket).subscribe({
  //     next: (d) => {
  //       setDevices(d);
  //     },
  //   });

  //   return () => {
  //     deviceStatus$.unsubscribe();
  //   };
  // }, []);

  useEffect(() => {
    fetch('/api').then((resp) => {
      resp.json().then((data) => {
        setDevices({
          test: data,
        });
      });
    });
  }, []);

  return (
    <>
      <h1>Hello World {location.hostname}</h1>

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

