import type { NormalizedItem } from "./provider-adapters.ts";
import {
  createMockEventsAdapter,
  createMockDiningAdapter,
  createMockOutdoorsAdapter,
} from "./provider-adapters.ts";

const EVENT_NEIGHBORHOODS = [
  "Capitol Hill", "Downtown", "Fremont", "Pike Place", "Ballard",
  "Georgetown", "SLU", "Pioneer Square", "Belltown", "Columbia City",
];

const EVENT_TAGS: string[][] = [
  ["live-music", "festival"],
  ["classical", "performance"],
  ["art", "festival"],
  ["music", "street"],
  ["jazz", "live-music"],
  ["art", "gallery"],
  ["food", "trucks"],
  ["art", "gallery"],
  ["art", "walkable"],
  ["music", "community"],
];

const EVENT_PRICE_BANDS: Array<"free" | "budget" | "mid" | "premium"> = [
  "free", "budget", "mid", "premium", "free",
  "free", "budget", "free", "free", "free",
];

const DINING_DESCRIPTIONS = [
  "chowder", "fine dining", "Caribbean sandwiches", "oysters",
  "cured meats", "soup dumplings", "tacos", "sushi",
  "pizza", "fresh seafood",
];

const DINING_TAGS: string[][] = [
  ["seafood", "chowder"],
  ["fine-dining", "pnw"],
  ["caribbean", "sandwiches"],
  ["oysters", "raw-bar"],
  ["italian", "cured-meats"],
  ["dumplings", "dim-sum"],
  ["mexican", "tacos"],
  ["japanese", "sushi"],
  ["pizza", "artisan"],
  ["seafood", "market"],
];

const DINING_NEIGHBORHOODS = [
  "Pike Place", "Queen Anne", "Fremont", "Ballard",
  "Pioneer Square", "ID", "Capitol Hill", "Downtown",
  "Capitol Hill", "Pike Place",
];

const DINING_PRICE_BANDS: Array<"free" | "budget" | "mid" | "premium"> = [
  "budget", "premium", "budget", "mid", "budget",
  "mid", "budget", "premium", "mid", "mid",
];

const DINING_SOCIAL_MODES: Array<"solo" | "duo" | "group" | "any"> = [
  "any", "duo", "any", "group", "solo",
  "group", "solo", "duo", "group", "duo",
];

const OUTDOOR_DESCRIPTIONS = [
  "hiking", "viewpoints", "relaxing", "walking",
  "beach walks", "jogging", "gardens", "beach access",
  "forest walks", "nature loops",
];

const OUTDOOR_TAGS: string[][] = [
  ["hiking", "nature"],
  ["viewpoint", "scenic"],
  ["park", "urban"],
  ["arboretum", "walking"],
  ["beach", "coastal"],
  ["lake", "jogging"],
  ["garden", "conservatory"],
  ["beach", "creek"],
  ["forest", "trail"],
  ["nature", "loop"],
];

const OUTDOOR_NEIGHBORHOODS = [
  "Magnolia", "Queen Anne", "Wallingford", "Madison Park",
  "West Seattle", "Green Lake", "Capitol Hill", "Carkeek",
  "Ravenna", "Seward Park",
];

