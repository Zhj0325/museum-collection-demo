export function clickSafe(handler) {
  return (e) => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) return;
    handler(e);
  };
}
