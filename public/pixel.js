/**
 * Deployable Pixel — v1
 * Add to your Shopify/website:
 *   <script src="https://YOUR_APP_URL/pixel.js?id=YOUR_SITE_ID" async></script>
 */
;(function () {
  'use strict'

  // ── Find site_id from this script's src ──────────────────────────────────
  var scripts = document.querySelectorAll('script[src*="pixel.js"]')
  var siteId = null
  var scriptSrc = ''
  for (var i = 0; i < scripts.length; i++) {
    var m = scripts[i].src.match(/[?&]id=([^&]+)/)
    if (m) { siteId = m[1]; scriptSrc = scripts[i].src; break }
  }
  if (!siteId) return

  // ── Derive base URL from the script's own origin ─────────────────────────
  var baseUrl = ''
  try {
    baseUrl = new URL(scriptSrc).origin
  } catch (e) {
    baseUrl = window.location.origin
  }

  // ── Anonymous ID (persisted in localStorage) ─────────────────────────────
  var ANON_KEY = '__dp_anon__'
  var anonId
  try {
    anonId = localStorage.getItem(ANON_KEY)
    if (!anonId) {
      anonId = 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36)
      localStorage.setItem(ANON_KEY, anonId)
    }
  } catch (e) {
    anonId = 'anon_' + Math.random().toString(36).substr(2, 9)
  }

  // ── Core track function ───────────────────────────────────────────────────
  function track(eventType, metadata) {
    var payload = JSON.stringify({
      site_id: siteId,
      event_type: eventType,
      anonymous_id: anonId,
      url: window.location.href,
      referrer: document.referrer || '',
      metadata: metadata || {},
    })

    try {
      // sendBeacon works even when the page is closing
      if (navigator.sendBeacon) {
        navigator.sendBeacon(baseUrl + '/api/pixel/track', payload)
      } else {
        var xhr = new XMLHttpRequest()
        xhr.open('POST', baseUrl + '/api/pixel/track', true)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(payload)
      }
    } catch (e) { /* silent */ }
  }

  // ── Auto-track: page_view ────────────────────────────────────────────────
  track('page_view')

  // SPA support — fire page_view on client-side navigation
  var lastUrl = window.location.href
  ;(function () {
    var orig = history.pushState
    history.pushState = function () {
      orig.apply(this, arguments)
      setTimeout(function () {
        if (window.location.href !== lastUrl) {
          lastUrl = window.location.href
          track('page_view')
        }
      }, 150)
    }
  })()
  window.addEventListener('popstate', function () {
    setTimeout(function () {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href
        track('page_view')
      }
    }, 150)
  })

  // ── Public API ────────────────────────────────────────────────────────────
  window.deployable = window.deployable || {}
  window.deployable.track = track
  window.deployable.siteId = siteId

  // Flush any queued calls made before the script loaded
  var queue = (window.deployable.q || [])
  for (var j = 0; j < queue.length; j++) {
    track(queue[j][0], queue[j][1])
  }
  window.deployable.q = []
})()
