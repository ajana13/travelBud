export interface NormalizedItem {
  id: string;
  sourceId: string;
  sourceProvider: string;
  pillar: "events" | "dining" | "outdoors";
  title: string;
  description: string | null;
  tags: string[];
  location: { lat: number; lng: number; address: string; neighborhood: string | null };
  availability: { start: string; end: string | null; recurring: boolean };
  priceBand: "free" | "budget" | "mid" | "premium";
  socialMode: "solo" | "duo" | "group" | "any";
  timeShape: string;
  nightlife: boolean;
  deepLink: string;
  imageUrl: string | null;
  sourceMeta: Record<string, unknown>;
  lastRefreshedAt: string;
  availabilityVerifiedAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderAdapter {
  providerName: string;
  fetchItems(): Promise<Record<string, unknown>[]>;
  transform(raw: Record<string, unknown>): NormalizedItem;
  validate(item: NormalizedItem): boolean;
  dedupeKey(item: NormalizedItem): string;
}

function makeItem(
  overrides: Partial<NormalizedItem> & {
    id: string;
    title: string;
    sourceId: string;
    sourceProvider: string;
    pillar: NormalizedItem["pillar"];
  },
): NormalizedItem {
  const now = new Date().toISOString();
  return {
    description: null,
    tags: [],
    location: { lat: 47.6062, lng: -122.3321, address: "Seattle, WA", neighborhood: null },
    availability: { start: now, end: null, recurring: false },
    priceBand: "mid",
    socialMode: "any",
    timeShape: "evening",
    nightlife: false,
    deepLink: "https://example.com",
    imageUrl: null,
    sourceMeta: {},
    lastRefreshedAt: now,
    availabilityVerifiedAt: null,
    active: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createMockEventsAdapter(): ProviderAdapter {
  return {
    providerName: "mock-events",
    async fetchItems() {
      return Array.from({ length: 10 }, (_, i) => ({
        raw_id: `evt-${i + 1}`,
        raw_title: `Seattle Event ${i + 1}`,
        raw_lat: 47.6 + i * 0.01,
        raw_lng: -122.33 + i * 0.005,
        raw_tags: ["live-music", "local"],
      }));
    },
    transform(raw) {
      return makeItem({
        id: crypto.randomUUID(),
        sourceId: raw.raw_id as string,
        sourceProvider: "mock-events",
        pillar: "events",
        title: raw.raw_title as string,
        tags: raw.raw_tags as string[],
        location: { lat: raw.raw_lat as number, lng: raw.raw_lng as number, address: "Seattle, WA", neighborhood: "Capitol Hill" },
        deepLink: `https://events.example.com/${raw.raw_id}`,
      });
    },
    validate: (item) => !!item.title && !!item.sourceId,
    dedupeKey: (item) => `${item.sourceProvider}:${item.sourceId}`,
  };
}

export function createMockDiningAdapter(): ProviderAdapter {
  return {
    providerName: "mock-dining",
    async fetchItems() {
      return Array.from({ length: 10 }, (_, i) => ({
        raw_id: `din-${i + 1}`,
        raw_title: `Seattle Restaurant ${i + 1}`,
        raw_lat: 47.61 + i * 0.008,
        raw_lng: -122.34 + i * 0.004,
        raw_tags: ["food", "dinner"],
      }));
    },
    transform(raw) {
      return makeItem({
        id: crypto.randomUUID(),
        sourceId: raw.raw_id as string,
        sourceProvider: "mock-dining",
        pillar: "dining",
        title: raw.raw_title as string,
        tags: raw.raw_tags as string[],
        location: { lat: raw.raw_lat as number, lng: raw.raw_lng as number, address: "Seattle, WA", neighborhood: "Ballard" },
        availability: { start: new Date().toISOString(), end: null, recurring: true },
        deepLink: `https://dining.example.com/${raw.raw_id}`,
      });
    },
    validate: (item) => !!item.title && !!item.sourceId,
    dedupeKey: (item) => `${item.sourceProvider}:${item.sourceId}`,
  };
}

export function createMockOutdoorsAdapter(): ProviderAdapter {
  return {
    providerName: "mock-outdoors",
    async fetchItems() {
      return Array.from({ length: 10 }, (_, i) => ({
        raw_id: `out-${i + 1}`,
        raw_title: `Seattle Trail ${i + 1}`,
        raw_lat: 47.62 + i * 0.012,
        raw_lng: -122.35 + i * 0.006,
        raw_tags: ["hiking", "nature"],
      }));
    },
    transform(raw) {
      return makeItem({
        id: crypto.randomUUID(),
        sourceId: raw.raw_id as string,
        sourceProvider: "mock-outdoors",
        pillar: "outdoors",
        title: raw.raw_title as string,
        tags: raw.raw_tags as string[],
        location: { lat: raw.raw_lat as number, lng: raw.raw_lng as number, address: "Seattle, WA", neighborhood: "Discovery Park" },
        priceBand: "free",
        deepLink: `https://outdoors.example.com/${raw.raw_id}`,
      });
    },
    validate: (item) => !!item.title && !!item.sourceId,
    dedupeKey: (item) => `${item.sourceProvider}:${item.sourceId}`,
  };
}
