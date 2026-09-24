import domainsFr from "./domains-fr.json";
import domainsEn from "./domains-en.json";
import domainsAr from "./domains-ar.json";
import domainsDe from "./domains-de.json";
import domainsEs from "./domains-es.json";
import domainsIt from "./domains-it.json";

const DOMAINS_BY_LANG = {
  fr: domainsFr.domains,
  en: domainsEn.domains,
  ar: domainsAr.domains,
  de: domainsDe.domains,
  es: domainsEs.domains,
  it: domainsIt.domains,
};

const DEFAULT_LANG = "fr";

/**
 * Returns domain/specialty list for the active app language.
 * Same array order in every file so domaine/speciality indices stay stable.
 * Falls back to French when a language file is not added yet.
 */
export function getDomains(lang) {
  return DOMAINS_BY_LANG[lang] ?? DOMAINS_BY_LANG[DEFAULT_LANG];
}

/** Resolve stored indices to localized labels for the active language. */
export function getDomainChoiceLabels(lang, domaine, speciality) {
  const domains = getDomains(lang);
  const domain = domains[domaine];
  if (!domain) return null;
  return {
    domainLabel: domain.label,
    specialtyLabel: domain.specialties[speciality] ?? null,
  };
}
