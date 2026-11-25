import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { emptySectionPaths } from '../../src/lib/optional-glob';

describe('emptySectionPaths', () => {
  const antes = process.env.CONTENT_DIR;
  let dir = '';
  afterEach(() => {
    if (antes === undefined) delete process.env.CONTENT_DIR;
    else process.env.CONTENT_DIR = antes;
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it('sem nenhum conteúdo, Cases e Blog estão vazios', () => {
    dir = mkdtempSync(join(tmpdir(), 'nuestra-'));
    process.env.CONTENT_DIR = dir;
    expect(emptySectionPaths()).toEqual(['/cases/', '/blog/']);
  });

  it('com um case, só o Blog continua vazio', () => {
    dir = mkdtempSync(join(tmpdir(), 'nuestra-'));
    mkdirSync(join(dir, 'cases'));
    writeFileSync(join(dir, 'cases', 'x.md'), '---\n---\n');
    process.env.CONTENT_DIR = dir;
    expect(emptySectionPaths()).toEqual(['/blog/']);
  });
});
