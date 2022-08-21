import { minimalSetup, EditorView } from 'codemirror';
import { ViewUpdate } from '@codemirror/view';
import { useEffect, useRef } from 'react';
import { autocompletion } from '@codemirror/autocomplete';
import { syntaxHighlighting } from '@codemirror/language';
import {
  completeEntityScope,
  completeServiceScope,
  createAutoCompleate,
  defaultHighlightStyle,
  defaultTheme,
} from './editor-helpers';
import { EXAMPLE } from '@ha-assistant/lang-ha';
import { EditorState } from '@codemirror/state';
import { toCompletion } from './autocompleate-helpers';
import { logging } from '@ha-assistant/listner';

type EditorProps = {
  value?: string;
  name: string;
  onChange?: (...event: any[]) => void;
  mode: 'entities' | 'services';
  extraRootItems?: { [key: string]: string[] };
};

export const Editor = ({
  value,
  onChange,
  mode,
  extraRootItems,
  name,
}: EditorProps) => {
  const editor = useRef<HTMLDivElement>(null);

  // console.log(`Editor ${name}`, value);

  let editorView: EditorView;

  useEffect(() => {
    if (editorView) {
      editorView.destroy();
    }

    if (editor.current) {
      const autoCompletionHints =
        mode === 'entities' ? [completeEntityScope] : [completeServiceScope];

      if (extraRootItems) {
        const root = (from: number) => {
          return {
            from,
            options: Object.keys(extraRootItems).map((x) =>
              toCompletion(x, 'class')
            ),
            validFor: /^[\w$]*$/,
          };
        };

        const node = (from: number, name: string) => {
          // logging.debug('extraRootItems.node', extraRootItems, name);
          return {
            from,
            options:
              name in extraRootItems
                ? extraRootItems[name].map((x) => toCompletion(x, 'function'))
                : [],
            validFor: /^[\w$]*$/,
          };
        };

        autoCompletionHints.push(createAutoCompleate(root, node));
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
      editorView = new EditorView({
        doc: value,
        extensions: [
          minimalSetup,
          EXAMPLE(),
          autocompletion({
            override: autoCompletionHints,
          }),
          syntaxHighlighting(defaultHighlightStyle, { fallback: false }),
          updateListenerExtension,

          // EditorState.transactionFilter.of((tr) => {
          //   return tr.newDoc.lines > 1 ? [] : [tr];
          // }),
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

        // console.log(`updateListenerExtension.Editor`, value);

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
