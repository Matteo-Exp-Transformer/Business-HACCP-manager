type Level = "debug" | "info" | "warn" | "error";
let current: Level = (import.meta.env.DEV ? "debug" : "warn");

export const logger = {
  setLevel: (l: Level) => { current = l; },
  child: (area: string) => ({
    debug: (...a: unknown[]) => current==="debug" && console.debug(`[${area}]`, ...a),
    info:  (...a: unknown[]) => (current==="debug"||current==="info") && console.info(`[${area}]`, ...a),
    warn:  (...a: unknown[]) => console.warn(`[${area}]`, ...a),
    error: (...a: unknown[]) => console.error(`[${area}]`, ...a)
  })
};