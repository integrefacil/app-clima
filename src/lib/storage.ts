export function getStorage(key: string, fallback: string) {
  try {
    const v = localStorage.getItem(key)
    return v ?? fallback
  } catch {
    return fallback
  }
}

export function setStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore quota
  }
}
