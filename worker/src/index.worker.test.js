import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

describe('Worker liefert die statische LinienBlick-Seite aus', () => {
  it('liefert die Startseite samt noindex-Entwicklungsstatus', async () => {
    const response = await SELF.fetch('https://linienblick.test/');
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(html).toContain('<title>LinienBlick');
    expect(html).toContain('noindex, nofollow');
  });

  it.each([
    ['/src/scripts/app.js', 'javascript'],
    ['/src/config/map-config.js', 'javascript'],
    ['/src/style/map.css', 'text/css'],
    ['/public/vendor/leaflet/leaflet-src.esm.js', 'javascript'],
    ['/public/data/stops-duesseldorf.json', 'application/json'],
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
