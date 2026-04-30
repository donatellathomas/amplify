(function () {
  var root = document.getElementById("electric-diagram-root");
  if (!root) return;

  var list = document.getElementById("electric-diagram-models-list");
  var searchInput = document.getElementById("diagram-models-search");
  var sortBtn = document.getElementById("diagram-models-sort");
  var form = root.querySelector(".electric-repairs-cta__form");

  var sortAsc = true;

  function applySearch() {
    if (!list) return;
    var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var items = list.querySelectorAll("li");
    for (var i = 0; i < items.length; i++) {
      var li = items[i];
      var key = li.getAttribute("data-model-name") || "";
      var match = !q || key.indexOf(q) !== -1;
      li.hidden = !match;
    }
  }

  function sortList() {
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll("li"));
    items.sort(function (a, b) {
      var ak = (a.getAttribute("data-model-name") || "").toLowerCase();
      var bk = (b.getAttribute("data-model-name") || "").toLowerCase();
      if (ak < bk) return sortAsc ? -1 : 1;
      if (ak > bk) return sortAsc ? 1 : -1;
      return 0;
    });
    sortAsc = !sortAsc;
    for (var i = 0; i < items.length; i++) {
      list.appendChild(items[i]);
    }
    if (sortBtn) {
      sortBtn.setAttribute(
        "aria-label",
        sortAsc ? "Sort models A–Z" : "Sort models Z–A"
      );
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
  }

  if (sortBtn) {
    sortBtn.addEventListener("click", sortList);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });
  }
})();
