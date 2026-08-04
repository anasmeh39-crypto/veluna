'use client'

// Injects the browser pixels for the platforms that are enabled AND configured.
//
// • next/script with strategy="afterInteractive" keeps them out of the critical
//   rendering path — nothing here blocks first paint or hydration.
// • Each <Script> has a stable id, so Next renders it exactly once and client
//   navigation never re-inserts a snippet.
// • The vendor snippets are the official loaders minus their automatic PageView
//   call: PageView is fired from React instead so it happens exactly once per
//   navigation, with the same event id across browser and server.

import Script from 'next/script'
import type { PublicTrackingConfig } from '@/lib/tracking/types'

/**
 * Pixel IDs are interpolated into inline <script> bodies, so they are filtered
 * down to the characters real IDs use. Defence in depth — the values are also
 * validated before they are stored.
 */
function safeId(id: string): string {
  return id.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64)
}

const metaSnippet = (pixelId: string) => `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');`

const tiktokSnippet = (pixelCode: string) => `
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";
ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
ttq._o=ttq._o||{};ttq._o[e]=n||{};var s=d.createElement("script");s.type="text/javascript";
s.async=!0;s.src=r+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];
a.parentNode.insertBefore(s,a)};ttq.load('${pixelCode}');}(window,document,'ttq');`

const snapSnippet = (pixelId: string) => `
(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){
a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
a.queue=[];var s='script',r=t.createElement(s);r.async=!0;r.src=n;
var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u)})
(window,document,'https://sc-static.net/scevent.min.js');
snaptr('init','${pixelId}');`

export default function TrackingScripts({ config }: { config: PublicTrackingConfig }) {
  const metaId = config.meta.enabled ? safeId(config.meta.id) : ''
  const tiktokId = config.tiktok.enabled ? safeId(config.tiktok.id) : ''
  const snapId = config.snapchat.enabled ? safeId(config.snapchat.id) : ''

  return (
    <>
      {metaId && (
        <Script
          id="veluna-meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: metaSnippet(metaId) }}
        />
      )}
      {tiktokId && (
        <Script
          id="veluna-tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: tiktokSnippet(tiktokId) }}
        />
      )}
      {snapId && (
        <Script
          id="veluna-snap-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: snapSnippet(snapId) }}
        />
      )}
    </>
  )
}
