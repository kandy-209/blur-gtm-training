/**
 * Performance Optimization Utilities
 * Lazy loading, image optimization, and prefetching helpers
 */

/**
 * Lazy load images with intersection observer
 */
export function setupLazyImages() {
  if (typeof window === 'undefined') return

  const images = document.querySelectorAll('img[data-src]')
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.getAttribute('data-src')
          if (src) {
            img.src = src
            img.removeAttribute('data-src')
            img.classList.add('loaded')
            observer.unobserve(img)
          }
        }
      })
    })

    images.forEach((img) => imageObserver.observe(img))
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach((img) => {
      const imgElement = img as HTMLImageElement
      const src = imgElement.getAttribute('data-src')
      if (src) {
        imgElement.src = src
        imgElement.removeAttribute('data-src')
      }
    })
  }
}

/**
 * Prefetch critical resources
 */
export function prefetchResources(urls: string[]) {
  if (typeof window === 'undefined') return

  urls.forEach((url) => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    link.as = 'document'
    document.head.appendChild(link)
  })
}

/**
 * Preconnect to external domains
 */
export function preconnectDomain(domain: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = domain
  document.head.appendChild(link)
}

/**
 * Defer non-critical scripts
 */
export function deferScript(src: string, id?: string) {
  if (typeof window === 'undefined') return

  return new Promise<void>((resolve, reject) => {
    // Check if script already exists
    if (id && document.getElementById(id)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.defer = true
    if (id) script.id = id
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

/**
 * Optimize images with responsive srcset
 */
export function getOptimizedImageSrc(
  baseUrl: string,
  width?: number,
  quality: number = 80
): string {
  // For Next.js Image component, this would be handled automatically
  // This is a helper for manual image optimization
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  params.set('q', quality.toString())
  
  return `${baseUrl}?${params.toString()}`
}

/**
 * Initialize performance optimizations
 */
export function initPerformanceOptimizations() {
  if (typeof window === 'undefined') return

  // Setup lazy images
  setupLazyImages()

  // Preconnect to common domains
  preconnectDomain('https://fonts.googleapis.com')
  preconnectDomain('https://fonts.gstatic.com')

  // Prefetch critical pages
  const criticalPages = [
    '/scenarios',
    '/analytics',
    '/sales-skills',
  ]
  prefetchResources(criticalPages)
}

