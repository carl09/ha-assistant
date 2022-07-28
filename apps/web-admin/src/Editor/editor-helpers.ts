import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { tags } from '@lezer/highlight';
import { HighlightStyle } from '@codemirror/language';
import { syntaxTree } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import {
  asyncEntityProperties,
  asyncRootEntityProperties,
} from './autocompleate-helpers';

const completePropertyAfter = ['PropertyName', '.', '?.'];
const dontCompleteIn = [
  'TemplateString',
  'LineComment',
  'BlockComment',
  'VariableDefinition',
  'PropertyDefinition',
];

const createAutoCompleate = (
  rootLookup: (from: number) => Promise<CompletionResult>,
  detailLookup: (from: number, name: string) => Promise<CompletionResult>
) => {
  return (context: CompletionContext): Promise<CompletionResult> | null => {
    const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

    if (
      completePropertyAfter.includes(nodeBefore.name) &&
      nodeBefore.parent?.name == 'MemberExpression'
    ) {
      const object = nodeBefore.parent.getChild('Expression');
      if (object?.name == 'VariableName') {
        const from = /\./.test(nodeBefore.name)
          ? nodeBefore.to
          : nodeBefore.from;
        const variableName = context.state.sliceDoc(object.from, object.to);
        return detailLookup(from, variableName);
      } else if (object?.name == 'MemberExpression') {
        const from = /\./.test(nodeBefore.name)
          ? nodeBefore.to
          : nodeBefore.from;
        const variableName = context.state.sliceDoc(object.from, object.to);
        return detailLookup(from, variableName);
      }
    } else if (nodeBefore.name == 'VariableName') {
      return rootLookup(nodeBefore.from);
    } else if (context.explicit && !dontCompleteIn.includes(nodeBefore.name)) {
      return rootLookup(context.pos);
    }
    return null;
  };
};

export const completeEntityScope = createAutoCompleate(
  asyncRootEntityProperties,
  asyncEntityProperties
);

export const completeServiceScope = createAutoCompleate(
  asyncRootEntityProperties,
  asyncEntityProperties
);

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
    color: 'fieldtext',
  },
});
