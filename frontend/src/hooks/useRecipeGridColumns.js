import { useSyncExternalStore } from 'react'

function subscribe(onChange) {
  const tablet = window.matchMedia('(min-width: 768px)')
  const desktop = window.matchMedia('(min-width: 1024px)')
  const smallTablet = window.matchMedia('(min-width: 640px)')
  const wideDesktop = window.matchMedia('(min-width: 1280px)')
  tablet.addEventListener('change', onChange)
  desktop.addEventListener('change', onChange)
  smallTablet.addEventListener('change', onChange)
  wideDesktop.addEventListener('change', onChange)
  return () => {
    tablet.removeEventListener('change', onChange)
    desktop.removeEventListener('change', onChange)
    smallTablet.removeEventListener('change', onChange)
    wideDesktop.removeEventListener('change', onChange)
  }
}

function getColumns() {
  if (window.matchMedia('(min-width: 1024px)').matches) return 3
  if (window.matchMedia('(min-width: 768px)').matches) return 2
  return 1
}

function getFavoriteColumns() {
  if (window.matchMedia('(min-width: 1280px)').matches) return 4
  if (window.matchMedia('(min-width: 1024px)').matches) return 3
  if (window.matchMedia('(min-width: 640px)').matches) return 2
  return 1
}

export default function useRecipeGridColumns(layout = 'recipes') {
  // Subscribe to breakpoint changes instead of measuring card layout on scroll.
  return useSyncExternalStore(subscribe, layout === 'favorites' ? getFavoriteColumns : getColumns, () => 1)
}
