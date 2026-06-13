(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');

  if (!form || !input || !results) {
    return;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function card(movie) {
    var tags = [movie.genre, movie.category].filter(Boolean).slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-wrap" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="handlePosterError(this)">',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.category) + '</div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function runSearch(movies, query) {
    var keyword = query.trim().toLowerCase();

    if (!keyword) {
      return movies.slice(0, 24);
    }

    return movies.filter(function (movie) {
      var text = [
        movie.title,
        movie.year,
        movie.region,
        movie.category,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();

      return text.indexOf(keyword) !== -1;
    }).slice(0, 60);
  }

  fetch('assets/data/movies-search.json').then(function (response) {
    return response.json();
  }).then(function (movies) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    input.value = initialQuery;

    function render(query) {
      var found = runSearch(movies, query);
      if (title) {
        title.textContent = query ? '搜索结果：' + query : '推荐影片';
      }
      results.innerHTML = found.map(card).join('') || '<p>没有找到匹配影片，请换一个关键词。</p>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', nextUrl);
      render(query);
    });

    render(initialQuery);
  });
})();
