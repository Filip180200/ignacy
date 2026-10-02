// main.js: wczytuje dane z plików JSON (folder data/), obsługuje menu i animacje.
// Treści NIE zmieniasz tutaj, tylko w plikach data/*.json (patrz README.md).

(function () {
    'use strict';

    document.documentElement.classList.add('js');

    // ==========================================
    // 1. Pomocnicze
    // ==========================================

    // Tworzy element z klasą i tekstem. Tekst wstawiany jest przez textContent,
    // więc nawet nietypowe znaki w JSON-ie nie zepsują strony.
    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function showError(container, isList, message) {
        container.textContent = '';
        var box = el(isList ? 'li' : 'p', 'data-status data-error');
        box.innerHTML = message; // wyłącznie nasz stały tekst, bez danych z JSON
        container.appendChild(box);
    }

    // ==========================================
    // 2. Renderowanie poszczególnych list
    // ==========================================

    var renderers = {
        // data/career.json → oś czasu
        career: function (item) {
            var li = el('li', 'timeline-item');
            if (item.period) li.appendChild(el('p', 'timeline-period', item.period));
            if (item.club) li.appendChild(el('h4', null, item.club));
            var meta = [item.league, item.position].filter(Boolean).join(' · ');
            if (meta) li.appendChild(el('p', 'timeline-meta', meta));
            if (item.description) li.appendChild(el('p', null, item.description));
            return li;
        },

        // data/education.json → lista
        education: function (item) {
            var li = el('li', 'edu-item');
            if (item.period) li.appendChild(el('p', 'edu-period', item.period));
            if (item.degree) li.appendChild(el('h4', null, item.degree));
            if (item.school) li.appendChild(el('p', 'edu-meta', item.school));
            if (item.description) li.appendChild(el('p', null, item.description));
            return li;
        },

        // data/experience.json → karty ze zdjęciem
        experience: function (item) {
            var card = el('article', 'exp-card');
            if (item.image) {
                var img = document.createElement('img');
                img.src = item.image;
                img.alt = item.organization ? 'Zdjęcie: ' + item.organization : '';
                img.loading = 'lazy';
                img.width = 800;
                img.height = 600;
                card.appendChild(img);
            }
            var body = el('div', 'exp-body');
            if (item.period) body.appendChild(el('p', 'exp-period', item.period));
            if (item.organization) body.appendChild(el('h4', null, item.organization));
            if (item.role) body.appendChild(el('p', 'exp-role', item.role));
            if (item.description) body.appendChild(el('p', null, item.description));
            card.appendChild(body);
            return card;
        }
    };

    function loadList(container) {
        var source = container.getAttribute('data-source');
        var render = renderers[container.getAttribute('data-render')];
        var isList = container.tagName === 'UL' || container.tagName === 'OL';

        // Otwarcie pliku z dysku (file://): przeglądarki blokują wczytywanie JSON-ów.
        if (window.location.protocol === 'file:') {
            showError(container, isList,
                'Ta sekcja nie wczyta się przy otwieraniu pliku bezpośrednio z dysku. ' +
                'Uruchom stronę przez serwer lokalny, np. <code>python -m http.server</code>, ' +
                'i wejdź na <code>http://localhost:8000</code> (instrukcja w README.md).');
            return;
        }

        fetch(source, { cache: 'no-cache' })
            .then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(function (items) {
                if (!Array.isArray(items)) throw new Error('Plik nie zawiera listy [ ... ]');
                container.textContent = '';
                items.forEach(function (item) {
                    container.appendChild(render(item));
                });
            })
            .catch(function (error) {
                console.error('Błąd wczytywania ' + source + ':', error);
                var hint = error instanceof SyntaxError
                    ? 'W pliku <code>' + source + '</code> jest błąd składni, najczęściej brakujący lub nadmiarowy przecinek albo cudzysłów.'
                    : 'Nie udało się wczytać pliku <code>' + source + '</code>.';
                showError(container, isList, hint + ' Odśwież stronę, a jeśli problem wraca, sprawdź plik.');
            });
    }

    document.querySelectorAll('[data-source]').forEach(loadList);

    // ==========================================
    // 3. Menu mobilne
    // ==========================================

    var toggle = document.querySelector('.nav-toggle');
    var navList = document.getElementById('nav-list');

    function closeMenu() {
        navList.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
        var open = navList.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navList.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });

    // ==========================================
    // 4. Animacje przy przewijaniu + aktywny link w menu
    // ==========================================

    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach(function (node) { revealObserver.observe(node); });

        var navLinks = navList.querySelectorAll('a');
        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                navLinks.forEach(function (link) {
                    link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('main section[id]').forEach(function (s) { sectionObserver.observe(s); });
    } else {
        reveals.forEach(function (node) { node.classList.add('in-view'); });
    }

    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    // ==========================================
    // 5. Tło: przesuwająca się siatka kwadratów
    // ==========================================

    var canvas = document.getElementById('grid-canvas');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var config = {
        squareSize: 44,
        speed: 0.25,
        lineColor: '#1f1f1f',
        hoverColor: '#161616'
    };
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var offset = 0;
    var mouse = { x: null, y: null };
    var width = 0;
    var height = 0;

    function resize() {
        var dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (reducedMotion) draw();
    }

    function draw() {
        var size = config.squareSize;
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = config.lineColor;
        ctx.lineWidth = 1;

        for (var x = -size; x < width + size; x += size) {
            for (var y = -size; y < height + size; y += size) {
                var sx = x + offset;
                var sy = y + offset;
                if (mouse.x !== null && mouse.x >= sx && mouse.x < sx + size && mouse.y >= sy && mouse.y < sy + size) {
                    ctx.fillStyle = config.hoverColor;
                    ctx.fillRect(sx, sy, size, size);
                }
                ctx.strokeRect(Math.round(sx) + 0.5, Math.round(sy) + 0.5, size, size);
            }
        }

        // winieta: ciemniejsze rogi
        var gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.hypot(width, height) / 2);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    function tick() {
        offset = (offset + config.speed) % config.squareSize;
        draw();
        window.requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    resize();

    if (reducedMotion) {
        draw();
    } else {
        window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
        document.addEventListener('mouseleave', function () { mouse.x = null; mouse.y = null; });
        window.requestAnimationFrame(tick);
    }
})();
