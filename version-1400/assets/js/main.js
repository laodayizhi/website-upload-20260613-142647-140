(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = qs('.mobile-menu-button');
    var nav = qs('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function initHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('.hero-slide', slider);
    var dots = qsa('.hero-dot', slider);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-index')) || 0;
        show(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function initCatalogFilter() {
    var bar = qs('[data-filter-bar]');
    var list = qs('[data-filter-list]');
    if (!bar || !list) {
      return;
    }
    var keywordInput = qs('[data-filter-keyword]', bar);
    var yearSelect = qs('[data-filter-year]', bar);
    var typeSelect = qs('[data-filter-type]', bar);
    var cards = qsa('[data-movie-card]', list);

    function apply() {
      var keyword = (keywordInput.value || '').trim().toLowerCase();
      var year = yearSelect.value;
      var type = typeSelect.value;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
        var passKeyword = !keyword || text.indexOf(keyword) !== -1;
        var passYear = !year || card.getAttribute('data-year') === year;
        var passType = !type || card.getAttribute('data-type') === type;
        card.classList.toggle('is-filter-hidden', !(passKeyword && passYear && passType));
      });
    }

    keywordInput.addEventListener('input', apply);
    yearSelect.addEventListener('change', apply);
    typeSelect.addEventListener('change', apply);
  }

  function initSearchPage() {
    var app = qs('[data-search-app]');
    var target = qs('[data-search-results]');
    if (!app || !target || !window.SEARCH_MOVIES) {
      return;
    }
    var input = qs('[data-search-input]', app);
    var category = qs('[data-search-category]', app);
    var type = qs('[data-search-type]', app);
    var button = qs('[data-search-button]', app);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function movieHtml(movie) {
      var tags = movie.tags.slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
        '<span class="sr-only">' + escapeHtml(movie.title) + '</span>',
        '<div class="poster-frame">',
        '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\'">',
        '<div class="poster-glow"></div>',
        '<span class="score-badge">' + escapeHtml(movie.rating) + '</span>',
        '</div>',
        '<div class="movie-card-body">',
        '<div class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>',
        '<h3>' + escapeHtml(movie.title) + '</h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</a>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function apply() {
      var keyword = (input.value || '').trim().toLowerCase();
      var categoryValue = category.value;
      var typeValue = type.value;
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.genre, movie.tags.join(' '), movie.oneLine, movie.summary].join(' ').toLowerCase();
        var passKeyword = !keyword || text.indexOf(keyword) !== -1;
        var passCategory = !categoryValue || movie.category === categoryValue;
        var passType = !typeValue || movie.type === typeValue;
        return passKeyword && passCategory && passType;
      }).slice(0, 120);
      target.innerHTML = results.map(movieHtml).join('');
    }

    button.addEventListener('click', apply);
    input.addEventListener('input', apply);
    category.addEventListener('change', apply);
    type.addEventListener('change', apply);
    if (initialQuery) {
      apply();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initCatalogFilter();
    initSearchPage();
  });
})();
