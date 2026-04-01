import { getDb } from "./db.ts";

// ─── Types ──────────────────────────────────────────────────────────────────

interface InventoryRow {
  id: string;
  pillar: string;
  title: string;
  description: string | null;
  tags: string[];
  price_band: string;
  social_mode: string;
  time_shape: string;
  nightlife: boolean;
  location_lat: number;
  location_lng: number;
  location_address: string;
  location_neighborhood: string | null;
  active: boolean;
  [key: string]: unknown;
}

interface Snapshot {
  preferences: { pillar: Record<string, number>; tags: Record<string, number> };
  hardFilters: Array<{
    id: string;
    category: string;
    label: string;
    active: boolean;
  }>;
}

interface ScoredItem {
  item: InventoryRow;
  score: number;
  tagOverlap: string[];
}

export interface ExplanationFact {
  factType: string;
  factKey: string;
  factValue: string;
  contributes: "positive" | "negative" | "neutral";
}

export interface FeedCard {
  id: string;
  itemId: string;
  score: number;
  confidenceLabel: "new" | "learning" | "strong_match";
  isExploration: boolean;
  explanationFacts: ExplanationFact[];
  explanationText: string;
  allowedActions: string[];
  eligibleFollowUp: null;
  position: number;
}

export interface FeedResult {
  cards: FeedCard[];
  feedSize: number;
  explorationCount: number;
  generatedAt: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_FEED_SIZE = 6;
const MIN_FEED_SIZE = 3;
const MAX_FEED_SIZE = 8;
const MAX_EXPLORATION = 2;
const EXPLORATION_RATE = 0.25;

// ─── DB access ──────────────────────────────────────────────────────────────


// ─── Candidate retrieval ────────────────────────────────────────────────────

export async function getCandidates(): Promise<InventoryRow[]> {
  const db = getDb();
  const { data } = await db
    .from("inventory_items")
    .select("*")
    .eq("active", true);
  if (!data) return [];
  return data as InventoryRow[];
}

// ─── Hard-filter application ────────────────────────────────────────────────

export function applyHardFilters(
  items: InventoryRow[],
  snapshot: Snapshot
): InventoryRow[] {
  const active = snapshot.hardFilters.filter((f) => f.active);
  if (active.length === 0) return items;

  const blocked = new Set<string>();
  for (const f of active) {
    blocked.add(f.category.toLowerCase());
  }

  return items.filter((item) => {
    if (blocked.has(item.pillar.toLowerCase())) return false;
    if (blocked.has(item.price_band.toLowerCase())) return false;
    for (const tag of item.tags) {
      if (blocked.has(tag.toLowerCase())) return false;
    }
    return true;
  });
}

// ─── Scoring ────────────────────────────────────────────────────────────────

export function scoreCandidate(
  item: InventoryRow,
  snapshot: Snapshot
): ScoredItem {
  let score = 0;
  const overlap: string[] = [];

  const pillarPref = snapshot.preferences.pillar[item.pillar] ?? 0;
  score += pillarPref * 0.4;

  for (const tag of item.tags) {
    const tagPref = snapshot.preferences.tags[tag] ?? 0;
    if (tagPref !== 0) {
      score += tagPref * 0.6;
      overlap.push(tag);
    }
  }

  if (item.tags.length === 0 && Object.keys(snapshot.preferences.tags).length === 0) {
    score += 0.1;
  }

  return { item, score, tagOverlap: overlap };
}

// ─── Exploration (UCB-style) ────────────────────────────────────────────────

export function applyExploration(
  scored: ScoredItem[],
  feedSize: number
): { exploited: ScoredItem[]; explored: ScoredItem[] } {
  const sorted = [...scored].sort((a, b) => b.score - a.score);

  const explorationBudget = Math.min(
    MAX_EXPLORATION,
    Math.floor(feedSize * EXPLORATION_RATE)
  );

  const topN = sorted.slice(0, feedSize - explorationBudget);

  const topIds = new Set(topN.map((s) => s.item.id));
  const rest = sorted.filter((s) => !topIds.has(s.item.id));

  const explored: ScoredItem[] = [];
  if (rest.length > 0 && explorationBudget > 0) {
    const shuffled = [...rest].sort(() => Math.random() - 0.5);
    explored.push(...shuffled.slice(0, explorationBudget));
  }

  return { exploited: topN, explored };
}

// ─── Diversity pass ─────────────────────────────────────────────────────────

export function applyDiversity(
  items: ScoredItem[],
  maxPerPillar: number
): ScoredItem[] {
  const pillarCount: Record<string, number> = {};
  const result: ScoredItem[] = [];

  const sorted = [...items].sort((a, b) => b.score - a.score);

  for (const s of sorted) {
    const p = s.item.pillar;
    const count = pillarCount[p] ?? 0;
    if (count < maxPerPillar) {
      result.push(s);
      pillarCount[p] = count + 1;
    }
  }

  return result;
}

// ─── Confidence labels ──────────────────────────────────────────────────────

export function assignConfidenceLabel(
  score: number,
  tagOverlap: string[]
): "new" | "learning" | "strong_match" {
  if (tagOverlap.length === 0) return "new";
  if (score >= 0.5) return "strong_match";
  return "learning";
}

// ─── Explanation facts ──────────────────────────────────────────────────────

export function buildExplanationFacts(
  item: InventoryRow,
  snapshot: Snapshot,
  tagOverlap: string[]
): ExplanationFact[] {
  const facts: ExplanationFact[] = [];

  const pillarPref = snapshot.preferences.pillar[item.pillar] ?? 0;
  if (pillarPref > 0) {
    facts.push({
      factType: "pillar_match",
      factKey: "pillar",
      factValue: item.pillar,
      contributes: "positive",
    });
  }

  for (const tag of tagOverlap) {
    const pref = snapshot.preferences.tags[tag] ?? 0;
    facts.push({
      factType: "tag_match",
      factKey: "tag",
      factValue: tag,
      contributes: pref >= 0 ? "positive" : "negative",
    });
  }

  facts.push({
    factType: "location",
    factKey: "neighborhood",
    factValue: item.location_neighborhood ?? "Seattle",
    contributes: "neutral",
  });

  return facts;
}

// ─── Explanation text ───────────────────────────────────────────────────────

export function buildExplanationText(facts: ExplanationFact[]): string {
  const positives = facts.filter((f) => f.contributes === "positive");
  if (positives.length === 0) return "Recommended for you";
  const reasons = positives.map((f) => f.factValue);
  return "Because you like " + reasons.join(", ");
}

// ─── Feed orchestrator ──────────────────────────────────────────────────────

export async function generateFeed(
  snapshot: Snapshot
): Promise<FeedResult> {
  const candidates = await getCandidates();
  const filtered = applyHardFilters(candidates, snapshot);

  const scored = filtered.map((item) => scoreCandidate(item, snapshot));

  const feedSize = Math.max(
    MIN_FEED_SIZE,
    Math.min(MAX_FEED_SIZE, DEFAULT_FEED_SIZE, scored.length)
  );

  const { exploited, explored } = applyExploration(scored, feedSize);

  const maxPerPillar = Math.ceil(feedSize / 2);
  const diverseExploited = applyDiversity(exploited, maxPerPillar);

  const combined = [...diverseExploited, ...explored];
  const final = combined.slice(0, feedSize);

  const exploredIds = new Set(explored.map((s) => s.item.id));

  const cards: FeedCard[] = final.map((s, idx) => {
    const isExploration = exploredIds.has(s.item.id);
    const label = assignConfidenceLabel(s.score, s.tagOverlap);
    const facts = buildExplanationFacts(s.item, snapshot, s.tagOverlap);
    const text = buildExplanationText(facts);

    return {
      id: crypto.randomUUID(),
      itemId: s.item.id,
      score: Math.round(s.score * 1000) / 1000,
      confidenceLabel: label,
      isExploration,
      explanationFacts: facts,
      explanationText: text,
      allowedActions: ["im_in", "maybe", "pass", "cant"],
      eligibleFollowUp: null,
      position: idx,
    };
  });

  return {
    cards,
    feedSize: cards.length,
    explorationCount: cards.filter((c) => c.isExploration).length,
    generatedAt: new Date().toISOString(),
  };
}
