(() => {
  const supported = new Set(["sv", "en"]);
  const storageKey = "laroaventyren-language";
  const root = document.documentElement;

  function normalizeLanguage(value) {
    const language = String(value || "").trim().toLowerCase().split(/[-_]/, 1)[0];
    return supported.has(language) ? language : null;
  }

  function browserLanguage() {
    const preferences = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language];
    for (const preference of preferences) {
      const language = normalizeLanguage(preference);
      if (language) return language;
    }
    return "sv";
  }

  function storedLanguage() {
    try {
      return normalizeLanguage(window.sessionStorage.getItem(storageKey));
    } catch {
      return null;
    }
  }

  function applyLanguage(language, remember = false) {
    if (!supported.has(language)) return;

    root.lang = language;
    for (const content of document.querySelectorAll("[data-language-content]")) {
      content.hidden = content.dataset.languageContent !== language;
    }
    for (const button of document.querySelectorAll("[data-language-switch]")) {
      button.setAttribute("aria-pressed", String(button.dataset.languageSwitch === language));
    }
    for (const element of document.querySelectorAll("[data-i18n-sv][data-i18n-en]")) {
      const value = element.dataset["i18n" + (language === "sv" ? "Sv" : "En")];
      const attribute = element.dataset.i18nAttribute;
      if (attribute) element.setAttribute(attribute, value);
      else element.textContent = value;
    }

    const suffix = language === "sv" ? "sv" : "en";
    const title = root.getAttribute("data-page-title-" + suffix);
    const description = root.getAttribute("data-page-description-" + suffix);
    if (title) {
      document.title = title;
      const socialTitle = document.querySelector('meta[property="og:title"]');
      if (socialTitle) socialTitle.setAttribute("content", title);
    }
    if (description) {
      const descriptionTags = document.querySelectorAll('meta[name="description"], meta[property="og:description"]');
      for (const tag of descriptionTags) tag.setAttribute("content", description);
    }
    const localeTag = document.querySelector('meta[property="og:locale"]');
    if (localeTag) localeTag.setAttribute("content", language === "sv" ? "sv_SE" : "en_US");
    const alternateLocaleTag = document.querySelector('meta[property="og:locale:alternate"]');
    if (alternateLocaleTag) alternateLocaleTag.setAttribute("content", language === "sv" ? "en_US" : "sv_SE");

    if (remember) {
      try {
        window.sessionStorage.setItem(storageKey, language);
      } catch {
        // Language changes still work for this page when session storage is unavailable.
      }
    }
  }

  for (const button of document.querySelectorAll("[data-language-switch]")) {
    button.addEventListener("click", () => {
      applyLanguage(normalizeLanguage(button.dataset.languageSwitch), true);
    });
  }

  applyLanguage(storedLanguage() || browserLanguage());
})();
