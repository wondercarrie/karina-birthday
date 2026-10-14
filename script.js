// Language switcher (RU / EN, remembered in ?lang=) and reveal-on-scroll animation.
(() => {
  'use strict';

  // Text for every element with a data-copy attribute. Values are HTML.
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
      "copy-48": "Наверх\u00A0<svg class=\"icon-arrow-up\" viewBox=\"0 0 10 12\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 11V1.5M1.5 5 5 1.5 8.5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"
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
      "copy-48": "Back to top\u00A0<svg class=\"icon-arrow-up\" viewBox=\"0 0 10 12\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 11V1.5M1.5 5 5 1.5 8.5 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"
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

  const copyNodes = [...document.querySelectorAll('[data-copy]')];
  const languageButtons = [...document.querySelectorAll('[data-language]')];
  const languageNav = document.querySelector('.language-navigation');

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

  languageButtons.forEach(button => {
    button.addEventListener('click', () => setLanguage(button.dataset.language, true));
  });
  setLanguage(new URLSearchParams(location.search).get('lang') || DEFAULT_LANGUAGE, false);
  setUpReveal();
})();
