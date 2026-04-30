(function () {
  var root = document.getElementById("electric-repairs-root");
  var searchInput = root && root.querySelector(".electric-repair-modal__search-input");
  var list = root && root.querySelector(".electric-repair-modal__list");

  if (list) {
    function filterList(query) {
      var q = query.trim().toLowerCase();
      var items = list.querySelectorAll("li");
      for (var i = 0; i < items.length; i++) {
        var li = items[i];
        var text = li.textContent.toLowerCase();
        li.hidden = Boolean(q && text.indexOf(q) === -1);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        filterList(searchInput.value);
      });
    }

    list.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a && list.contains(a)) {
        e.preventDefault();
      }
    });
  }

  var ctaForm = document.querySelector(".electric-repairs-cta__form");
  if (ctaForm) {
    ctaForm.addEventListener("submit", function (e) {
      e.preventDefault();
    });
  }
})();
