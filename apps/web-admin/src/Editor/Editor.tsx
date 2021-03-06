import { minimalSetup, EditorView } from 'codemirror';
import { ViewUpdate } from '@codemirror/view';
import { useEffect, useRef } from 'react';
import { autocompletion } from '@codemirror/autocomplete';
import { syntaxHighlighting } from '@codemirror/language';
import { completeScope, defaultHighlightStyle, defaultTheme } from './editor-helpers';
import { EXAMPLE } from '@ha-assistant/lang-ha';
import { logging } from '@ha-assistant/listner';
import { EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

type EditorProps = {
  value: string;
  name: string;
  onChange?: (...event: any[]) => void;
}

export const Editor = ({value, onChange}: EditorProps) => {
  const editor = useRef<HTMLDivElement>(null);

  let editorView: EditorView;

  useEffect(() => {
    if (editorView) {
      editorView.destroy();
    }

    if (editor.current) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      editorView = new EditorView({
        doc: value, // 'toInt(sensor.d1_mini_4_humidity.state, "ggg", true, 89.2)',
        extensions: [
          minimalSetup,
          EXAMPLE(),
          autocompletion({ override: [completeScope] }),
          syntaxHighlighting(defaultHighlightStyle, { fallback: false }),
          updateListenerExtension,

          EditorState.transactionFilter.of((tr) => {
            return tr.newDoc.lines > 1 ? [] : [tr];
          }),
          defaultTheme,
        ],
        parent: editor.current,
      });
    }
    return () => {
      if (editorView) {
        editorView.destroy();
      }
    }
  }, [editor]);

  const updateListenerExtension = EditorView.updateListener.of(
    (update: ViewUpdate) => {
      if (update.docChanged) {
        const doc = update.state.doc;
        const value = doc.toString();

        onChange && onChange(value);

        // const expressionsArray: string[] = [];
        // syntaxTree(update.state)
        //   .cursor()
        //   .iterate((node) => {
        //     expressionsArray.push(node.name);
        //   });
        // logging.debug('expressionsArray', expressionsArray);
      }
    }
  );

  return <div ref={editor}></div>;
};
