import profilesFr from "./boosty_profiles-fr.json";
import profilesEn from "./boosty_profiles_en.json";
import profilesAr from "./boosty_profiles-ar.json";
import profilesDe from "./boosty_profiles-de.json";
import profilesEs from "./boosty_profiles-es.json";
import profilesIt from "./boosty_profiles-it.json";

const PROFILES_BY_LANG = {
  fr: profilesFr,
  en: profilesEn,
  ar: profilesAr,
  de: profilesDe,
  es: profilesEs,
  it: profilesIt,
};

const DEFAULT_LANG = "fr";

/**
 * Look up recommended jobs by guide indices + DISC letter.
 * Domain/specialty order must match domains-*.json and boosty_profiles-*.json.
 */
export function getRecommendedJobs(lang, domaine, speciality, discProfile) {
  const profiles = PROFILES_BY_LANG[lang] ?? PROFILES_BY_LANG[DEFAULT_LANG];

  if (
    domaine == null ||
    speciality == null ||
    !discProfile ||
    typeof domaine !== "number" ||
    typeof speciality !== "number"
  ) {
    return [];
  }

  const domainKeys = Object.keys(profiles);
  const domainKey = domainKeys[domaine];
  if (!domainKey) return [];

  const specialtyKeys = Object.keys(profiles[domainKey]);
  const specialtyKey = specialtyKeys[speciality];
  if (!specialtyKey) return [];

  const jobs = profiles[domainKey][specialtyKey]?.[discProfile];
  return Array.isArray(jobs) ? jobs : [];
}
