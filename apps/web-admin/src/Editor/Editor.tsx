import { basicSetup, minimalSetup, EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { ViewUpdate } from '@codemirror/view';
import { useEffect, useRef } from 'react';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import {
  syntaxHighlighting,
  LanguageSupport,
} from '@codemirror/language';
import { myCompletions } from './examples';
import { completeScope } from './editor-helpers';
import { EXAMPLELanguage, EXAMPLE } from '@ha-assistant/lang-ha';
import { logging } from '@ha-assistant/listner';

import { syntaxTree, syntaxTreeAvailable } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { HighlightStyle } from '@codemirror/language';

const defaultHighlightStyle = /*@__PURE__*/ HighlightStyle.define([
  { tag: tags.meta, color: '#7a757a' },
  { tag: tags.link, textDecoration: 'underline' },
  { tag: tags.heading, textDecoration: 'underline', fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.keyword, color: '#708' },
  {
    tag: [
      tags.atom,
      tags.bool,
      tags.url,
      tags.contentSeparator,
      tags.labelName,
    ],
    color: '#219',
  },
  { tag: [tags.literal, tags.inserted], color: '#164' },
  { tag: [tags.string, tags.deleted], color: '#a11' },
  {
    tag: [tags.regexp, tags.escape, /*@__PURE__*/ tags.special(tags.string)],
    color: '#e40',
  },
  { tag: /*@__PURE__*/ tags.definition(tags.variableName), color: '#00f' },
  { tag: /*@__PURE__*/ tags.local(tags.variableName), color: '#30a' },
  { tag: [tags.typeName, tags.namespace], color: '#085' },
  { tag: tags.className, color: '#167' },
  {
    tag: [/*@__PURE__*/ tags.special(tags.variableName), tags.macroName],
    color: '#256',
  },
  { tag: /*@__PURE__*/ tags.definition(tags.propertyName), color: '#00c' },
  { tag: tags.comment, color: '#940' },
  { tag: tags.invalid, color: '#f00' },

  { tag: tags.function(tags.variableName), color: '#6f42c1' },
  { tag: tags.function(tags.propertyName), color: '#fff' },
]);

const updateListenerExtension = EditorView.updateListener.of(
  (update: ViewUpdate) => {
    if (update.docChanged) {
      const doc = update.state.doc;
      const value = doc.toString();
      logging.debug('updateListenerExtension', update, value);

      // const foo = EXAMPLELanguage.syntaxTree(value);
      // const foo = syntaxTree(update.state);
      // console.log(foo);

      syntaxTree(update.state)
        .cursor()
        .iterate((node) => {
          console.log(node.name);
        });

      // const foo2 = syntaxTreeAvailable(update.state);
      // console.log(foo2);

      // console.log('help', foo);

      // Handle the event here
    }
  }
);

export const Editor = () => {
  const editor = useRef<HTMLDivElement>(null);

  let editorView: EditorView;

  useEffect(() => {
    console.log('Edirot Hook', editor);

    if (editorView) {
      editorView.destroy();
    }

    if (editor.current) {
      console.log('defaultHighlightStyle', defaultHighlightStyle);

      // eslint-disable-next-line react-hooks/exhaustive-deps
      editorView = new EditorView({
        // doc: "panic === 'help'",
        // doc: `(defun check-login (name password) ; absolutely secure\n  (if (equal name "admin")\n    (equal password "12345")\n    #t))`,
        doc: 'toInt(sensor.d1_mini_4_humidity.state, "ggg", true, 89.2)',
        extensions: [
          minimalSetup,
          // basicSetup,
          // javascript(),
          EXAMPLE(),
          //   autocompletion({ override: [completeFromGlobalScope] }),
          autocompletion({ override: [completeScope] }),
          //   syntaxHighlighting(myHighlightStyle),
          syntaxHighlighting(defaultHighlightStyle, { fallback: false }),
          updateListenerExtension,
        ],
        parent: editor.current,
      });
    }
  }, [editor]);

  return <div ref={editor}>Hello</div>;
};
