(() => {
  'use strict';
  const copy = JSON.parse(document.getElementById('site-copy').textContent);
  const nodes = [...document.querySelectorAll('[data-copy]')];
  const buttons = [...document.querySelectorAll('[data-language]')];
  function setLanguage(language, updateURL) {
    if (!copy[language]) language = 'ru';
    nodes.forEach(node => { node.innerHTML = copy[language][node.dataset.copy]; });
    document.documentElement.lang = language;
    document.title = language === 'en' ? 'Karina · Nostalgia — Birthday invitation' : 'Карина · Nostalgia — день рождения';
    document.querySelector('.language-navigation').setAttribute('aria-label', language === 'en' ? 'Language' : 'Язык');
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    document.querySelectorAll('img[alt]').forEach(img => {
      if (img.alt) img.alt = language === 'en' ? 'A childhood photograph of Karina' : 'Детская фотография Карины';
    });
    if (updateURL) {
      const url = new URL(location.href);
      url.searchParams.set('lang', language);
      history.replaceState(null, '', url);
    }
  }
  buttons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language, true)));
  setLanguage(new URLSearchParams(location.search).get('lang') || 'ru', false);
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('reveal-hidden'); observer.unobserve(entry.target); }
    }), { threshold: 0.03 });
    document.querySelectorAll('.element-when-and-where,.element-nostalgia-dress,.element-evening-programme,.element-gifts-photograph').forEach(section => {
      section.classList.add('reveal', 'reveal-hidden'); observer.observe(section);
    });
  }
})();
