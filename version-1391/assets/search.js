(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function card(movie) {
        return [
            "<article class=\"movie-card\">",
            "<a href=\"" + escapeHtml(movie.url) + "\" class=\"movie-poster\" aria-label=\"" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + escapeHtml(movie.poster) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-badge\">" + escapeHtml(movie.type) + "</span>",
            "<span class=\"poster-year\">" + escapeHtml(movie.year) + "</span>",
            "<span class=\"poster-play\">▶</span>",
            "</a>",
            "<div class=\"movie-info\">",
            "<a href=\"" + escapeHtml(movie.url) + "\" class=\"movie-title\">" + escapeHtml(movie.title) + "</a>",
            "<p>" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function includes(movie, query) {
        var text = [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.oneLine,
            movie.tags.join(" ")
        ].join(" ").toLowerCase();
        return text.indexOf(query) >= 0;
    }

    ready(function () {
        var form = document.querySelector("[data-search-page-form]");
        var input = form ? form.querySelector("input[name='q']") : null;
        var title = document.querySelector("[data-search-title]");
        var results = document.querySelector("[data-search-results]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";

        function render(query) {
            var keyword = query.trim().toLowerCase();
            var matched = keyword
                ? MOVIE_INDEX.filter(function (movie) { return includes(movie, keyword); }).slice(0, 120)
                : MOVIE_INDEX.slice(0, 24);
            if (title) {
                title.textContent = keyword ? "搜索结果" : "精选内容";
            }
            if (results) {
                results.innerHTML = matched.map(card).join("");
            }
        }

        if (input) {
            input.value = initial;
        }
        render(initial);

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var query = input ? input.value.trim() : "";
                var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
                window.history.replaceState(null, "", url);
                render(query);
            });
        }
    });
})();
