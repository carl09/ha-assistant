export const DeviceValueFormat = ({
  value,
}: {
  value: boolean | number | string;
}) => {
  if (typeof value === 'number') {
    return <div className="format-number">{value}</div>;
  }
  if (typeof value === 'boolean') {
    return <div className="format-boolean">{value ? 'true' : 'false'}</div>;
  }
  if (typeof value === 'string') {
    return <div className="format-string">{value}</div>;
  }
  return <div className="format-unknown">{value}</div>;
};
