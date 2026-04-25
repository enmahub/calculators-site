(function () {
  "use strict";

  function pathDepth(pagePath) {
    const normalized = String(pagePath || "")
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");
    if (!normalized) {
      return 0;
    }
    const parts = normalized.split("/");
    return Math.max(parts.length - 1, 0);
  }

  function hrefToTarget(pagePath, targetFromRoot) {
    const depth = pathDepth(pagePath);
    const prefix = depth > 0 ? "../".repeat(depth) : "";
    const norm = String(targetFromRoot || "")
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");
    return prefix + norm;
  }

  function normPagePath() {
    const fromHtml = document.documentElement.getAttribute("data-page-path");
    if (fromHtml != null && fromHtml !== "") {
      return fromHtml.replace(/\\/g, "/").replace(/^\/+/, "");
    }
    const wrap = document.querySelector("[data-site-search]");
    const fromWrap = wrap && wrap.getAttribute("data-page-path");
    return String(fromWrap || "")
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");
  }

  function tokenize(q) {
    return String(q || "")
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function haystack(it) {
    return [it.t, it.h, it.c, it.u, it.l].join(" ").toLowerCase();
  }

  function matches(it, tokens) {
    const h = haystack(it);
    for (let i = 0; i < tokens.length; i += 1) {
      if (h.indexOf(tokens[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  function sortResults(items, prefLang) {
    const pref = prefLang === "es" ? "es" : "en";
    return items.slice().sort((a, b) => {
      const ap = a.l === pref ? 0 : 1;
      const bp = b.l === pref ? 0 : 1;
      if (ap !== bp) {
        return ap - bp;
      }
      return (a.h || a.t).localeCompare(b.h || b.t, undefined, { sensitivity: "base" });
    });
  }

  function debounce(fn, ms) {
    let t;
    return function debounced() {
      const ctx = this;
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(ctx, args);
      }, ms);
    };
  }

  function initRoot(wrap) {
    const input = wrap.querySelector(".site-search-input");
    const dropdown = wrap.querySelector(".site-search-dropdown");
    const indexUrl = wrap.getAttribute("data-search-index");
    const prefLang = wrap.getAttribute("data-pref-lang") || "en";
    const pagePath = normPagePath();

    if (!input || !dropdown || !indexUrl) {
      return;
    }

    let items = [];
    let loaded = false;
    let loadError = false;

    function noResultsLabel() {
      return (
        wrap.getAttribute("data-no-results") ||
        (prefLang === "es" ? "Sin resultados" : "No matches")
      );
    }

    function setOpen(open) {
      dropdown.hidden = !open;
      input.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function loadIndex() {
      if (loaded || loadError) {
        return;
      }
      fetch(indexUrl, { credentials: "same-origin" })
        .then(function (r) {
          if (!r.ok) {
            throw new Error("search index");
          }
          return r.json();
        })
        .then(function (data) {
          items = Array.isArray(data.items) ? data.items : [];
          loaded = true;
          // First input often fires before fetch finishes; re-run so the dropdown appears.
          runSearch();
        })
        .catch(function () {
          loadError = true;
          input.placeholder = prefLang === "es" ? "Búsqueda no disponible" : "Search unavailable";
          input.disabled = true;
        });
    }

    function renderList(matchesList) {
      dropdown.textContent = "";
      if (!matchesList.length) {
        const empty = document.createElement("div");
        empty.className = "site-search-empty";
        empty.textContent = noResultsLabel();
        dropdown.appendChild(empty);
        return;
      }
      const max = 14;
      const slice = matchesList.slice(0, max);
      for (let i = 0; i < slice.length; i += 1) {
        const it = slice[i];
        const a = document.createElement("a");
        a.className = "site-search-item";
        a.href = hrefToTarget(pagePath, it.u);
        a.setAttribute("role", "option");

        const lang = document.createElement("span");
        lang.className = "site-search-lang";
        lang.textContent = it.l === "es" ? "ES" : "EN";

        const text = document.createElement("span");
        text.className = "site-search-item-text";
        text.textContent = it.h || it.t;

        const cat = document.createElement("span");
        cat.className = "site-search-item-cat";
        cat.textContent = it.c || "";

        a.appendChild(lang);
        a.appendChild(text);
        if (cat.textContent) {
          a.appendChild(cat);
        }
        dropdown.appendChild(a);
      }
    }

    function runSearch() {
      if (!loaded) {
        loadIndex();
        return;
      }
      const tokens = tokenize(input.value);
      if (!tokens.length) {
        dropdown.textContent = "";
        setOpen(false);
        return;
      }
      const hits = [];
      for (let i = 0; i < items.length; i += 1) {
        if (matches(items[i], tokens)) {
          hits.push(items[i]);
        }
      }
      const sorted = sortResults(hits, prefLang);
      renderList(sorted);
      setOpen(true);
    }

    const debounced = debounce(runSearch, 160);

    input.addEventListener("focus", function () {
      loadIndex();
    });

    input.addEventListener("input", function () {
      debounced();
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        setOpen(false);
        input.blur();
      }
    });

    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) {
        setOpen(false);
      }
    });

    input.addEventListener("blur", function () {
      setTimeout(function () {
        const active = document.activeElement;
        if (active && dropdown.contains(active)) {
          return;
        }
        if (!wrap.contains(active)) {
          setOpen(false);
        }
      }, 120);
    });
  }

  document.querySelectorAll("[data-site-search]").forEach(initRoot);
})();
