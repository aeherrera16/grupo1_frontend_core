import { useState, useRef, useCallback } from 'react';

export function useConfirm() {
  const [state, setState] = useState({ isOpen: false, title: '', message: '' });
  const resolverRef = useRef(null);

  const confirm = useCallback(({ title, message }) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({ isOpen: true, title, message });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolverRef.current?.(true);
    setState((s) => ({ ...s, isOpen: false }));
  }, []);

  const handleCancel = useCallback(() => {
    resolverRef.current?.(false);
    setState((s) => ({ ...s, isOpen: false }));
  }, []);

  return {
    confirm,
    modalProps: {
      isOpen: state.isOpen,
      title: state.title,
      message: state.message,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  };
}
