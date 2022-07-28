export const mockSync = async () => {
  const resp = await fetch('api/fulfillment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      inputs: [
        {
          intent: 'action.devices.SYNC',
        },
      ],
    }),
  });

  return resp.json();
};

export const mockDisconnect = async () => {
  const resp = await fetch('api/fulfillment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      inputs: [
        {
          intent: 'action.devices.DISCONNECT',
        },
      ],
    }),
  });

  return resp.json();
};

export const mockQuery = async () => {
  const resp = await fetch('api/fulfillment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      inputs: [
        {
          intent: 'action.devices.QUERY',
          payload: {
            devices: [
              {
                id: '123',
                customData: {
                  fooValue: 74,
                  barValue: true,
                  bazValue: 'foo',
                },
              },
              {
                id: '456',
                customData: {
                  fooValue: 12,
                  barValue: false,
                  bazValue: 'bar',
                },
              },
            ],
          },
        },
      ],
    }),
  });

  return resp.json();
};

export const mockExecute = async () => {
  const resp = await fetch('api/fulfillment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      inputs: [
        {
          intent: 'action.devices.EXECUTE',
          payload: {
            commands: [
              {
                devices: [
                  {
                    id: '123',
                    customData: {
                      fooValue: 74,
                      barValue: true,
                      bazValue: 'sheepdip',
                    },
                  },
                  {
                    id: '456',
                    customData: {
                      fooValue: 36,
                      barValue: false,
                      bazValue: 'moarsheep',
                    },
                  },
                ],
                execution: [
                  {
                    command: 'action.devices.commands.OnOff',
                    params: {
                      on: true,
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
  });

  return resp.json();
};
