// Language switcher (RU / EN, remembered in ?lang=), reveal-on-scroll animation,
// hand-written hero title, "Add to calendar" menu, countdown to the party, developing polaroids (shake, long press or click), their tilt on scroll
// and the karaoke equalizer.
(() => {
  'use strict';

  // Text for every element with a data-copy attribute, plus the countdown phrases. Values are HTML.
  const COPY = {
    "ru": {
      "copy-0": "KARINA'S BIRTHDAY",
      "copy-1": "Nostalgia",
      "copy-2": "тут, мне, кстати, 2\u00A0года",
      "copy-3": "✦",
      "copy-4": "28\u00A0ноября приглашаю тебя отметить мой день рождения. Будем болтать, играть, петь и\u00A0немного ностальгировать. Буду рада тебя видеть\u00A0— приходи!",
      "copy-5": "Все детали вечера",
      "copy-6": "01",
      "copy-7": "МЕСТО ВСТРЕЧИ",
      "copy-8": "Когда и\u00A0где",
      "copy-9": "КОГДА",
      "copy-10": "28\u00A0ноября\u00A02026",
      "copy-11": "Суббота · 19:00 · время Белграда",
      "copy-12": "ГДЕ",
      "copy-13": "Auditoria Belgrade",
      "copy-14": "Војводе Добрњца\u00A048, Beograd",
      "copy-15": "Открыть карту",
      "copy-16": "pet friendly",
      "copy-17": "Можно приходить с\u00A0хвостиком",
      "copy-18": "02",
      "copy-19": "ДРЕСС-КОД",
      "copy-20": "Dress up",
      "copy-21": "Дресс-код: ностальгия",
      "copy-22": "Приходи в\u00A0том, в\u00A0чём тебе нравится.",
      "copy-23": "А\u00A0если захочешь поддержать тему, добавь в\u00A0образ что-нибудь с\u00A0историей: старые джинсы, пин, любимую футболку или\u00A0деталь, которая напоминает тебе о\u00A0каком-то классном времени.",
      "copy-24": "Любимые трусы, которые всё никак не\u00A0можешь выбросить, тоже считаются. Память же! Показывать необязательно.",
      "copy-25": "Главное\u00A0— чтобы пришёл ты",
      "copy-26": "03",
      "copy-27": "ПРОГРАММА ВЕЧЕРА",
      "copy-28": "Что\u00A0будем делать?",
      "copy-29": "19:30",
      "copy-30": "Quiz\u00A0— Who is?",
      "copy-31": "Отвечаем на\u00A0вопросы, обсуждаем версии и\u00A0иногда просто угадываем. Энциклопедические знания не\u00A0обязательны\u00A0— главное получать удовольствие. Победителю достанется приз!",
      "copy-32": "Есть повод блеснуть",
      "copy-33": "21:30",
      "copy-34": "Karaoke time",
      "copy-35": "Время для\u00A0песен, которые ты обычно поёшь только дома. Для\u00A0начала разыграем пару песен в\u00A0лототроне, а\u00A0дальше\u00A0— по\u00A0настроению. Участие добровольное: подпевать с\u00A0места тоже можно.",
      "copy-36": "Микрофон подождёт",
      "copy-37": "ВЕСЬ ВЕЧЕР · ЗАКУСКИ И\u00A0БАР",
      "copy-38": "В\u00A0зале весь вечер будут закуски, а\u00A0за\u00A0напитками заглядывай на\u00A0бар. Пробуй специальные коктейли, выбирай пиво или\u00A0что-нибудь безалкогольное\u00A0— что\u00A0тебе больше нравится.",
      "copy-39": "04",
      "copy-40": "ПРО ПОДАРКИ",
      "copy-41": "Cheers!",
      "copy-42": "Про подарки",
      "copy-43": "Подарок\u00A0— по\u00A0желанию. Я\u00A0буду рада тебя видеть и\u00A0с\u00A0ним, и\u00A0без\u00A0него!<br/><br/>Если хочется что-то подарить, в\u00A0вишлисте есть идеи. Можно выбрать что-то оттуда, взять его за\u00A0ориентир или\u00A0придумать своё\u00A0— я\u00A0ни\u00A0на\u00A0чём не\u00A0настаиваю.",
      "copy-44": "Посмотреть вишлист",
      "copy-45": "✦",
      "copy-46": "До\u00A0встречи, Карина",
      "copy-47": "28\u00A0NOVEMBER\u00A02026 · BELGRADE",
      "copy-48": "Наверх\u00A0<svg class=\"icon-arrow-up\" viewBox=\"0 0 10 12\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 11V1.5M1.5 5 5 1.5 8.5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
      "copy-49": "нажми, чтобы включить встряхивание",
      "copy-50": "встряхни телефон",
      "copy-51": "зажми, чтобы проявить",
      "copy-52": "нажми",
      "copy-53": "или\u00A0зажми снимок",
      "copy-54": "Добавить в\u00A0календарь",
      "copy-55": "Apple, Outlook и\u00A0другие",
      "copy-56": "Google Календарь",
      // Countdown phrases (not data-copy elements): {time} is replaced with the time left, and the
      // unit words are picked with Intl.PluralRules.
      "countdown-before": "До\u00A0вечера осталось {time}",
      "countdown-during": "Мы уже празднуем!",
      "countdown-after": "Спасибо, что\u00A0были!",
      "countdown-day": { "one": "день", "few": "дня", "many": "дней", "other": "дня" },
      "countdown-hour": { "one": "час", "few": "часа", "many": "часов", "other": "часа" },
      "countdown-minute": { "one": "минута", "few": "минуты", "many": "минут", "other": "минуты" }
    },
    "en": {
      "copy-0": "KARINA'S BIRTHDAY",
      "copy-1": "Nostalgia",
      "copy-2": "by the way, I’m\u00A02\u00A0here",
      "copy-3": "✦",
      "copy-4": "Come celebrate my birthday with me on\u00A028\u00A0November! We’ll catch up, play a\u00A0quiz, sing a\u00A0few songs, and enjoy a\u00A0little nostalgia. I’d love to see you there!",
      "copy-5": "All the evening details",
      "copy-6": "01",
      "copy-7": "WHEN &amp; WHERE",
      "copy-8": "When &amp; where",
      "copy-9": "WHEN",
      "copy-10": "28\u00A0November\u00A02026",
      "copy-11": "Saturday · 7:00\u00A0pm · Belgrade time",
      "copy-12": "WHERE",
      "copy-13": "Auditoria Belgrade",
      "copy-14": "Војводе Добрњца\u00A048, Beograd",
      "copy-15": "Open the map",
      "copy-16": "pet friendly",
      "copy-17": "Your furry plus-one is welcome too.",
      "copy-18": "02",
      "copy-19": "DRESS CODE",
      "copy-20": "Dress up",
      "copy-21": "Dress code: nostalgia",
      "copy-22": "Wear whatever you feel good in.",
      "copy-23": "If you’d like to join in with the theme, add something with a\u00A0story: an old pair of jeans, a\u00A0pin, a\u00A0favourite T-shirt, or a\u00A0detail that takes you back to a\u00A0good time.",
      "copy-24": "That favourite pair of underwear you can’t bring yourself to throw away counts too. Sentimental value! No need to show us.",
      "copy-25": "The main thing is that you’re there",
      "copy-26": "03",
      "copy-27": "THE EVENING’S LINE-UP",
      "copy-28": "What’s the plan?",
      "copy-29": "19:30",
      "copy-30": "Quiz — Who is?",
      "copy-31": "Answer questions, compare theories, and occasionally take a\u00A0wild guess. Encyclopaedic knowledge is optional — having fun is the point. There’s a\u00A0prize for the winner!",
      "copy-32": "Your moment to shine",
      "copy-33": "21:30",
      "copy-34": "Karaoke time",
      "copy-35": "Time for the songs you usually only sing at home. We’ll start by drawing a\u00A0couple of songs from a\u00A0lottery drum, then see where the mood takes us. Joining in is optional: singing along from your seat counts too.",
      "copy-36": "The mic can wait",
      "copy-37": "ALL EVENING · SNACKS &amp; BAR",
      "copy-38": "Snacks will be available in the room all evening, and drinks are at the bar. Try the special cocktails, go for a\u00A0beer, or choose something alcohol-free — whatever you fancy.",
      "copy-39": "04",
      "copy-40": "ABOUT GIFTS",
      "copy-41": "Cheers!",
      "copy-42": "About gifts",
      "copy-43": "Gifts are optional. I’ll be happy to see you with or without one!<br/><br/>If you’d like to bring something, my wishlist has a\u00A0few ideas. Pick something from it, use it as inspiration, or go with your own idea — there’s no obligation.",
      "copy-44": "Take a\u00A0look at my wishlist",
      "copy-45": "✦",
      "copy-46": "See you there, Karina",
      "copy-47": "28\u00A0NOVEMBER\u00A02026 · BELGRADE",
      "copy-48": "Back to top\u00A0<svg class=\"icon-arrow-up\" viewBox=\"0 0 10 12\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 11V1.5M1.5 5 5 1.5 8.5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
      "copy-49": "tap to enable shaking",
      "copy-50": "shake your phone",
      "copy-51": "press and hold to develop",
      "copy-52": "click",
      "copy-53": "or press and hold",
      "copy-54": "Add to calendar",
      "copy-55": "Apple, Outlook and others",
      "copy-56": "Google Calendar",
      "countdown-before": "{time} to\u00A0go",
      "countdown-during": "The party is on!",
      "countdown-after": "Thank you for coming!",
      "countdown-day": { "one": "day", "other": "days" },
      "countdown-hour": { "one": "hour", "other": "hours" },
      "countdown-minute": { "one": "minute", "other": "minutes" }
    }
  };

  const DEFAULT_LANGUAGE = 'ru';
  const PAGE_TITLE = {
    ru: 'Карина · Nostalgia — день рождения',
    en: 'Karina · Nostalgia — Birthday invitation',
  };
  const NAV_LABEL = { ru: 'Язык', en: 'Language' };
  const PHOTO_ALT = { ru: 'Детская фотография Карины', en: 'A childhood photograph of Karina' };
  const REVEAL_SELECTOR = '.section-details, .section-dress, .section-programme, .section-gifts';
  const DEVELOP_LABEL = { ru: 'Проявить снимок', en: 'Develop the photo' };
  // The party, for the "Add to calendar" menu. Times are UTC: 19:00–23:00 in Belgrade (CET, UTC+1).
  // The static .ics files in assets/calendar/ are built from this object by tools/calendar/ics.mjs:
  // after changing it, run `node tools/calendar/ics.mjs build`.
  const EVENT = {
    start: '2026-11-28T18:00:00Z',
    end: '2026-11-28T22:00:00Z',
    timeZone: 'Europe/Belgrade',
    location: 'Auditoria Belgrade, Vojvode Dobrnjca 48, Beograd',
    url: { ru: 'https://wondercarrie.github.io/karina-birthday/', en: 'https://wondercarrie.github.io/karina-birthday/?lang=en' },
    title: { ru: 'День рождения Карины · Nostalgia', en: 'Karina’s Birthday · Nostalgia' },
    description: { ru: 'Квиз, караоке и\u00A0бар.', en: 'A\u00A0quiz, karaoke and drinks.' },
    addressLabel: { ru: 'Адрес:', en: 'Address:' },
    detailsLabel: { ru: 'Все детали:', en: 'All the details:' },
    reminder: '-P1D', // ISO 8601 duration before the start
    // Full description for Google Calendar and the .ics files. It repeats the address because the
    // Google Calendar app on iPhone leaves the location of a template link empty.
    details(language) {
      return `${this.description[language]} ${this.addressLabel[language]} ${this.location}. ` +
        `${this.detailsLabel[language]} ${this.url[language]}`;
    },
  };
  // Values approved in the prototype. The undeveloped look is interpolated to the normal photo.
  const DEVELOP = {
    blur: 0.5, // rem
    brightness: 0.45,
    saturate: 0.15,
    contrast: 0.75,
    tintOpacity: 0.65,
    duration: 3500, // ms, from undeveloped to developed
    tintShare: 0.8, // the tint is gone after this share of the duration
    easing: 'ease-in-out',
    holdDuration: 1000, // ms of long press that develop a photo on touch screens
    sensorTimeout: 1500, // ms to wait for motion data where no permission is needed
  };
  // A shake is SHAKE.peaks peaks of linear acceleration above SHAKE.threshold within
  // SHAKE.window; walking and scrolling stay well below that.
  const SHAKE = {
    threshold: 15, // m/s²
    peaks: 2,
    window: 700, // ms
    peakGap: 80, // ms, one peak is counted once
    cooldown: 450, // ms after a counted shake
    step: 0.35, // share of the development per shake
  };
  // Touch screens: while a polaroid crosses the viewport its angle goes from base − angle (entering
  // at the bottom) to base + angle (leaving at the top) and it shifts from −shift to +shift.
  const TILT = {
    angle: 4, // deg
    shift: 0.375, // rem
    smoothing: 0.85, // 0 follows the scroll at once; closer to 1 catches up more slowly
  };

  // The hero title is written by hand once per page load: a mask with a soft edge, slanted like the
  // script, sweeps over it from left to right. Then the caption fades in.
  const HERO_WRITING = {
    duration: 2200, // ms, writing the title
    delay: 150, // ms after the font and the photo are ready
    softness: 3, // rem, width of the mask edge
    slant: 18, // deg from vertical, the angle of the mask edge
    captionDelay: 200, // ms after the title is written
    captionDuration: 900, // ms
    easing: 'ease-in-out',
    loadTimeout: 1500, // ms; if the font or the photo is not ready by then, both are shown at once
  };

  // Order of the countdown units; the leading ones that are zero are left out.
  const COUNTDOWN_UNITS = [
    { name: 'day', minutes: 1440 },
    { name: 'hour', minutes: 60 },
    { name: 'minute', minutes: 1 },
  ];
  const MINUTE = 60000; // ms

  const copyNodes = [...document.querySelectorAll('[data-copy]')];
  const languageButtons = [...document.querySelectorAll('[data-language]')];
  const languageNav = document.querySelector('.language-navigation');
  const calendar = document.querySelector('.calendar');
  const calendarToggle = calendar.querySelector('.calendar-toggle');
  const calendarMenu = calendar.querySelector('.calendar-menu');
  const calendarICS = calendar.querySelector('[data-calendar="ics"]');
  const calendarGoogle = calendar.querySelector('[data-calendar="google"]');
  const countdown = document.querySelector('.countdown');
  let renderCountdown = () => {};

  // 2026-11-28T18:00:00Z → 20261128T180000Z
  const compactTime = iso => iso.replace(/[-:]/g, '').replace(/\.\d+/, '');

  function googleCalendarURL(language) {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: EVENT.title[language],
      dates: `${compactTime(EVENT.start)}/${compactTime(EVENT.end)}`,
      ctz: EVENT.timeZone,
      location: EVENT.location,
      details: EVENT.details(language),
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  }

  function setLanguage(language, updateURL) {
    if (!COPY[language]) language = DEFAULT_LANGUAGE;

    copyNodes.forEach(node => { node.innerHTML = COPY[language][node.dataset.copy]; });
    document.documentElement.lang = language;
    document.title = PAGE_TITLE[language];
    languageNav.setAttribute('aria-label', NAV_LABEL[language]);
    languageButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    // Photos have a non-empty alt; decorative images keep alt="".
    document.querySelectorAll('img[alt]').forEach(img => {
      if (img.alt) img.alt = PHOTO_ALT[language];
    });
    document.querySelectorAll('.polaroid[role="button"]').forEach(polaroid => {
      polaroid.setAttribute('aria-label', DEVELOP_LABEL[language]);
    });
    calendarICS.href = `assets/calendar/karina-birthday-${language}.ics`;
    calendarGoogle.href = googleCalendarURL(language);
    renderCountdown(false);

    if (updateURL) {
      const url = new URL(location.href);
      url.searchParams.set('lang', language);
      history.replaceState(null, '', url);
    }
  }

  function setUpReveal() {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-hidden');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.03 });

    document.querySelectorAll(REVEAL_SELECTOR).forEach(section => {
      section.classList.add('reveal', 'reveal-hidden');
      observer.observe(section);
    });
  }

  // Polaroids start undeveloped. Desktop: click, Enter or Space develops a photo. Touch screens:
  // a long press develops it; a shake develops the most visible one step by step once motion
  // data is available (on iOS after a tap grants the permission); a plain tap never develops.
  // The interaction mode goes to <html data-develop-mode> and picks the hint text in CSS.
  function setUpDevelop() {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    const isTouch = matchMedia('(pointer: coarse)').matches;
    const hasMotion = typeof DeviceMotionEvent !== 'undefined';
    const needsPermission = hasMotion && typeof DeviceMotionEvent.requestPermission === 'function';
    const shots = [...document.querySelectorAll('.develop')].map(wrap => ({
      polaroid: wrap.querySelector('.polaroid'),
      target: wrap.querySelector('.develop-target'),
      tint: wrap.querySelector('.develop-tint'),
      hint: wrap.querySelector('.develop-hint'),
      progress: 0,
      ratio: 0,
    }));
    let mode = '';

    const lerp = (from, to, t) => from + (to - from) * t;

    function render(shot, ms) {
      const { polaroid, target, tint, hint, progress: p } = shot;
      target.style.transition = ms ? `filter ${ms}ms ${DEVELOP.easing}` : 'none';
      tint.style.transition = ms ? `opacity ${Math.round(ms * DEVELOP.tintShare)}ms ${DEVELOP.easing}` : 'none';
      target.style.filter = p >= 1 ? 'none'
        : `blur(${(DEVELOP.blur * (1 - p)).toFixed(3)}rem) brightness(${lerp(DEVELOP.brightness, 1, p).toFixed(3)}) ` +
          `saturate(${lerp(DEVELOP.saturate, 1, p).toFixed(3)}) contrast(${lerp(DEVELOP.contrast, 1, p).toFixed(3)})`;
      tint.style.opacity = ((1 - p) * DEVELOP.tintOpacity).toFixed(3);
      hint.classList.toggle('is-shown', mode !== 'pending' && p === 0);
      if (p >= 1) {
        ['role', 'tabindex', 'aria-label'].forEach(name => polaroid.removeAttribute(name));
      }
    }

    function advance(shot, by) {
      if (shot.progress >= 1) return;
      const next = Math.min(1, shot.progress + by);
      const ms = Math.round(DEVELOP.duration * (next - shot.progress));
      shot.progress = next;
      render(shot, ms);
    }

    function setMode(next) {
      mode = next;
      root.dataset.developMode = next;
      shots.forEach(shot => shot.hint.classList.toggle('is-shown', mode !== 'pending' && shot.progress === 0));
    }

    // iOS: must be called synchronously inside the tap. The permission covers the whole page.
    let asking = false;
    function askPermission() {
      if (asking) return;
      asking = true;
      DeviceMotionEvent.requestPermission()
        .then(state => setMode(state === 'granted' ? 'shake' : 'hold'))
        .catch(() => setMode('hold'))
        .finally(() => { asking = false; });
    }

    function nudge(polaroid) {
      polaroid.classList.remove('is-nudged');
      void polaroid.offsetWidth; // restarts the animation
      polaroid.classList.add('is-nudged');
    }

    shots.forEach(shot => {
      const { polaroid } = shot;
      let hold = null;
      let pointerType = '';
      let skipClick = false;

      polaroid.setAttribute('role', 'button');
      polaroid.tabIndex = 0;
      polaroid.setAttribute('aria-label', DEVELOP_LABEL[root.lang] || DEVELOP_LABEL[DEFAULT_LANGUAGE]);
      polaroid.style.setProperty('--develop-hold-duration', `${DEVELOP.holdDuration}ms`);
      render(shot, 0);

      function cancelHold() {
        if (!hold) return;
        clearTimeout(hold.timer);
        hold = null;
        polaroid.classList.remove('is-holding');
      }

      polaroid.addEventListener('pointerdown', event => {
        pointerType = event.pointerType;
        skipClick = false;
        if (event.pointerType === 'mouse' || shot.progress >= 1) return;
        cancelHold();
        hold = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          timer: setTimeout(() => {
            hold = null;
            polaroid.classList.remove('is-holding');
            skipClick = true;
            advance(shot, 1);
          }, DEVELOP.holdDuration),
        };
        polaroid.classList.add('is-holding');
      });
      // Moving the finger (scrolling) cancels the long press.
      polaroid.addEventListener('pointermove', event => {
        if (hold && event.pointerId === hold.id && Math.hypot(event.clientX - hold.x, event.clientY - hold.y) > 10) cancelHold();
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => polaroid.addEventListener(type, cancelHold));
      polaroid.addEventListener('contextmenu', event => {
        if (shot.progress < 1) event.preventDefault();
      });

      polaroid.addEventListener('click', () => {
        const touch = pointerType === 'touch' || pointerType === 'pen';
        pointerType = '';
        if (skipClick) { skipClick = false; return; }
        if (shot.progress >= 1) return;
        // Mouse clicks and clicks without a pointer (assistive technology) develop at once.
        if (!touch) advance(shot, 1);
        else if (mode === 'ask') askPermission();
        else nudge(polaroid);
      });
      polaroid.addEventListener('animationend', () => polaroid.classList.remove('is-nudged'));
      polaroid.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        advance(shot, 1);
      });
    });

    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      shots.find(shot => shot.polaroid === entry.target).ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
    }), { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });
    shots.forEach(shot => observer.observe(shot.polaroid));

    let gravity = null;
    let peaks = [];
    let lastPeak = 0;
    let lastShake = 0;
    function onMotion(event) {
      let x, y, z;
      const linear = event.acceleration;
      if (linear && linear.x != null) {
        ({ x, y, z } = linear);
      } else {
        const g = event.accelerationIncludingGravity;
        if (!g || g.x == null) return;
        // No linear acceleration: subtract a low-pass estimate of gravity.
        gravity = gravity
          ? { x: lerp(gravity.x, g.x, 0.2), y: lerp(gravity.y, g.y, 0.2), z: lerp(gravity.z, g.z, 0.2) }
          : { x: g.x, y: g.y, z: g.z };
        x = g.x - gravity.x; y = g.y - gravity.y; z = g.z - gravity.z;
      }
      // Real data arrived, so shaking works (also when the permission was granted earlier).
      if (mode === 'pending' || mode === 'ask') setMode('shake');

      const now = performance.now();
      if (Math.hypot(x, y, z) > SHAKE.threshold && now - lastPeak > SHAKE.peakGap) {
        peaks.push(now);
        lastPeak = now;
      }
      peaks = peaks.filter(time => now - time < SHAKE.window);
      if (peaks.length < SHAKE.peaks || now - lastShake < SHAKE.cooldown) return;
      lastShake = now;
      peaks = [];
      const visible = shots.filter(shot => shot.progress < 1 && shot.ratio > 0).sort((a, b) => b.ratio - a.ratio);
      if (visible.length) advance(visible[0], SHAKE.step);
    }

    if (!isTouch) setMode('click');
    else if (!hasMotion) setMode('hold');
    else {
      window.addEventListener('devicemotion', onMotion);
      if (needsPermission) setMode('ask');
      else {
        // Android and others: no permission, but without data there is no usable sensor.
        setMode('pending');
        setTimeout(() => { if (mode === 'pending') setMode('hold'); }, DEVELOP.sensorTimeout);
      }
    }
  }

  // Scroll tilt of the polaroids on touch screens (the hover lift on desktop is pure CSS). Only
  // polaroids near the viewport are measured, once per frame, and the values go to custom
  // properties that the polaroid transform reads.
  function setUpTilt() {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!matchMedia('(pointer: coarse)').matches) return;

    const items = [...document.querySelectorAll('.polaroid')].map(el => ({ el, near: false, fresh: true, t: 0, shiftPx: 0 }));
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    let frame = 0;
    let lastTime = 0;

    function measure(item) {
      const rect = item.el.getBoundingClientRect();
      const height = item.el.offsetHeight;
      // The rotated box keeps its centre, so only the current shift has to be taken out.
      const centre = (rect.top + rect.bottom) / 2 - item.shiftPx;
      const t = (innerHeight / 2 - centre) / ((innerHeight + height) / 2);
      return Math.max(-1, Math.min(1, t));
    }

    function update(time) {
      frame = 0;
      const dt = lastTime ? Math.min(100, time - lastTime) : 16.7;
      lastTime = time;
      const active = items.filter(item => item.near);
      const targets = active.map(measure);
      const keep = TILT.smoothing ** (dt / 16.7);
      let moving = false;
      active.forEach((item, i) => {
        const target = targets[i];
        item.t = item.fresh ? target : target + (item.t - target) * keep;
        item.fresh = false;
        if (Math.abs(item.t - target) > 0.001) moving = true;
        else item.t = target;
        item.shiftPx = item.t * TILT.shift * rem;
        item.el.style.setProperty('--polaroid-tilt', `${(item.t * TILT.angle).toFixed(3)}deg`);
        item.el.style.setProperty('--polaroid-shift', `${(item.t * TILT.shift).toFixed(4)}rem`);
      });
      if (moving) schedule();
      else lastTime = 0;
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    // A polaroid that comes near the viewport jumps to its position instead of easing in.
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const item = items.find(it => it.el === entry.target);
        if (entry.isIntersecting && !item.near) item.fresh = true;
        item.near = entry.isIntersecting;
      });
      schedule();
    }, { rootMargin: '25% 0px' });

    items.forEach(item => observer.observe(item.el));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
  }

  // "Add to calendar": a disclosure button with two links. Esc, a click outside or focus leaving
  // the menu closes it; Esc returns the focus to the button. Without JavaScript it stays hidden.
  // The title font and the hero photo must be ready first, so the title is not written over an empty
  // block. The box of the title moves right with the mask on it while the title moves left by the same
  // amount, so only the mask edge travels (transforms only). The animations live on the elements, so
  // setLanguage() rewriting their innerHTML neither restarts nor breaks them. At the end the mask and
  // the classes are removed, and the hero is exactly as without the animation.
  function setUpHeroWriting() {
    const hero = document.querySelector('.hero');
    if (!hero.animate || !document.fonts || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const text = hero.querySelector('.hero-text');
    const title = hero.querySelector('.hero-title');
    const caption = hero.querySelector('.hero-caption');
    const photo = hero.querySelector('.hero-img');
    const fontFamily = getComputedStyle(title).fontFamily;
    let animations = [];
    let width = innerWidth;

    function cleanUp() {
      animations.forEach(animation => animation.cancel());
      animations = [];
      text.classList.remove('is-masked');
      text.style.removeProperty('-webkit-mask-image');
      text.style.removeProperty('mask-image');
    }

    // Ink bounds of the title: the swashes reach past its line box.
    function measureInk() {
      const fontSize = parseFloat(getComputedStyle(title).fontSize);
      const context = document.createElement('canvas').getContext('2d');
      context.font = `${fontSize}px ${fontFamily}`;
      const metrics = context.measureText(title.textContent);
      const range = document.createRange();
      range.selectNodeContents(title);
      const line = range.getBoundingClientRect();
      const ascent = metrics.fontBoundingBoxAscent;
      const baseline = line.top + line.height * ascent / (ascent + metrics.fontBoundingBoxDescent);
      return {
        left: line.left - metrics.actualBoundingBoxLeft,
        right: line.left + metrics.actualBoundingBoxRight,
        top: baseline - metrics.actualBoundingBoxAscent,
        bottom: baseline + metrics.actualBoundingBoxDescent,
      };
    }

    function animate(element, keyframes, options) {
      animations.push(element.animate(keyframes, { fill: 'backwards', ...options }));
    }

    function play() {
      const { duration, delay, easing, softness, slant } = HERO_WRITING;
      text.classList.add('is-masked');
      const box = text.getBoundingClientRect();
      const ink = measureInk();
      const soft = softness * parseFloat(getComputedStyle(document.documentElement).fontSize);
      // Position of a point along the gradient line, as CSS lays it out for this angle and box.
      const angle = (90 + slant) * Math.PI / 180;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const length = Math.abs(box.width * sin) + Math.abs(box.height * cos);
      const along = (x, y) => length / 2 + (x - box.left - box.width / 2) * sin - (y - box.top - box.height / 2) * cos;
      const corners = [[ink.left, ink.top], [ink.right, ink.top], [ink.left, ink.bottom], [ink.right, ink.bottom]]
        .map(([x, y]) => along(x, y));
      // At the end the edge is just past the ink; at the start the box is this far to the left.
      const edge = Math.max(...corners);
      const shift = (edge + soft - Math.min(...corners)) / sin;
      const mask = `linear-gradient(${90 + slant}deg, #000 ${edge}px, transparent ${edge + soft}px)`;
      text.style.setProperty('-webkit-mask-image', mask);
      text.style.setProperty('mask-image', mask);

      animate(text, [{ transform: `translateX(${-shift}px)` }, { transform: 'none' }], { duration, delay, easing });
      animate(title, [{ transform: `translateX(${shift}px)` }, { transform: 'none' }], { duration, delay, easing });
      animate(caption, [{ opacity: 0 }, { opacity: 1 }], {
        duration: HERO_WRITING.captionDuration,
        delay: delay + duration + HERO_WRITING.captionDelay,
        easing: 'ease',
      });
      hero.classList.remove('is-writing-pending');
      Promise.all(animations.map(animation => animation.finished)).then(cleanUp, () => {});
    }

    // A new width moves the title, so the measured mask is stale: jump to the end.
    window.addEventListener('resize', () => {
      if (innerWidth === width) return;
      width = innerWidth;
      animations.forEach(animation => animation.finish());
    });

    hero.classList.add('is-writing-pending');
    const ready = Promise.all([
      document.fonts.load(`1em ${fontFamily}`).then(faces => {
        if (!faces.length) throw new Error('The title font is not available');
      }),
      photo.decode(),
    ]);
    const timeout = new Promise((resolve, reject) => setTimeout(reject, HERO_WRITING.loadTimeout));
    Promise.race([ready, timeout]).then(play, () => hero.classList.remove('is-writing-pending'));
  }

  function setUpCalendar() {
    function setOpen(open) {
      calendarToggle.setAttribute('aria-expanded', String(open));
      calendar.classList.toggle('is-open', open);
    }

    calendarToggle.addEventListener('click', () => setOpen(calendarToggle.getAttribute('aria-expanded') !== 'true'));
    calendarMenu.addEventListener('click', event => {
      if (event.target.closest('a')) setOpen(false);
    });
    calendar.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || calendarToggle.getAttribute('aria-expanded') !== 'true') return;
      setOpen(false);
      calendarToggle.focus();
    });
    calendar.addEventListener('focusout', event => {
      if (event.relatedTarget && !calendar.contains(event.relatedTarget)) setOpen(false);
    });
    document.addEventListener('click', event => {
      if (!calendar.contains(event.target)) setOpen(false);
    });
    calendar.hidden = false;
  }

  // Countdown to the party in "When & where". It counts from the UTC times in EVENT, so it is right in
  // any time zone, and shows the minutes left rounded up: it never reads "0 minutes" before the start.
  // It updates exactly when the minute changes and again when the tab comes back, because phones
  // freeze timers in background tabs. Without JavaScript it stays hidden.
  function setUpCountdown() {
    const start = Date.parse(EVENT.start);
    const end = Date.parse(EVENT.end);
    let layout = '';
    let timer = 0;

    function state(time) {
      if (time >= end) return 'after';
      if (time >= start) return 'during';
      return 'before';
    }

    function timeLeft(time) {
      let minutes = Math.ceil((start - time) / MINUTE);
      const units = COUNTDOWN_UNITS.map(unit => {
        const value = Math.floor(minutes / unit.minutes);
        minutes -= value * unit.minutes;
        return { name: unit.name, value };
      });
      return units.slice(units.findIndex(unit => unit.value > 0));
    }

    // Rebuilds the text when the state, the language or the set of units changes; otherwise only
    // swaps the numbers and unit words, and with animate a changed number fades in.
    renderCountdown = animate => {
      const time = Date.now();
      const current = state(time);
      const language = document.documentElement.lang;
      const copy = COPY[language];
      const units = current === 'before' ? timeLeft(time) : [];
      const next = [current, language, ...units.map(unit => unit.name)].join(' ');

      if (next !== layout) {
        layout = next;
        if (current !== 'before') {
          countdown.innerHTML = `<span class="countdown-message">${copy[`countdown-${current}`]}</span>`;
          return;
        }
        const parts = units.map(unit => `<span class="countdown-part" data-unit="${unit.name}">` +
          '<span class="countdown-number"></span>\u00A0<span class="countdown-unit"></span></span>').join(' ');
        const [lead, tail] = copy['countdown-before'].split('{time}').map(text => text.trim());
        countdown.innerHTML = [
          lead && `<span class="countdown-text countdown-lead">${lead}</span>`,
          `<span class="countdown-time">${parts}</span>`,
          tail && `<span class="countdown-text">${tail}</span>`,
        ].filter(Boolean).join(' ');
        animate = false;
      }

      const plural = new Intl.PluralRules(language);
      units.forEach(unit => {
        const part = countdown.querySelector(`[data-unit="${unit.name}"]`);
        const number = part.querySelector('.countdown-number');
        const value = String(unit.value);
        part.querySelector('.countdown-unit').textContent = copy[`countdown-${unit.name}`][plural.select(unit.value)];
        if (number.textContent === value) return;
        number.textContent = value;
        if (animate) {
          number.classList.remove('is-changed');
          void number.offsetWidth; // restarts the animation
          number.classList.add('is-changed');
        }
      });
    };

    function tick() {
      clearTimeout(timer);
      renderCountdown(true);
      // Minute boundaries of the clock are also minute boundaries of the countdown (EVENT is on a whole minute).
      if (state(Date.now()) !== 'after') timer = setTimeout(tick, MINUTE - (Date.now() % MINUTE));
    }

    countdown.addEventListener('animationend', event => event.target.classList.remove('is-changed'));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') tick();
    });
    tick();
    countdown.hidden = false;
  }

  // Karaoke equalizer: animated only while it is in the viewport, to spare phone batteries.
  // Without IntersectionObserver or with reduced motion the bars stay still.
  function setUpEqualizer() {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('is-playing', entry.isIntersecting);
    }));
    document.querySelectorAll('.equalizer').forEach(equalizer => {
      equalizer.classList.add('is-animated');
      observer.observe(equalizer);
    });
  }

  languageButtons.forEach(button => {
    button.addEventListener('click', () => setLanguage(button.dataset.language, true));
  });
  setLanguage(new URLSearchParams(location.search).get('lang') || DEFAULT_LANGUAGE, false);
  setUpCalendar();
  setUpCountdown();
  setUpReveal();
  setUpDevelop();
  setUpTilt();
  setUpHeroWriting();
  setUpEqualizer();
})();
