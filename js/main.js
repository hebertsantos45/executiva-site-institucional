(function () {
  'use strict';

  // =====================
  // Current Year
  // =====================
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // =====================
  // Mobile Menu Toggle
  // =====================
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // =====================
  // Scroll Reveal
  // =====================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const delay = parseInt(entry.target.dataset.delay || '0', 10);
              setTimeout(() => {
                entry.target.classList.add('visible');
              }, delay);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );

      reveals.forEach((el) => {
        if (el.dataset.direction === 'left') el.classList.add('from-left');
        observer.observe(el);
      });
    }
  } else {
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('visible');
    });
  }

  // =====================
  // Stat Counter Animation
  // =====================
  const statCounters = document.querySelectorAll('.stat-counter');
  if (statCounters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statCounters.forEach((el) => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.to || '0', 10);
    const suffix = el.dataset.suffix || '';
    const label = el.dataset.label || '';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(eased * target);

      el.innerHTML =
        '<p class="stat-number">' + current + suffix + '</p>' +
        '<p class="stat-label">' + label + '</p>';

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // =====================
  // Equipment Filtering
  // =====================
  const equipmentCards = document.querySelectorAll('.equipment-card[data-category]');
  const categoryFilters = document.querySelectorAll('.filter-category');
  const brandFilters = document.querySelectorAll('.filter-brand');
  const searchInput = document.getElementById('busca-equipamento');
  const resultsCount = document.getElementById('resultsCount');
  const noResults = document.getElementById('noResults');

  let activeCategory = 'todos';
  let activeBrand = 'todas';

  function updateBrandChips() {
    const available = new Set();
    equipmentCards.forEach((card) => {
      if (activeCategory === 'todos' || card.dataset.category === activeCategory) {
        available.add(card.dataset.brand);
      }
    });

    if (activeBrand !== 'todas' && !available.has(activeBrand)) {
      activeBrand = 'todas';
      brandFilters.forEach((b) => {
        b.className = b.dataset.brand === 'todas'
          ? 'filter-brand chip chip-active'
          : 'filter-brand chip chip-inactive';
      });
    }

    brandFilters.forEach((btn) => {
      if (btn.dataset.brand === 'todas') return;
      btn.style.display = available.has(btn.dataset.brand) ? '' : 'none';
    });
  }

  if (categoryFilters.length) {
    categoryFilters.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.category;
        categoryFilters.forEach((b) => b.className = 'filter-category chip chip-inactive');
        btn.className = 'filter-category chip chip-active';
        updateBrandChips();
        filterEquipment();
      });
    });
  }

  if (brandFilters.length) {
    brandFilters.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeBrand = btn.dataset.brand;
        brandFilters.forEach((b) => b.className = 'filter-brand chip chip-inactive');
        btn.className = 'filter-brand chip chip-active';
        filterEquipment();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterEquipment);
  }

  function filterEquipment() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visible = 0;

    equipmentCards.forEach((card) => {
      const matchCategory = activeCategory === 'todos' || card.dataset.category === activeCategory;
      const matchBrand = activeBrand === 'todas' || card.dataset.brand === activeBrand;
      const matchSearch =
        !query ||
        (card.dataset.name && card.dataset.name.includes(query)) ||
        card.textContent.toLowerCase().includes(query);

      const show = matchCategory && matchBrand && matchSearch;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (resultsCount) {
      resultsCount.textContent = visible + ' equipamento' + (visible !== 1 ? 's' : '') + ' encontrado' + (visible !== 1 ? 's' : '');
    }

    if (noResults) {
      noResults.style.display = visible === 0 ? '' : 'none';
    }
  }

  // Initialize result count with the actual number of cards
  if (equipmentCards.length) filterEquipment();

  // =====================
  // Blog Category Filtering
  // =====================
  const blogCards = document.querySelectorAll('.blog-card[data-category]');
  const blogFilters = document.querySelectorAll('.blog-category-filter');

  if (blogFilters.length && blogCards.length) {
    blogFilters.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.category;
        blogFilters.forEach((b) => { b.className = 'blog-category-filter chip chip-inactive'; });
        btn.className = 'blog-category-filter chip chip-active';

        blogCards.forEach((card) => {
          const show = cat === 'todas' || card.dataset.category === cat;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  // =====================
  // URL Category Params (equipamentos page)
  // =====================
  if (categoryFilters.length) {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('categoria');
    if (cat) {
      const match = document.querySelector('.filter-category[data-category="' + cat + '"]');
      if (match) match.click();
    }
  }

  // =====================
  // Orcamento Form → WhatsApp
  // =====================
  const orcamentoForm = document.getElementById('orcamentoForm');
  if (orcamentoForm) {
    orcamentoForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(orcamentoForm);
      const nome = data.get('nome') || '';
      const empresa = data.get('empresa') || '';
      const email = data.get('email') || '';
      const telefone = data.get('telefone') || '';
      const cidade = data.get('cidade') || '';
      const interesse = data.get('interesse') || '';
      const volume = data.get('volume') || '';
      const mensagem = data.get('mensagem') || '';

      const text =
        'Olá! Gostaria de solicitar um orçamento.\n\n' +
        '*Nome:* ' + nome + '\n' +
        '*Empresa:* ' + empresa + '\n' +
        '*E-mail:* ' + email + '\n' +
        '*Telefone:* ' + telefone + '\n' +
        (cidade ? '*Cidade:* ' + cidade + '\n' : '') +
        '*Equipamento:* ' + interesse + '\n' +
        '*Volume:* ' + volume + '\n' +
        (mensagem ? '*Mensagem:* ' + mensagem : '');

      const url = 'https://api.whatsapp.com/send?phone=5571996363349&text=' + encodeURIComponent(text);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  // =====================
  // Smooth scroll for hash links
  // =====================
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // =====================
  // Sliders (Vantagens, Segmentos) - 3 por vez, auto-rotate
  // =====================
  function initSlider(opts) {
    const track = document.getElementById(opts.trackId);
    if (!track) return;

    const slideCount = track.children.length;
    const dotsWrap = document.getElementById(opts.dotsId);
    const prevBtn = opts.prevSel ? document.querySelector(opts.prevSel) : null;
    const nextBtn = opts.nextSel ? document.querySelector(opts.nextSel) : null;

    let index = 0;
    let interval = null;
    let visible = opts.visibleByBreakpoint();

    function maxIndex() {
      return slideCount - opts.visibleByBreakpoint();
    }

    function render() {
      const percent = (100 / slideCount) * index;
      track.style.transform = 'translateX(-' + percent + '%)';
      if (dotsWrap) {
        for (let i = 0; i < dotsWrap.children.length; i++) {
          dotsWrap.children[i].classList.toggle('advantage-dot--active', i === index);
        }
      }
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (let i = 0; i <= maxIndex(); i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'advantage-dot';
        dot.setAttribute('aria-label', 'Ir para o slide ' + (i + 1));
        if (i === index) dot.classList.add('advantage-dot--active');
        dot.addEventListener('click', () => {
          index = i;
          render();
          restart();
        });
        dotsWrap.appendChild(dot);
      }
    }

    function next() {
      index = index >= maxIndex() ? 0 : index + 1;
      render();
    }

    function prev() {
      index = index <= 0 ? maxIndex() : index - 1;
      render();
    }

    function restart() {
      clearInterval(interval);
      interval = setInterval(next, opts.delay || 4500);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });

    const viewport = track.parentElement;
    if (viewport) {
      viewport.addEventListener('mouseenter', () => clearInterval(interval));
      viewport.addEventListener('mouseleave', restart);
    }

    window.addEventListener('resize', () => {
      const newVisible = opts.visibleByBreakpoint();
      if (newVisible !== visible) {
        visible = newVisible;
        index = Math.min(index, maxIndex());
        buildDots();
      }
      render();
    });

    buildDots();
    render();
    restart();
  }

  const visibleByBreakpoint = function () {
    if (window.matchMedia('(min-width: 1024px)').matches) return 3;
    if (window.matchMedia('(min-width: 640px)').matches) return 2;
    return 1;
  };

  initSlider({
    trackId: 'advantageTrack',
    dotsId: 'advantageDots',
    prevSel: '.advantage-prev',
    nextSel: '.advantage-next',
    delay: 4500,
    visibleByBreakpoint: visibleByBreakpoint
  });

  initSlider({
    trackId: 'segmentTrack',
    dotsId: 'segmentDots',
    prevSel: '.segment-prev',
    nextSel: '.segment-next',
    delay: 5000,
    visibleByBreakpoint: visibleByBreakpoint
  });
})();
