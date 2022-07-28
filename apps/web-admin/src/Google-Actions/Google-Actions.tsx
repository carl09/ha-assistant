import { useState } from 'react';
import { Button } from '../Components/Button';
import { mdiSync, mdiDatabaseSearch, mdiRunFast, mdiLinkOff } from '@mdi/js';
import {
  mockDisconnect,
  mockExecute,
  mockQuery,
  mockSync,
} from '../Services/mock-data';
import { Dialog } from '../Components/Dialog';

export const GoogleActions = () => {
  const [data, setData] = useState<any>();

  const onSync = () => {
    mockSync().then((json) => {
      setData(json);
    });
  };

  const onDisconnect = () => {
    mockDisconnect().then((data) => {
      setData(data);
    });
  };

  const onQuery = () => {
    mockQuery().then((data) => {
      setData(data);
    });
  };

  const onExecute = () => {
    mockExecute().then((data) => {
      setData(data);
    });
  };

  return (
    <div className="form-actions">
      <Button icon={mdiSync} value="SYNC" onClick={() => onSync()} />
      <Button
        icon={mdiLinkOff}
        value="DISCONNECT"
        onClick={() => onDisconnect()}
      />
      {/* <Button
        icon={mdiDatabaseSearch}
        value="QUERY"
        onClick={() => onQuery()}
      /> */}
      <Button icon={mdiRunFast} value="EXECUTE" onClick={() => onExecute()} />

      <Dialog open={data} onClose={() => setData(undefined)}>
        <pre>{JSON.stringify(data || {}, null, 2)} </pre>{' '}
      </Dialog>
    </div>
  );
};
