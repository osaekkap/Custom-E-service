import { createContext, useContext, useReducer, useCallback } from "react";

const ToastContext = createContext(null);

let _id = 0;

function reducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, action.toast];
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const addToast = useCallback((type, message, duration = 5000) => {
    const id = ++_id;
    dispatch({ type: "ADD", toast: { id, type, message } });
    if (duration > 0) {
      setTimeout(() => dispatch({ type: "REMOVE", id }), duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { addToast: () => {}, removeToast: () => {} };
  return ctx;
}

export default ToastContext;
