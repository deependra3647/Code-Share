import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);

  // --- Initialize CodeMirror only once ---
  useEffect(() => {
    const init = async () => {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById('realtimeEditor'),
        {
          mode: { name: 'javascript', json: true },
          theme: 'dracula',
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);

        if (origin !== 'setValue' && socketRef.current) {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    };

    init();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Safe: runs only once on mount


  // --- Listen for CODE_CHANGE events ---
  useEffect(() => {
    if (!socketRef.current) return;

    const sock = socketRef.current;

    const handler = ({ code }) => {
      if (code !== null && editorRef.current) {
        editorRef.current.setValue(code);
      }
    };

    sock.on(ACTIONS.CODE_CHANGE, handler);

    return () => {
      sock.off(ACTIONS.CODE_CHANGE, handler);
    };

  }, [socketRef]); // socketRef is stable, so this is OK


  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
