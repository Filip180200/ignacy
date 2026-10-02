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
                // Pusty plik ([]) → cała podsekcja (z nagłówkiem) się chowa.
                var subsection = container.closest('.subsection');
                if (items.length === 0 && subsection) {
                    subsection.hidden = true;
                    return;
                }
                items.forEach(function (item, index) {
                    var node = render(item);
                    node.classList.add('reveal');
                    node.style.setProperty('--i', index % 6);
                    container.appendChild(node);
                    observeReveal(node);
                    if (node.classList.contains('exp-card')) bindTilt(node);
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

    // ==========================================
    // Animacje: pojawianie się przy przewijaniu + przechylanie kart
    // ==========================================

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    var revealObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
        : null;

    function observeReveal(node) {
        if (revealObserver) revealObserver.observe(node);
        else node.classList.add('in-view');
    }

    // Karta lekko przechyla się w stronę kursora (tylko mysz, bez „ogranicz ruch”).
    function bindTilt(card) {
        if (reducedMotion || !finePointer) return;
        card.classList.add('tilt');
        card.addEventListener('pointermove', function (e) {
            var r = card.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width - 0.5;
            var y = (e.clientY - r.top) / r.height - 0.5;
            card.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
            card.style.setProperty('--ry', (x * 5).toFixed(2) + 'deg');
        });
        card.addEventListener('pointerleave', function () {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
    }

    // Kolejność (--i) dla elementów w tej samej grupie, żeby pojawiały się kaskadowo.
    document.querySelectorAll('.reveal').forEach(function (node) {
        var siblings = Array.prototype.filter.call(node.parentNode.children, function (n) {
            return n.classList.contains('reveal');
        });
        node.style.setProperty('--i', siblings.indexOf(node));
        observeReveal(node);
    });
    document.querySelectorAll('.problem-card').forEach(bindTilt);

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
    // klik poza menu zamyka je
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.mobile-nav')) closeMenu();
    });

    // ==========================================
    // 4. Aktywny link w menu, pasek postępu, cień nagłówka
    // ==========================================

    // Menu boczne jak spis rozdziałów: każda kreska wypełnia się w miarę czytania swojej sekcji.
    var chapters = Array.prototype.map.call(document.querySelectorAll('.side-nav a'), function (link) {
        return { line: link.querySelector('.side-line'), section: document.querySelector(link.getAttribute('href')) };
    }).filter(function (c) { return c.line && c.section; });

    var scrollTicking = false;
    function onScroll() {
        if (scrollTicking) return;
        scrollTicking = true;
        window.requestAnimationFrame(function () {
            var max = document.documentElement.scrollHeight - window.innerHeight;

            var readLine = window.innerHeight * 0.6;
            var atBottom = max > 0 && window.scrollY >= max - 2;
            chapters.forEach(function (c) {
                var r = c.section.getBoundingClientRect();
                var p = atBottom ? 1 : Math.min(1, Math.max(0, (readLine - r.top) / r.height));
                c.line.style.setProperty('--p', p.toFixed(3));
            });
            scrollTicking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if ('IntersectionObserver' in window) {
        var navLinks = document.querySelectorAll('.nav-list a, .side-nav a');
        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                navLinks.forEach(function (link) {
                    link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('main section[id]').forEach(function (s) { sectionObserver.observe(s); });
    }

    // ==========================================
    // Okno kontaktu
    // ==========================================

    var dialog = document.getElementById('kontakt-okno');
    var mailLink = dialog.querySelector('.contact-mail');
    var email = mailLink.getAttribute('href').replace(/^mailto:/, '');
    // adres wpisuje się tylko w linku .contact-mail, przycisk „Napisz e-mail” bierze go stąd
    dialog.querySelector('[data-mail-link]').setAttribute('href', 'mailto:' + email);

    function openContact() {
        if (typeof dialog.showModal !== 'function') {
            window.location.href = 'mailto:' + email; // bardzo stare przeglądarki
            return;
        }
        closeMenu();
        dialog.classList.remove('is-closing');
        dialog.showModal();
    }
    function closeContact() {
        if (!dialog.open) return;
        if (reducedMotion) { dialog.close(); return; }
        dialog.classList.add('is-closing');
        window.setTimeout(function () {
            dialog.classList.remove('is-closing');
            dialog.close();
        }, 280);
    }

    document.querySelectorAll('[data-contact-open]').forEach(function (btn) {
        btn.addEventListener('click', openContact);
    });
    dialog.querySelector('[data-contact-close]').addEventListener('click', closeContact);
    // klik w przyciemnione tło zamyka okno
    dialog.addEventListener('click', function (e) {
        if (e.target === dialog) closeContact();
    });
    // Esc: zamknięcie z animacją zamiast natychmiastowego
    dialog.addEventListener('cancel', function (e) {
        e.preventDefault();
        closeContact();
    });

    var copyBtn = dialog.querySelector('[data-copy-mail]');
    copyBtn.addEventListener('click', function () {
        var done = function () {
            copyBtn.textContent = 'Skopiowano ✓';
            window.setTimeout(function () { copyBtn.textContent = 'Kopiuj adres'; }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(email).then(done, function () { window.prompt('Skopiuj adres:', email); });
        } else {
            window.prompt('Skopiuj adres:', email);
        }
    });

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
        speed: 0.25,          // prędkość przesuwania siatki
        parallax: reducedMotion ? 0 : 0.12, // jak mocno siatka reaguje na przewijanie strony
        lineColor: '#1f1f1f',
        trailColor: '184, 149, 94', // kolor śladu za kursorem (RGB akcentu)
        trailFade: 0.94       // im bliżej 1, tym dłużej ślad gaśnie
    };
    var offset = 0;
    var mouse = { x: null, y: null };
    var trail = {};           // podświetlone kratki: "kolumna,wiersz" → jasność 0–1
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
        // przesunięcie siatki: ruch w czasie + paralaksa przy przewijaniu
        var ox = offset;
        var oy = (offset - window.scrollY * config.parallax) % size;
        if (oy < 0) oy += size;

        ctx.clearRect(0, 0, width, height);

        // ślad za kursorem: kratka pod myszą rozjaśnia się i powoli gaśnie
        if (mouse.x !== null) {
            var key = Math.floor((mouse.x - ox) / size) + ',' + Math.floor((mouse.y - oy) / size);
            trail[key] = 1;
        }
        Object.keys(trail).forEach(function (k) {
            var alpha = trail[k];
            var parts = k.split(',');
            ctx.fillStyle = 'rgba(' + config.trailColor + ',' + (alpha * 0.16).toFixed(3) + ')';
            ctx.fillRect(parts[0] * size + ox, parts[1] * size + oy, size, size);
            trail[k] = alpha * config.trailFade;
            if (trail[k] < 0.02) delete trail[k];
        });

        ctx.strokeStyle = config.lineColor;
        ctx.lineWidth = 1;
        for (var x = -size; x < width + size; x += size) {
            for (var y = -size; y < height + size; y += size) {
                ctx.strokeRect(Math.round(x + ox) + 0.5, Math.round(y + oy) + 0.5, size, size);
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
