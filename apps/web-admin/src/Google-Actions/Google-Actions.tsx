import { useState } from 'react';
import { Button } from '../Components/Button';
import { mdiSync, mdiRunFast, mdiLinkOff } from '@mdi/js';
import {
  mockDisconnect,
  mockExecuteClimateHeat,
  mockExecuteOnOff,
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

  const onExecuteOnOff = () => {
    mockExecuteOnOff().then((data) => {
      setData(data);
    });
  };

  const onExecuteClimateHeat = () => {
    mockExecuteClimateHeat().then((data) => {
      setData(data);
    });
  }

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
      <Button icon={mdiRunFast} value="EXECUTE OnOff" onClick={() => onExecuteOnOff()} />
      <Button icon={mdiRunFast} value="EXECUTE Climate Heat" onClick={() => onExecuteClimateHeat()} />

      <Dialog open={data} onClose={() => setData(undefined)}>
        <pre>{JSON.stringify(data || {}, null, 2)} </pre>{' '}
      </Dialog>
    </div>
  );
};
