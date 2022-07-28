import { useEffect, useRef } from 'react';
import { Button } from './Button';

type DialogProps = {
  children?: React.ReactNode;
  onClose?: () => void;
  onOk?: () => void;
  open?: boolean;
};

export const Dialog = ({ children, onClose, onOk, open }: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (dialogRef.current && open) {
      dialogRef.current.showModal();
    }
  }, [open]);

  const dialogCancelOrClose = () => {
    onClose && onClose();
    dialogRef.current?.close();
  };

  const dialogOk = () => {
    onOk && onOk();
    dialogRef.current?.close();
  };

  return (
    <dialog
      onCancel={() => dialogCancelOrClose()}
      onClose={() => dialogCancelOrClose()}
      ref={dialogRef}
      className="device-delete-dialog"
    >
      {children}
      <div className="form-actions">
        <Button
          value="No"
          isPrimary
          onClick={() => dialogCancelOrClose()}
        ></Button>
        <Button value="Yes" onClick={() => dialogOk()}></Button>
      </div>
    </dialog>
  );
};
