export const RECIPE_IMAGE_FALLBACK = '/images/recipe-placeholder.svg'

// Transform only known image CDNs; other URLs and signed assets remain intact.
export function recipeThumbnail(source, width) {
  if (!source) return RECIPE_IMAGE_FALLBACK
  try {
    const url = new URL(source)
    if (url.hostname === 'res.cloudinary.com' && /^\/[^/]+\/image\/upload\//.test(url.pathname)) {
      if (url.pathname.includes('/s--') || url.search) return source
      url.pathname = url.pathname.replace('/image/upload/', `/image/upload/c_limit,w_${width}/f_auto,q_auto/`)
      return url.href
    }
    if (url.hostname === 'images.unsplash.com') {
      url.searchParams.set('w', String(width))
      url.searchParams.set('auto', 'format')
      url.searchParams.set('q', '75')
      return url.href
    }
  } catch { /* Relative or invalid URLs are left for the image fallback. */ }
  return source
}

export function recipeImageProps(source, sizes) {
  const src = recipeThumbnail(source, 640)
  const responsive = src !== (source || RECIPE_IMAGE_FALLBACK)
  return {
    src,
    srcSet: responsive ? [320, 480, 640, 960, 1280].map(width => `${recipeThumbnail(source, width)} ${width}w`).join(', ') : undefined,
    sizes: responsive ? sizes || '(min-width: 1536px) 475px, (min-width: 1280px) 390px, (min-width: 1024px) 305px, (min-width: 768px) 340px, (min-width: 640px) 544px, calc(100vw - 96px)' : undefined,
  }
}

export function handleRecipeImageError(event) {
  const image = event.currentTarget
  image.removeAttribute('srcset')
  image.removeAttribute('sizes')
  if (!image.src.endsWith(RECIPE_IMAGE_FALLBACK)) image.src = RECIPE_IMAGE_FALLBACK
}