export function getSeattleSeedItems(): NormalizedItem[] {
  const now = new Date().toISOString();
  const items: NormalizedItem[] = [];

  // 10 Events
  const eventNames = [
    "Capitol Hill Block Party",
    "Seattle Symphony Concert",
    "Fremont Solstice Fair",
    "Pike Place Buskers Festival",
    "Ballard Jazz Walk",
    "Georgetown Art Walk",
    "South Lake Union Food Truck Rally",
    "Pioneer Square First Thursday",
    "Belltown Art Stroll",
    "Columbia City Beat Walk",
  ];
  for (let i = 0; i < 10; i++) {
    const hood = EVENT_NEIGHBORHOODS[i];
    items.push({
      id: `seed-evt-${String(i + 1).padStart(3, "0")}`,
      sourceId: `seed-evt-${i + 1}`,
      sourceProvider: "mock-events",
      pillar: "events",
      title: eventNames[i],
      description: `A popular Seattle event in the ${hood} neighborhood.`,
      tags: EVENT_TAGS[i],
      location: {
        lat: 47.615 + i * 0.005,
        lng: -122.325 + i * 0.003,
        address: `${100 + i * 10} Seattle Ave, Seattle, WA`,
        neighborhood: hood,
      },
      availability: { start: now, end: null, recurring: false },
      priceBand: EVENT_PRICE_BANDS[i],
      socialMode: "any",
      timeShape: "evening",
      nightlife: i === 0 || i === 4,
      deepLink: `https://events.seattle.mock/seed-evt-${i + 1}`,
      imageUrl: null,
      sourceMeta: {},
      lastRefreshedAt: now,
      availabilityVerifiedAt: null,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // 10 Dining
  const diningNames = [
    "Pike Place Chowder",
    "Canlis",
    "Paseo Caribbean",
    "Walrus and the Carpenter",
    "Salumi Artisan Cured Meats",
    "Din Tai Fung Bellevue",
    "Tacos Chukis",
    "Japonessa",
    "Serious Pie",
    "Matt's in the Market",
  ];
  for (let i = 0; i < 10; i++) {
    const hood = DINING_NEIGHBORHOODS[i];
    const desc = DINING_DESCRIPTIONS[i];
    items.push({
      id: `seed-din-${String(i + 1).padStart(3, "0")}`,
      sourceId: `seed-din-${i + 1}`,
      sourceProvider: "mock-dining",
      pillar: "dining",
      title: diningNames[i],
      description: `A beloved Seattle dining spot known for its ${desc}.`,
      tags: DINING_TAGS[i],
      location: {
        lat: 47.608 + i * 0.004,
        lng: -122.340 + i * 0.002,
        address: `${200 + i * 15} Market St, Seattle, WA`,
        neighborhood: hood,
      },
      availability: { start: now, end: null, recurring: true },
      priceBand: DINING_PRICE_BANDS[i],
      socialMode: DINING_SOCIAL_MODES[i],
      timeShape: "lunch-dinner",
      nightlife: false,
      deepLink: `https://dining.seattle.mock/seed-din-${i + 1}`,
      imageUrl: null,
      sourceMeta: {},
      lastRefreshedAt: now,
      availabilityVerifiedAt: null,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // 10 Outdoors
  const outdoorNames = [
    "Discovery Park Loop Trail",
    "Kerry Park Viewpoint",
    "Gas Works Park",
    "Washington Park Arboretum",
    "Alki Beach Trail",
    "Green Lake Loop",
    "Volunteer Park Conservatory",
    "Carkeek Park Beach",
    "Ravenna Park Trail",
    "Seward Park Loop",
  ];
  for (let i = 0; i < 10; i++) {
    const hood = OUTDOOR_NEIGHBORHOODS[i];
    const desc = OUTDOOR_DESCRIPTIONS[i];
    items.push({
      id: crypto.randomUUID(),
      sourceId: `seed-out-${i + 1}`,
      sourceProvider: "mock-outdoors",
      pillar: "outdoors",
      title: outdoorNames[i],
      description: `A scenic outdoor spot in Seattle perfect for ${desc}.`,
      tags: OUTDOOR_TAGS[i],
      location: {
        lat: 47.655 + i * 0.006,
        lng: -122.405 + i * 0.008,
        address: `${300 + i * 20} Park Rd, Seattle, WA`,
        neighborhood: hood,
      },
      availability: { start: now, end: null, recurring: true },
      priceBand: "free",
      socialMode: "any",
      timeShape: "daytime",
      nightlife: false,
      deepLink: `https://outdoors.seattle.mock/seed-out-${i + 1}`,
      imageUrl: null,
      sourceMeta: {},
      lastRefreshedAt: now,
      availabilityVerifiedAt: null,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  return items;
}
