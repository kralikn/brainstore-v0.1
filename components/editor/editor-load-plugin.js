import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { useEffect } from 'react';

export default function EditorLoadPlugin({ onLoad }) {

  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    onLoad(editor);
  }, [editor, onLoad]);

  return null;
}
