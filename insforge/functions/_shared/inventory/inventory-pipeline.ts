import { createClient } from "npm:@insforge/sdk";

function getDb() {
  const client = createClient({
    baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
    anonKey: Deno.env.get("ANON_KEY"),
  });
  return client.database;
}

function itemToRow(item: Record<string, unknown>): Record<string, unknown> {
  const loc = (item.location ?? {}) as Record<string, unknown>;
  const avail = (item.availability ?? {}) as Record<string, unknown>;
  return {
    id: item.id,
    source_id: item.sourceId ?? item.source_id,
    source_provider: item.sourceProvider ?? item.source_provider,
    pillar: item.pillar,
    title: item.title,
    description: item.description ?? null,
    tags: item.tags ?? [],
    location_lat: loc.lat ?? item.location_lat ?? 0,
    location_lng: loc.lng ?? item.location_lng ?? 0,
    location_address: loc.address ?? item.location_address ?? "",
    location_neighborhood: loc.neighborhood ?? item.location_neighborhood ?? null,
    availability_start: avail.start ?? item.availability_start ?? new Date().toISOString(),
    availability_end: avail.end ?? item.availability_end ?? null,
    availability_recurring: avail.recurring ?? item.availability_recurring ?? false,
    price_band: item.priceBand ?? item.price_band ?? "mid",
    social_mode: item.socialMode ?? item.social_mode ?? "any",
    time_shape: item.timeShape ?? item.time_shape ?? "evening",
    nightlife: item.nightlife ?? false,
    deep_link: item.deepLink ?? item.deep_link ?? "",
    image_url: item.imageUrl ?? item.image_url ?? null,
    source_meta: item.sourceMeta ?? item.source_meta ?? {},
    last_refreshed_at: item.lastRefreshedAt ?? item.last_refreshed_at ?? new Date().toISOString(),
    availability_verified_at: item.availabilityVerifiedAt ?? item.availability_verified_at ?? null,
    active: item.active ?? true,
    created_at: item.createdAt ?? item.created_at ?? new Date().toISOString(),
    updated_at: item.updatedAt ?? item.updated_at ?? new Date().toISOString(),
  };
}

export async function upsertInventoryItems(
  items: Record<string, unknown>[]
): Promise<{ upserted: number; error: { message: string } | null }> {
  const db = getDb();
  const rows = items.map(itemToRow);
  const { error } = await db.from("inventory_items").upsert(rows);
  if (error) return { upserted: 0, error };
  return { upserted: rows.length, error: null };
}

export async function deactivateStaleItems(
  sourceProvider: string,
  activeIds: string[]
): Promise<{ deactivated: number; error: { message: string } | null }> {
  const db = getDb();
  const { data } = await db.from("inventory_items").select("*").eq("source_provider", sourceProvider).eq("active", true);

  if (!data) return { deactivated: 0, error: null };

  const rows = data as Array<Record<string, unknown>>;
  const stale = rows.filter((r) => !activeIds.includes(r.id as string));

  let deactivated = 0;
  for (const row of stale) {
    await db.from("inventory_items").update({ active: false }).eq("id", row.id as string);
    deactivated++;
  }

  return { deactivated, error: null };
}
