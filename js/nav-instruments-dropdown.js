(function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (wrap) {
    var btn = wrap.querySelector(".nav-dropdown__trigger");
    if (!btn) return;

    function setOpen(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    wrap.addEventListener("mouseenter", function () {
      setOpen(true);
    });

    wrap.addEventListener("mouseleave", function () {
      setOpen(false);
    });

    wrap.addEventListener("focusin", function () {
      setOpen(true);
    });

    wrap.addEventListener("focusout", function (e) {
      if (!wrap.contains(e.relatedTarget)) {
        setOpen(false);
      }
    });
  });
})();
