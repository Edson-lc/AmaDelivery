const envBase = (() => {
  try {
    return import.meta.env?.BASE_URL ?? '/';
  } catch {
    return '/';
  }
})();

const runtimeBase = (() => {
  if (typeof window === 'undefined') {
    return '';
  }

  const match = window.location.pathname.match(/^\/apps\/[^/]+/i);
  return match ? match[0] : '';
})();

function normalizeBase(path: string): string {
  if (!path || path === '/' || path === './') {
    return '';
  }
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export const appBasePath = normalizeBase(envBase) || normalizeBase(runtimeBase);

function buildPathSegment(pageName: string): { segment: string; query?: string } {
  const trimmed = pageName?.trim() ?? '';
  if (!trimmed) {
    return { segment: '' };
  }

  const [rawPath, rawQuery] = trimmed.split('?');
  const slug = rawPath
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  const segment = slug ? `/${slug}` : '';
  return { segment, query: rawQuery };
}

export function createPageUrl(pageName: string): string {
  const { segment, query } = buildPathSegment(pageName);
  const base = appBasePath || '';
  const fullPath = `${base}${segment}` || '/';
  return query ? `${fullPath}?${query}` : fullPath;
}

export function createAbsolutePageUrl(pageName: string): string {
  const url = createPageUrl(pageName);
  if (typeof window === 'undefined') {
    return url;
  }

  if (/^https?:/i.test(url)) {
    return url;
  }

  return `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`;
}
