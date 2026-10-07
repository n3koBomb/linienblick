import { describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import worker from './index.js';

const mapConfig = await readFile(new URL('../../site/src/config/map-config.js', import.meta.url), 'utf8');

describe('Worker-Asset-Weiterleitung', () => {
  it('übergibt die ursprüngliche Anfrage an das ASSETS-Binding', async () => {
    const request = new Request('https://linienblick.test/public/data/stops-duesseldorf.json');
    const response = new Response('{"stops":[]}', { status: 200 });
    const fetch = vi.fn().mockResolvedValue(response);

    await expect(worker.fetch(request, { ASSETS: { fetch } })).resolves.toBe(response);
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith(request);
  });

  it('hält URL, Attribution und Zoomgrenze der Kachelquelle austauschbar bereit', () => {
    expect(mapConfig).toContain('tile.openstreetmap.de/{z}/{x}/{y}.png');
    expect(mapConfig).toContain('openstreetmap.org/copyright');
    expect(mapConfig).toContain('maxZoom: 19');
  });
});
