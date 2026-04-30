(function () {
  var root = document.getElementById("electric-repairs-root");
  if (!root) return;

  var searchInput = root.querySelector(".electric-repair-modal__search-input");
  var list = root.querySelector(".electric-repair-modal__list");
  var filterTrigger = root.querySelector("#repairs-filter-trigger");
  var filterPopover = root.querySelector("#repairs-filter-popover");
  var filterDropdown = root.querySelector(".electric-repair-modal__filter-dropdown");
  var filterOptions = filterPopover
    ? filterPopover.querySelectorAll("[data-repairs-tier]")
    : [];

  var selectedTier = null;

  function trailingStarCount(text) {
    var m = String(text).trim().match(/\*+$/);
    return m ? m[0].length : 0;
  }

  function applyFilters() {
    if (!list) return;
    var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var items = list.querySelectorAll("li");
    for (var i = 0; i < items.length; i++) {
      var li = items[i];
      var text = li.textContent;
      var lower = text.toLowerCase();
      var stars = trailingStarCount(text);
      var matchSearch = !q || lower.indexOf(q) !== -1;
      var matchTier =
        selectedTier === null ? true : stars === selectedTier;
      li.hidden = !(matchSearch && matchTier);
    }
  }

  function syncFilterUi() {
    for (var i = 0; i < filterOptions.length; i++) {
      var btn = filterOptions[i];
      var tierRaw = btn.getAttribute("data-repairs-tier");
      var checked =
        tierRaw === "all"
          ? selectedTier === null
          : selectedTier === parseInt(tierRaw, 10);
      btn.setAttribute("aria-checked", checked ? "true" : "false");
      btn.classList.toggle("is-selected", checked);
    }
    if (filterTrigger) {
      filterTrigger.classList.toggle("is-active", selectedTier !== null);
    }
  }

  function setTier(raw) {
    if (raw === "all" || raw === "") selectedTier = null;
    else selectedTier = parseInt(raw, 10) || null;
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
          var tier = this.getAttribute("data-repairs-tier");
          setTier(tier);
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

  var ctaForm = document.querySelector(".electric-repairs-cta__form");
  if (ctaForm) {
    ctaForm.addEventListener("submit", function (e) {
      e.preventDefault();
    });
  }
})();
