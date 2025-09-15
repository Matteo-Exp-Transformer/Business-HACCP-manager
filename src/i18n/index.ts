import it from "./it";
import en from "./en";

const dict = { it, en };
let lang: keyof typeof dict = "it";

export function setLang(l: "it" | "en") { lang = l; }
export function t(key: string, params?: Record<string, string|number>) {
  const s = (dict[lang] as any)[key] ?? key;
  if (!params) return s;
  return Object.entries(params).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), s);
}