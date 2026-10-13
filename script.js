// Language switcher (RU / EN, remembered in ?lang=) and reveal-on-scroll animation.
(() => {
  'use strict';

  // Text for every element with a data-copy attribute. Values are HTML.
  const COPY = {
    "ru": {
      "copy-0": "KARINA'S BIRTHDAY",
      "copy-1": "Nostalgia",
      "copy-2": "тут, мне, кстати, 2 года",
      "copy-3": "✦",
      "copy-4": "28 ноября приглашаю тебя отметить мой день рождения. Будем болтать, играть, петь и немного ностальгировать. Буду рада тебя видеть — приходи!",
      "copy-5": "Все детали вечера",
      "copy-6": "01",
      "copy-7": "МЕСТО ВСТРЕЧИ",
      "copy-8": "Когда и где",
      "copy-9": "КОГДА",
      "copy-10": "28 ноября 2026",
      "copy-11": "Суббота · 19:00 · время Белграда",
      "copy-12": "ГДЕ",
      "copy-13": "Auditoria Belgrade",
      "copy-14": "Војводе Добрњца 48, Beograd",
      "copy-15": "Открыть карту",
      "copy-16": "pet friendly",
      "copy-17": "Можно приходить с хвостиком",
      "copy-18": "02",
      "copy-19": "ДРЕСС-КОД",
      "copy-20": "Dress up",
      "copy-21": "Дресс-код: ностальгия",
      "copy-22": "Приходи в том, в чём тебе нравится.",
      "copy-23": "А если захочешь поддержать тему, добавь в образ что-нибудь с историей: старые джинсы, пин, любимую футболку или деталь, которая напоминает тебе о каком-то классном времени.",
      "copy-24": "Любимые трусы, которые всё никак не можешь выбросить, тоже считаются. Память же! Показывать необязательно.",
      "copy-25": "Главное — чтобы пришёл ты",
      "copy-26": "03",
      "copy-27": "ПРОГРАММА ВЕЧЕРА",
      "copy-28": "Что будем делать?",
      "copy-29": "19:30",
      "copy-30": "Quiz — Who is?",
      "copy-31": "Отвечаем на вопросы, обсуждаем версии и иногда просто угадываем. Энциклопедические знания не обязательны — главное получать удовольствие. Победителю достанется приз!",
      "copy-32": "Есть повод блеснуть",
      "copy-33": "21:30",
      "copy-34": "Karaoke time",
      "copy-35": "Время для песен, которые ты обычно поёшь только дома. Для начала разыграем пару песен в лототроне, а дальше — по настроению. Участие добровольное: подпевать с места тоже можно.",
      "copy-36": "Микрофон подождёт",
      "copy-37": "ВЕСЬ ВЕЧЕР · ЗАКУСКИ И БАР",
      "copy-38": "В зале весь вечер будут закуски, а за напитками заглядывай на бар. Пробуй специальные коктейли, выбирай пиво или что-нибудь безалкогольное — что тебе больше нравится.",
      "copy-39": "04",
      "copy-40": "ПРО ПОДАРКИ",
      "copy-41": "Cheers!",
      "copy-42": "Про подарки",
      "copy-43": "Подарок — по желанию. Я буду рада тебя видеть и с ним, и без него!<br/><br/>Если хочется что-то подарить, в вишлисте есть идеи. Можно выбрать что-то оттуда, взять его за ориентир или придумать своё — я ни на чём не настаиваю.",
      "copy-44": "Посмотреть вишлист",
      "copy-45": "✦",
      "copy-46": "До встречи, Карина",
      "copy-47": "28 NOVEMBER 2026 · BELGRADE",
      "copy-48": "Наверх"
    },
    "en": {
      "copy-0": "KARINA'S BIRTHDAY",
      "copy-1": "Nostalgia",
      "copy-2": "by the way, I’m 2 here",
      "copy-3": "✦",
      "copy-4": "Come celebrate my birthday with me on 28 November! We’ll catch up, play a quiz, sing a few songs, and enjoy a little nostalgia. I’d love to see you there!",
      "copy-5": "All the evening details",
      "copy-6": "01",
      "copy-7": "WHEN &amp; WHERE",
      "copy-8": "When &amp; where",
      "copy-9": "WHEN",
      "copy-10": "28 November 2026",
      "copy-11": "Saturday · 7:00 pm · Belgrade time",
      "copy-12": "WHERE",
      "copy-13": "Auditoria Belgrade",
      "copy-14": "Војводе Добрњца 48, Beograd",
      "copy-15": "Open the map",
      "copy-16": "pet friendly",
      "copy-17": "Your furry plus-one is welcome too.",
      "copy-18": "02",
      "copy-19": "DRESS CODE",
      "copy-20": "Dress up",
      "copy-21": "Dress code: nostalgia",
      "copy-22": "Wear whatever you feel good in.",
      "copy-23": "If you’d like to join in with the theme, add something with a story: an old pair of jeans, a pin, a favourite T-shirt, or a detail that takes you back to a good time.",
      "copy-24": "That favourite pair of underwear you can’t bring yourself to throw away counts too. Sentimental value! No need to show us.",
      "copy-25": "The main thing is that you’re there",
      "copy-26": "03",
      "copy-27": "THE EVENING’S LINE-UP",
      "copy-28": "What’s the plan?",
      "copy-29": "19:30",
      "copy-30": "Quiz — Who is?",
      "copy-31": "Answer questions, compare theories, and occasionally take a wild guess. Encyclopaedic knowledge is optional — having fun is the point. There’s a prize for the winner!",
      "copy-32": "Your moment to shine",
      "copy-33": "21:30",
      "copy-34": "Karaoke time",
      "copy-35": "Time for the songs you usually only sing at home. We’ll start by drawing a couple of songs from a lottery drum, then see where the mood takes us. Joining in is optional: singing along from your seat counts too.",
      "copy-36": "The mic can wait",
      "copy-37": "ALL EVENING · SNACKS &amp; BAR",
      "copy-38": "Snacks will be available in the room all evening, and drinks are at the bar. Try the special cocktails, go for a beer, or choose something alcohol-free — whatever you fancy.",
      "copy-39": "04",
      "copy-40": "ABOUT GIFTS",
      "copy-41": "Cheers!",
      "copy-42": "About gifts",
      "copy-43": "Gifts are optional. I’ll be happy to see you with or without one!<br/><br/>If you’d like to bring something, my wishlist has a few ideas. Pick something from it, use it as inspiration, or go with your own idea — there’s no obligation.",
      "copy-44": "Take a look at my wishlist",
      "copy-45": "✦",
      "copy-46": "See you there, Karina",
      "copy-47": "28 NOVEMBER 2026 · BELGRADE",
      "copy-48": "Back to top"
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
