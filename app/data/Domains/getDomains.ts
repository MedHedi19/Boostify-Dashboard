import domainsFr from "./domains-fr.json";
import domainsEn from "./domains-en.json";
import domainsAr from "./domains-ar.json";
import domainsDe from "./domains-de.json";
import domainsEs from "./domains-es.json";
import domainsIt from "./domains-it.json";

const DOMAINS_BY_LANG: Record<string, any[]> = {
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
 */
export function getDomains(lang: string = "fr") {
  return DOMAINS_BY_LANG[lang] ?? DOMAINS_BY_LANG[DEFAULT_LANG];
}

/** Resolve stored indices to localized labels for the active language. */
export function getDomainChoiceLabels(
  lang: string = "fr",
  domaine?: number | null,
  speciality?: number | null
) {
  if (domaine == null || typeof domaine !== "number") return null;
  const domains = getDomains(lang);
  const domain = domains[domaine];
  if (!domain) return null;

  let specialtyLabel: string | null = null;
  if (speciality != null && typeof speciality === "number" && domain.specialties) {
    specialtyLabel = domain.specialties[speciality] ?? null;
  }

  return {
    domainLabel: domain.label,
    specialtyLabel,
  };
}
