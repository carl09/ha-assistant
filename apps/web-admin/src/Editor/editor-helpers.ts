import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { logging } from '@ha-assistant/listner';
import { tags } from '@lezer/highlight';
import { HighlightStyle } from '@codemirror/language';
import { syntaxTree } from '@codemirror/language';
import { EditorView } from '@codemirror/view';

const completePropertyAfter = ['PropertyName', '.', '?.'];
const dontCompleteIn = [
  'TemplateString',
  'LineComment',
  'BlockComment',
  'VariableDefinition',
  'PropertyDefinition',
];

const lookupFunctions: LookupItem[] = [
  {
    label: 'equals',
    detail: 'compare to values',
  },
  {
    label: 'toInt',
    detail: 'converts string to int',
  },
  {
    label: 'toNum',
    detail: 'converts string to number',
    info: 'some really foon info to help me'
  },
];

type LookupItem = {
  label: string;
  detail: string;
  info?: string
};

const asyncCompleteProperties = async (
  from: number,
  name: string
): Promise<CompletionResult> => {
  const res = await fetch(`api/editor/lookup/${name}`);
  const json: string[] | LookupItem[] = await res.json();

  return {
    from,
    options: [
      ...json.map((x: string | LookupItem) => {
        if (typeof x === 'string') {
          return { label: x, type: 'class' };
        }
        return { label: x.label, type: 'class', detail: x.detail, info: x.info };
      }),
    ],
    validFor: /^[\w$]*$/,
  };
};

const asyncCompleteRootProperties = async (
  from: number
): Promise<CompletionResult> => {
  const res = await fetch(`api/editor/lookup`);
  const json: string[] | LookupItem[] = await res.json();

  logging.debug('result', json);

  return {
    from,
    options: [
      ...lookupFunctions.map((x) => {
        return { label: x.label, type: 'function', detail: x.detail, info: x.info };
      }),
      ...json.map((x: string | LookupItem) => {
        if (typeof x === 'string') {
          return { label: x, type: 'class' };
        }
        return { label: x.label, type: 'class', detail: x.detail, info: x.info };
      }),
    ],
    validFor: /^[\w$]*$/,
  };
};

export const completeScope = (
  context: CompletionContext
): Promise<CompletionResult> | null => {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

  if (
    completePropertyAfter.includes(nodeBefore.name) &&
    nodeBefore.parent?.name == 'MemberExpression'
  ) {
    const object = nodeBefore.parent.getChild('Expression');
    if (object?.name == 'VariableName') {
      const from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from;
      const variableName = context.state.sliceDoc(object.from, object.to);
      return asyncCompleteProperties(from, variableName);
    } else if (object?.name == 'MemberExpression') {
      const from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from;
      const variableName = context.state.sliceDoc(object.from, object.to);
      logging.debug('2nd level MemberExpression', variableName);
      return asyncCompleteProperties(from, variableName);
    }
  } else if (nodeBefore.name == 'VariableName') {
    logging.debug('VariableName', nodeBefore.from, context.pos);
    return asyncCompleteRootProperties(nodeBefore.from);
  } else if (context.explicit && !dontCompleteIn.includes(nodeBefore.name)) {
    logging.debug('dontCompleteIn', context.pos);
    return asyncCompleteRootProperties(context.pos);
  }
  return null;
};

export const defaultHighlightStyle = HighlightStyle.define([
  { tag: tags.bool, color: 'var(--gh2-code-boolean)' },
  { tag: tags.string, color: 'var(--gh2-code-string)' },
  { tag: tags.number, color: 'var(--gh2-code-number)' },
  { tag: tags.function(tags.variableName), color: 'var(--gh2-code-function)' },
  { tag: tags.propertyName, color: 'var(--gh2-code-property)' },
  { tag: tags.variableName, color: 'var(--gh2-code-variable)' },
]);

export const defaultTheme = EditorView.baseTheme({
  '.cm-content': {
    border: '1px solid #ced4da',
    borderRadius: 'var(--gh2-border-radius)',
    fontSize: '1rem;',
    padding: '0.375rem 0.75rem',
    backgroundColor: 'field',
  },
});
