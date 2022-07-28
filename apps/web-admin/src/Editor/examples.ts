import { minimalSetup, EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { useEffect, useRef } from 'react';
import { autocompletion } from '@codemirror/autocomplete';
import { logging } from '@ha-assistant/listner';
import { tags } from '@lezer/highlight';
import {
  HighlightStyle,
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language';

import { syntaxTree } from '@codemirror/language';

const completePropertyAfter = ['PropertyName', '.', '?.'];
const dontCompleteIn = [
  'TemplateString',
  'LineComment',
  'BlockComment',
  'VariableDefinition',
  'PropertyDefinition',
];

const completeProperties = (from: number, object: { [key: string]: any }) => {
  const options = [];
  for (const name in object) {
    options.push({
      label: name,
      type: typeof object[name] == 'function' ? 'function' : 'variable',
    });
  }

  logging.debug('completeProperties', options);
  return {
    from,
    options,
    validFor: /^[\w$]*$/,
  };
};

const completeFromGlobalScope = (context: CompletionContext) => {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

  if (
    completePropertyAfter.includes(nodeBefore.name) &&
    nodeBefore.parent?.name == 'MemberExpression'
  ) {
    const object = nodeBefore.parent.getChild('Expression');
    if (object?.name == 'VariableName') {
      const from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from;
      const variableName = context.state.sliceDoc(object.from, object.to);
      if (typeof window[variableName] == 'object')
        return completeProperties(from, window[variableName]);
    }
  } else if (nodeBefore.name == 'VariableName') {
    return completeProperties(nodeBefore.from, window);
  } else if (context.explicit && !dontCompleteIn.includes(nodeBefore.name)) {
    return completeProperties(context.pos, window);
  }
  return null;
};

const myHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#fc6' },
  { tag: tags.comment, color: '#f5d', fontStyle: 'italic' },
]);

// // Our list of completions (can be static, since the editor
// /// will do filtering based on context).

// class, constant, enum, function, interface, keyword, method, namespace, property, text, type, and variable.
const completions = [
  { label: 'equals', type: 'function' },
  { label: 'toInt', type: 'function' },
  { label: 'toNum', type: 'function' },
];

export const myCompletions = (context: any) => {
  const before = context.matchBefore(/\w+/);
  logging.debug('myCompletions', context, before);
  // If completion wasn't explicitly started and there
  // is no word before the cursor, don't open completions.
  if (!context.explicit && !before) return null;
  return {
    from: before ? before.from : context.pos,
    options: completions,
    validFor: /^\w*$/,
  };
};