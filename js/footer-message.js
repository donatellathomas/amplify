/* Footer message areas: Enter clears; Shift+Enter inserts a newline. */
document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.shiftKey) return;
  const el = event.target;
  if (!(el instanceof HTMLTextAreaElement)) return;
  if (!el.classList.contains("footer__message")) return;
  event.preventDefault();
  el.value = "";
});
