import { v4 as uuidv4 } from 'uuid';

export const googleQuery = async (ids: string | string[]) => {
  const deviceIds = typeof ids === 'string' ? [ids] : ids;

  const resp = await fetch('api/fulfillment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: uuidv4(),
      inputs: [
        {
          intent: 'action.devices.QUERY',
          payload: {
            devices: deviceIds.map((x) => {
              return {
                id: x,
              };
            }),
          },
        },
      ],
    }),
  });

  return resp.json();
};
