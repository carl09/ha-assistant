import { CompletionContext } from '@codemirror/autocomplete';
import { logging } from '@ha-assistant/listner';

import { syntaxTree } from '@codemirror/language';

const completePropertyAfter = ['PropertyName', '.', '?.'];
const dontCompleteIn = [
  'TemplateString',
  'LineComment',
  'BlockComment',
  'VariableDefinition',
  'PropertyDefinition',
];

const lookupFunctions = ['equals', 'toInt', 'toNum'];

const asyncCompleteProperties = async (from: number, name: string) => {
  const res = await fetch(`/api/editor/lookup/${name}`);
  const json = await res.json();

  return {
    from,
    options: [
      ...json.map((x: string) => {
        return { label: x, type: 'class' };
      }),
    ],
    validFor: /^[\w$]*$/,
  };
};

const asyncCompleteRootProperties = async (from: number) => {
  const res = await fetch(`/api/editor/lookup`);
  const json = await res.json();

  logging.debug('result', json);

  return {
    from,
    options: [
      ...lookupFunctions.map((x) => {
        return { label: x, type: 'function' };
      }),
      ...json.map((x: string) => {
        return { label: x, type: 'class' };
      }),
    ],
    validFor: /^[\w$]*$/,
  };
};

const completeProperties = (from: number, options: any[]) => {
  logging.debug('completeProperties', options);
  return {
    from,
    options,
    validFor: /^[\w$]*$/,
  };
};

export const completeScope = (context: CompletionContext) => {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

  if (
    completePropertyAfter.includes(nodeBefore.name) &&
    nodeBefore.parent?.name == 'MemberExpression'
  ) {
    const object = nodeBefore.parent.getChild('Expression');
    logging.debug('2nd level', object?.name);
    if (object?.name == 'VariableName') {
      const from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from;
      const variableName = context.state.sliceDoc(object.from, object.to);
      //   if (typeof window[variableName] == 'object')

      //   return completeProperties(from, level2);
      return asyncCompleteProperties(from, variableName);
    } else if (object?.name == 'MemberExpression') {
      const from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from;
      const variableName = context.state.sliceDoc(object.from, object.to);
      logging.debug('2nd level MemberExpression', variableName);
      return asyncCompleteProperties(from, variableName);
      //   return completeProperties(from, level3);
    }
  } else if (nodeBefore.name == 'VariableName') {
    logging.debug('VariableName');
    return completeProperties(nodeBefore.from, rootOptions);
  } else if (context.explicit && !dontCompleteIn.includes(nodeBefore.name)) {
    logging.debug('dontCompleteIn');
    return asyncCompleteRootProperties(context.pos);
  }
  return null;
};
