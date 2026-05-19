// src/lib/ogpCard.ts

export type OgpData = {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
};

export async function fetchOgp(url: string): Promise<OgpData | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "bot" },
    });
    if (!res.ok) return null;

    const html = await res.text();

    const get = (property: string): string => {
      const match =
        html.match(
          new RegExp(
            `<meta[^>]*property="${property}"[^>]*content="([^"]*)"`,
            "i",
          ),
        ) ||
        html.match(
          new RegExp(
            `<meta[^>]*content="([^"]*)"[^>]*property="${property}"`,
            "i",
          ),
        );
      return match?.[1] ?? "";
    };

    const title =
      get("og:title") || html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || "";
    const description = get("og:description");
    const image = get("og:image");
    const siteName = get("og:site_name");

    if (!title) return null;

    return { url, title, description, image, siteName };
  } catch {
    return null;
  }
}

export function buildCardHtml(ogp: OgpData): string {
  const image = ogp.image
    ? `<img src="${ogp.image}" alt="${ogp.title}" class="ogp-card__image" />`
    : "";
  const description = ogp.description
    ? `<span class="ogp-card__description">${ogp.description}</span>`
    : "";
  const site = `<span class="ogp-card__site">${ogp.siteName || new URL(ogp.url).hostname}</span>`;

  return `
    <a href="${ogp.url}" target="_blank" rel="noopener noreferrer" class="ogp-card">
      ${image}
      <span class="ogp-card__body">
        <span class="ogp-card__title">${ogp.title}</span>
        ${description}${site}
      </span>
    </a>
  `;
}

export async function convertOgpCards(html: string): Promise<string> {
  const pattern =
    /<a\s+href="(https?:\/\/[^"]+)"[^>]*>\s*https?:\/\/[^<]+\s*<\/a>/gi;
  const matches = [...html.matchAll(pattern)];

  let result = html;

  for (const match of matches) {
    const [fullMatch, url] = match;
    const ogp = await fetchOgp(url);
    if (!ogp) continue;
    result = result.replace(fullMatch, buildCardHtml(ogp));
  }

  return result;
}
