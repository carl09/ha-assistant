import { IDevice, IHomeAssistantArea } from '@ha-assistant/listner';

export const createDevice = async (data: IDevice) => {
  await fetch('api/device', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const updateDevice = async (id: string, data: IDevice) => {
  await fetch(`api/device/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const deleteDevice = async (id: string) => {
  await fetch(`api/device/${id}`, {
    method: 'DELETE',
  });
};

export const getAreas = async (): Promise<IHomeAssistantArea[]> => {
  const resp = await fetch('api/areas');

  return resp.json();
};
