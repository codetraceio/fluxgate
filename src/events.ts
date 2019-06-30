export const CHANGE_EVENT = "change";

export function loadingEvent(key: string) {
  return `${key}.loading`;
}

export function completedEvent(key: string) {
  return `${key}.completed`;
}

export function failedEvent(key: string) {
  return `${key}.failed`;
}
