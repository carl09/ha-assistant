export const snakecaseToTitlecase = (value: string): string => {
  const result = value.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const get = <T>(obj: any, path: string, defValue?: T): T | undefined => {
  if (!path) return undefined;
  const pathArray: string[] | null = Array.isArray(path)
    ? path
    : path.match(/([^[.\]])+/g);
  const result =
    pathArray &&
    pathArray.reduce((prevObj, key) => prevObj && prevObj[key], obj);
  return result === undefined ? defValue : result;
};
