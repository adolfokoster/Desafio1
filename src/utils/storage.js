export function readStoredObject(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? { ...fallback, ...JSON.parse(value) } : fallback
  } catch {
    return fallback
  }
}

export function storeObject(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // La aplicación sigue funcionando si el navegador bloquea el almacenamiento.
  }
}
