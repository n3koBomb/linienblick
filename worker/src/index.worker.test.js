import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

describe('Worker liefert die statische LinienBlick-Seite aus', () => {
  it.each(['/', '/index.html'])('liefert %s samt noindex-Entwicklungsstatus und Sicherheitsheadern', async (path) => {
    const response = await SELF.fetch(`https://linienblick.test${path}`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBe('DENY');
    expect(response.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(response.headers.get('permissions-policy')).toContain('geolocation=(self)');
    expect(response.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
    expect(html).toContain('<title>LinienBlick');
    expect(html).toContain('noindex, nofollow');
  });

  it.each([
    ['/src/scripts/app.js', 'javascript'],
    ['/src/config/map-config.js', 'javascript'],
    ['/src/style/map.css', 'text/css'],
    ['/public/vendor/leaflet/leaflet-src.esm.js', 'javascript'],
    ['/public/data/stops-duesseldorf.json', 'application/json'],
    ['/public/data/lines-duesseldorf.json', 'application/json'],
    ['/public/favicon/favicon.svg', 'image/svg+xml'],
    ['/public/site.webmanifest', 'application/manifest+json'],
    ['/sitemap.xml', 'application/xml'],
    ['/robots.txt', 'text/plain'],
  ])('liefert %s als direktes Asset aus', async (path, contentType) => {
    const response = await SELF.fetch(`https://linienblick.test${path}`);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain(contentType);
  });
});
