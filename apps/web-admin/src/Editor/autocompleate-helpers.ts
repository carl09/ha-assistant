import { Completion, CompletionResult } from '@codemirror/autocomplete';
import { logging } from '@ha-assistant/listner';

type LookupItem = {
  label: string;
  detail: string;
  info?: string;
};

const getEntityDomains = async () => {
  const res = await fetch(`api/editor/entity/domains`);
  const json: string[] | LookupItem[] = await res.json();
  return json;
};

const getEntityDetail = async (name: string) => {
  const res = await fetch(`api/editor/lookup/${name}`);
  const json: string[] | LookupItem[] = await res.json();
  return json;
};

const getBuiltinFunctions = async () => {
  const res = await fetch(`api/editor/builtin/functions`);
  const json: string[] | LookupItem[] = await res.json();
  return json;
};

const toCompletion = (
  item: string | LookupItem,
  type: 'function' | 'class'
): Completion => {
  if (typeof item === 'string') {
    return {
      label: item,
      type,
    };
  }
  return {
    label: item.label,
    type,
    detail: item.detail,
    info: item.info,
  };
};

export const asyncEntityProperties = async (
  from: number,
  name: string
): Promise<CompletionResult> => {
  const json = await getEntityDetail(name);

  return {
    from,
    options: [...json.map((x) => toCompletion(x, 'class'))],
    validFor: /^[\w$]*$/,
  };
};

export const asyncRootEntityProperties = async (
  from: number
): Promise<CompletionResult> => {
  const domains = await getEntityDomains();
  const functions = await getBuiltinFunctions();

  logging.debug('result', domains);

  return {
    from,
    options: [
      ...functions.map((x) => toCompletion(x, 'function')),
      ...domains.map((x) => toCompletion(x, 'class')),
    ],
    validFor: /^[\w$]*$/,
  };
};
