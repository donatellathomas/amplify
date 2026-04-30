(function () {
  var root = document.getElementById("electric-diagram-root");
  if (!root) return;

  var list = document.getElementById("electric-diagram-models-list");
  var searchInput = document.getElementById("diagram-models-search");
  var sortBtn = document.getElementById("diagram-models-sort");
  var filterTrigger = document.getElementById("diagram-filter-trigger");
  var filterPopover = document.getElementById("diagram-filter-popover");
  var filterDropdown = filterTrigger
    ? filterTrigger.closest(".electric-repair-modal__filter-dropdown")
    : null;
  var filterOptions = filterPopover
    ? filterPopover.querySelectorAll("[data-diagram-brand]")
    : [];
  var form = root.querySelector(".electric-repairs-cta__form");

  var sortAsc = true;
  var selectedBrand = null;

  function applyFilters() {
    if (!list) return;
    var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var items = list.querySelectorAll("li");
    for (var i = 0; i < items.length; i++) {
      var li = items[i];
      var key = li.getAttribute("data-model-name") || "";
      var brand = li.getAttribute("data-brand") || "";
      var matchSearch = !q || key.indexOf(q) !== -1;
      var matchBrand =
        selectedBrand === null ? true : brand === selectedBrand;
      li.hidden = !(matchSearch && matchBrand);
    }
  }

  function syncFilterUi() {
    for (var i = 0; i < filterOptions.length; i++) {
      var btn = filterOptions[i];
      var raw = btn.getAttribute("data-diagram-brand") || "";
      var sel =
        raw === "all"
          ? selectedBrand === null
          : selectedBrand === raw;
      btn.setAttribute("aria-checked", sel ? "true" : "false");
      btn.classList.toggle("is-selected", sel);
    }
    if (filterTrigger) {
      filterTrigger.classList.toggle("is-active", selectedBrand !== null);
    }
  }

  function setBrand(raw) {
    if (raw === "all" || raw === "") selectedBrand = null;
    else selectedBrand = raw;
    syncFilterUi();
    applyFilters();
  }

  function openFilter(open) {
    if (!filterPopover || !filterTrigger) return;
    filterPopover.hidden = !open;
    filterTrigger.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function toggleFilter() {
    openFilter(!!filterPopover && filterPopover.hidden);
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
    applyFilters();
  }

  if (list) {
    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    if (filterTrigger && filterPopover) {
      filterTrigger.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleFilter();
      });

      for (var j = 0; j < filterOptions.length; j++) {
        filterOptions[j].addEventListener("click", function () {
          var raw = this.getAttribute("data-diagram-brand");
          setBrand(raw || "all");
          openFilter(false);
        });
      }

      document.addEventListener("click", function () {
        openFilter(false);
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") openFilter(false);
      });

      if (filterDropdown) {
        filterDropdown.addEventListener("click", function (e) {
          e.stopPropagation();
        });
      }
    }

    list.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a || !list.contains(a)) return;
      var href = (a.getAttribute("href") || "").trim();
      if (href === "" || href === "#") {
        e.preventDefault();
      }
    });

    syncFilterUi();
    applyFilters();
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
