import { useEffect, useState } from 'react';
import { getHomeAssistantDataAccess } from '@ha-assistant/listner';
import { getDeviceStatusV2$ } from './services/devices-state';

const homeAssistaneApiKey = process.env.HA_API_KEY || '';
const homeAssistaneSocketUri = process.env.HA_SOCKET_URL || '';

const socket = getHomeAssistantDataAccess(
  homeAssistaneSocketUri,
  homeAssistaneApiKey
);

export const App = () => {
  const [devices, setDevices] = useState<{ [key: string]: unknown }>();

  useEffect(() => {
    const deviceStatus$ = getDeviceStatusV2$(socket).subscribe({
      next: (d) => {
        setDevices(d);
      },
    });

    return () => {
      deviceStatus$.unsubscribe();
    };
  }, []);

  return (
    <>
      <h1>Hello World</h1>

      {devices
        ? Object.keys(devices).map((x) => (
            <div key={x}>
              <div>{x}</div>
              <div>
                <pre>{JSON.stringify(devices[x], null, 2)}</pre>
              </div>
            </div>
          ))
        : ''}
    </>
  );
};
