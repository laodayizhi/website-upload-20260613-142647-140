
(function () {
  const header = document.querySelector('[data-site-header]');
  const toggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  function syncHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (toggle && mobileNav && header) {
    toggle.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('is-open');
      header.classList.toggle('is-open', open);
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    let index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    }));

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const next = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(next);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function filterGrid(gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) {
      return;
    }
    const searchInputs = Array.from(document.querySelectorAll('[data-search-target="' + gridId + '"]'));
    const text = normalize(searchInputs.map(function (input) { return input.value; }).join(' '));
    const regionButton = document.querySelector('[data-chip-group="' + gridId + '"] button.is-active[data-region-filter]');
    const typeButton = document.querySelector('[data-chip-group="' + gridId + '"] button.is-active[data-type-filter]');
    const region = regionButton ? regionButton.getAttribute('data-region-filter') : 'all';
    const type = typeButton ? typeButton.getAttribute('data-type-filter') : 'all';
    const cards = Array.from(grid.children);

    cards.forEach(function (card) {
      const haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
      const matchText = !text || haystack.indexOf(text) !== -1;
      const matchRegion = !region || region === 'all' || card.getAttribute('data-region') === region;
      const matchType = !type || type === 'all' || card.getAttribute('data-type') === type;
      card.classList.toggle('is-hidden', !(matchText && matchRegion && matchType));
    });
  }

  document.querySelectorAll('[data-search-target]').forEach(function (input) {
    const target = input.getAttribute('data-search-target');
    input.addEventListener('input', function () {
      filterGrid(target);
    });
  });

  document.querySelectorAll('[data-chip-group]').forEach(function (group) {
    const target = group.getAttribute('data-chip-group');
    group.addEventListener('click', function (event) {
      const button = event.target.closest('button');
      if (!button) {
        return;
      }
      const attr = button.hasAttribute('data-region-filter') ? 'data-region-filter' : 'data-type-filter';
      Array.from(group.querySelectorAll('button[' + attr + ']')).forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      filterGrid(target);
    });
  });

  const query = new URLSearchParams(window.location.search).get('q');
  if (query) {
    document.querySelectorAll('.page-search').forEach(function (input) {
      input.value = query;
      const target = input.getAttribute('data-search-target');
      if (target) {
        filterGrid(target);
      }
    });
  }
}());
