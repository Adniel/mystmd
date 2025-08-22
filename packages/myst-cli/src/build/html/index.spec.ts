import { beforeEach, describe, expect, it, vi } from 'vitest';
import { currentSiteRoutes } from './index.js';
import { Session } from '../../session';

// Mock the dependencies
vi.mock('myst-common', () => ({
  slugToUrl: (slug: string) => slug,
}));

vi.mock('../site/manifest', () => ({
  getSiteManifest: vi.fn().mockResolvedValue({
    projects: [
      {
        slug: 'test-project',
        index: 'index',
        pages: [{ slug: 'page1' }, { slug: 'page2' }],
      },
    ],
  }),
}));

describe('currentSiteRoutes', () => {
  let session: Session;

  beforeEach(() => {
    session = new Session();
  });

  it('generates routes with default .html extension', async () => {
    const routes = await currentSiteRoutes(session, 'http://localhost:3000', undefined);

    expect(routes).toHaveLength(9); // 1 index + 2 pages + 1 index.json + 2 page.json + 2 assets + 1 favicon
    expect(routes[0].path).toBe('test-project/index.html');
    expect(routes[1].path).toBe('test-project/page1/index.html');
    expect(routes[2].path).toBe('test-project/page2/index.html');
    expect(routes[3].path).toBe('test-project/index.json');
    expect(routes[4].path).toBe('test-project/page1.json');
    expect(routes[5].path).toBe('test-project/page2.json');
    expect(routes[6].path).toBe('robots.txt');
    expect(routes[7].path).toBe('myst-theme.css');
    expect(routes[8].path).toBe('favicon.ico');
  });

  it('generates routes with custom .aspx extension', async () => {
    const routes = await currentSiteRoutes(session, 'http://localhost:3000', undefined, {
      htmlExtension: '.aspx',
    });

    expect(routes).toHaveLength(9);
    expect(routes[0].path).toBe('test-project/index.aspx');
    expect(routes[1].path).toBe('test-project/page1/index.aspx');
    expect(routes[2].path).toBe('test-project/page2/index.aspx');
    expect(routes[3].path).toBe('test-project/index.json');
    expect(routes[4].path).toBe('test-project/page1.json');
    expect(routes[5].path).toBe('test-project/page2.json');
    expect(routes[6].path).toBe('robots.txt');
    expect(routes[7].path).toBe('myst-theme.css');
    expect(routes[8].path).toBe('favicon.ico');
  });

  it('generates routes with custom .php extension', async () => {
    const routes = await currentSiteRoutes(session, 'http://localhost:3000', undefined, {
      htmlExtension: '.php',
    });

    expect(routes).toHaveLength(9);
    expect(routes[0].path).toBe('test-project/index.php');
    expect(routes[1].path).toBe('test-project/page1/index.php');
    expect(routes[2].path).toBe('test-project/page2/index.php');
    expect(routes[3].path).toBe('test-project/index.json');
    expect(routes[4].path).toBe('test-project/page1.json');
    expect(routes[5].path).toBe('test-project/page2.json');
    expect(routes[6].path).toBe('robots.txt');
    expect(routes[7].path).toBe('myst-theme.css');
    expect(routes[8].path).toBe('favicon.ico');
  });

  it('generates routes with configuration-based .aspx extension', async () => {
    // Mock the session to return a site config with html_file_suffix
    const mockSession = {
      ...session,
      store: {
        getState: () => ({
          local: {
            config: {
              sites: {
                '/test/path': {
                  options: {
                    html_file_suffix: '.aspx',
                  },
                },
              },
              currentSitePath: '/test/path',
            },
          },
        }),
      },
    } as any;

    const routes = await currentSiteRoutes(mockSession, 'http://localhost:3000', undefined);

    expect(routes).toHaveLength(9);
    expect(routes[0].path).toBe('test-project/index.aspx');
    expect(routes[1].path).toBe('test-project/page1/index.aspx');
    expect(routes[2].path).toBe('test-project/page2/index.aspx');
    expect(routes[3].path).toBe('test-project/index.json');
    expect(routes[4].path).toBe('test-project/page1.json');
    expect(routes[5].path).toBe('test-project/page2.json');
    expect(routes[6].path).toBe('robots.txt');
    expect(routes[7].path).toBe('myst-theme.css');
    expect(routes[8].path).toBe('favicon.ico');
  });
});
