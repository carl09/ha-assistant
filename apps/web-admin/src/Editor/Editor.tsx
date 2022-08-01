import { basicSetup, minimalSetup, EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { ViewUpdate } from '@codemirror/view';
import { useEffect, useRef } from 'react';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  LanguageSupport,
} from '@codemirror/language';
import { myCompletions } from './examples';
import { completeScope } from './editor-helpers';
import { EXAMPLELanguage, EXAMPLE } from '@ha-assistant/lang-ha';
import { logging } from '@ha-assistant/listner';

const updateListenerExtension = EditorView.updateListener.of((update: ViewUpdate) => {
  if (update.docChanged) {
    const doc = update.state.doc;
    const value = doc.toString();
    logging.debug('updateListenerExtension', update, value);

    // const foo = EXAMPLELanguage.parser(value);
    // console.log('help', foo);

    // Handle the event here
  }
});

export const Editor = () => {
  const editor = useRef<HTMLDivElement>(null);

  let editorView: EditorView;

  useEffect(() => {
    console.log('Edirot Hook', editor);

    if (editorView) {
      editorView.destroy();
    }

    if (editor.current) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      editorView = new EditorView({
        // doc: "panic === 'help'",
        // doc: `(defun check-login (name password) ; absolutely secure\n  (if (equal name "admin")\n    (equal password "12345")\n    #t))`,
        doc: 'toInt(sensor.d1_mini_4_humidity.state, "ggg", true, false)',
        extensions: [
          // minimalSetup,
          basicSetup,
          // javascript(),
          EXAMPLE(),
          //   autocompletion({ override: [completeFromGlobalScope] }),
          autocompletion({ override: [completeScope] }),
          //   syntaxHighlighting(myHighlightStyle),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          updateListenerExtension,
        ],
        parent: editor.current,
      });
    }
  }, [editor]);

  return <div ref={editor}>Hello</div>;
};
