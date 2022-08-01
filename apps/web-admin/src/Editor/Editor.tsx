import { minimalSetup, EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { useEffect, useRef } from 'react';
import { autocompletion } from '@codemirror/autocomplete';
import {
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language';
import { myCompletions } from './examples';
import { completeScope } from './editor-helpers';


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
        doc: "panic === 'help'",
        extensions: [
          minimalSetup,
          javascript(),
          //   autocompletion({ override: [completeFromGlobalScope] }),
          autocompletion({ override: [completeScope] }),
          //   syntaxHighlighting(myHighlightStyle),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        ],

        parent: editor.current,
      });
    }
  }, [editor]);

  return <div ref={editor}>Hello</div>;
};

