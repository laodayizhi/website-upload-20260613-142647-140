(function () {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-overlay"><span class="poster-play">▶</span></span>',
      '    <span class="card-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="card-year">' + escapeHtml(movie.year) + '</span>',
      '  </a>',
      '  <div class="movie-info">',
      '    <h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '    <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '    <div class="movie-bottom"><span class="score">★ ' + escapeHtml(movie.score) + '</span><a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a></div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function setupSearch() {
    var data = window.SEARCH_MOVIES || [];
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var yearSelect = document.querySelector("[data-search-year]");
    var regionSelect = document.querySelector("[data-search-region]");
    var results = document.querySelector("[data-search-results]");
    if (!form || !input || !results) {
      return;
    }

    var years = Array.from(new Set(data.map(function (item) { return item.year; }).filter(Boolean))).sort().reverse();
    var regions = Array.from(new Set(data.map(function (item) { return item.region; }).filter(Boolean))).sort();
    years.slice(0, 60).forEach(function (year) {
      yearSelect.insertAdjacentHTML("beforeend", '<option value="' + escapeHtml(year) + '">' + escapeHtml(year) + '</option>');
    });
    regions.forEach(function (region) {
      regionSelect.insertAdjacentHTML("beforeend", '<option value="' + escapeHtml(region) + '">' + escapeHtml(region) + '</option>');
    });

    var current = params();
    input.value = current.get("q") || "";
    yearSelect.value = current.get("year") || "";
    regionSelect.value = current.get("region") || "";

    function render() {
      var q = input.value.trim().toLowerCase();
      var year = yearSelect.value.trim();
      var region = regionSelect.value.trim();
      var matched = data.filter(function (movie) {
        var text = [movie.title, movie.oneLine, movie.region, movie.genre, movie.tags, movie.year, movie.type].join(" ").toLowerCase();
        if (q && text.indexOf(q) === -1) {
          return false;
        }
        if (year && movie.year !== year) {
          return false;
        }
        if (region && movie.region !== region) {
          return false;
        }
        return true;
      }).slice(0, 96);

      if (!q && !year && !region) {
        return;
      }

      if (!matched.length) {
        results.innerHTML = '<div class="empty-state"><h2>未找到相关内容</h2><p>试试其他关键词，或者浏览我们的分类频道。</p><a class="primary-button" href="categories.html">返回分类</a></div>';
        return;
      }

      results.innerHTML = '<div class="section-heading compact"><span>Search</span><h2>搜索结果</h2></div><div class="movie-grid">' + matched.map(movieCard).join("") + '</div>';
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var next = new URLSearchParams();
      if (input.value.trim()) {
        next.set("q", input.value.trim());
      }
      if (yearSelect.value) {
        next.set("year", yearSelect.value);
      }
      if (regionSelect.value) {
        next.set("region", regionSelect.value);
      }
      history.replaceState(null, "", "search.html" + (next.toString() ? "?" + next.toString() : ""));
      render();
    });

    [input, yearSelect, regionSelect].forEach(function (element) {
      element.addEventListener("change", function () {
        form.dispatchEvent(new Event("submit"));
      });
    });

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupSearch);
  } else {
    setupSearch();
  }
})();
