import { minimalSetup, EditorView } from 'codemirror';
import { ViewUpdate } from '@codemirror/view';
import { useEffect, useRef } from 'react';
import { autocompletion } from '@codemirror/autocomplete';
import { syntaxHighlighting } from '@codemirror/language';
import {
  completeEntityScope,
  completeServiceScope,
  defaultHighlightStyle,
  defaultTheme,
} from './editor-helpers';
import { EXAMPLE } from '@ha-assistant/lang-ha';
import { EditorState } from '@codemirror/state';

type EditorProps = {
  value: string;
  name: string;
  onChange?: (...event: any[]) => void;
  mode: 'entities' | 'services';
};

export const Editor = ({ value, onChange, mode }: EditorProps) => {
  const editor = useRef<HTMLDivElement>(null);

  let editorView: EditorView;

  useEffect(() => {
    if (editorView) {
      editorView.destroy();
    }

    if (editor.current) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      editorView = new EditorView({
        doc: value,
        extensions: [
          minimalSetup,
          EXAMPLE(),
          autocompletion({
            override: [
              mode === 'entities' ? completeEntityScope : completeServiceScope,
            ],
          }),
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
    };
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
