import {
  pgTable,
  bigint,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Casts table - store cast information (read-only)
export const casts = pgTable(
  "casts",
  {
    fid: bigint("fid", { mode: "number" }).notNull(),
    hash: text("hash").notNull(),
    timestamp: timestamp("timestamp"),
    embeds: jsonb("embeds"), // Array of embed URLs
    parentCastUrl: text("parent_cast_url"),
    parentCastFid: bigint("parent_cast_fid", { mode: "number" }),
    parentCastHash: text("parent_cast_hash"),
    text: text("text"),
    mentions: jsonb("mentions"), // Array of mentioned users
    mentionsPositions: jsonb("mentions_positions"),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    castsHashIdx: index("casts_hash_idx").on(table.hash),
    castsFidIdx: index("casts_fid_idx").on(table.fid),
    castsParentHashIdx: index("casts_parent_hash_idx").on(table.parentCastHash),
    castsTimestampIdx: index("casts_timestamp_idx").on(table.timestamp),
  })
);

// Profiles table - store user profile information (read-only)
export const profiles = pgTable(
  "profiles",
  {
    fid: bigint("fid", { mode: "number" }).notNull(),
    data: jsonb("data"), // Profile data in JSONB format
    custodyAddress: text("custody_address"),
    lastUpdatedAt: timestamp("last_updated_at"),
  },
  (table) => ({
    profilesFidIdx: index("profiles_fid_idx").on(table.fid),
    profilesCustodyAddressIdx: index("profiles_custody_address_idx").on(
      table.custodyAddress
    ),
  })
);

// Links table - store user relationships (read-only)
export const links = pgTable(
  "links",
  {
    fid: bigint("fid", { mode: "number" }).notNull(),
    timestamp: timestamp("timestamp"),
    targetFid: bigint("target_fid", { mode: "number" }).notNull(),
    type: text("type").notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    linksFidIdx: index("links_fid_idx").on(table.fid),
    linksTargetFidIdx: index("links_target_fid_idx").on(table.targetFid),
    linksTypeIdx: index("links_type_idx").on(table.type),
    linksTimestampIdx: index("links_timestamp_idx").on(table.timestamp),
  })
);

// Reactions table - store cast reactions (read-only)
export const reactions = pgTable(
  "reactions",
  {
    fid: bigint("fid", { mode: "number" }).notNull(),
    timestamp: timestamp("timestamp"),
    targetCastFid: bigint("target_cast_fid", { mode: "number" }).notNull(),
    targetCastHash: text("target_cast_hash").notNull(),
    type: text("type").notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    reactionsFidIdx: index("reactions_fid_idx").on(table.fid),
    reactionsTargetCastHashIdx: index("reactions_target_cast_hash_idx").on(
      table.targetCastHash
    ),
    reactionsTypeIdx: index("reactions_type_idx").on(table.type),
    reactionsTimestampIdx: index("reactions_timestamp_idx").on(table.timestamp),
  })
);

// Verifications table - store wallet verifications (read-only)
export const verifications = pgTable(
  "verifications",
  {
    fid: bigint("fid", { mode: "number" }).notNull(),
    address: text("address").notNull(),
    timestamp: timestamp("timestamp"),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    verificationsFidIdx: index("verifications_fid_idx").on(table.fid),
    verificationsAddressIdx: index("verifications_address_idx").on(
      table.address
    ),
    verificationsTimestampIdx: index("verifications_timestamp_idx").on(
      table.timestamp
    ),
  })
);

// Relations
export const castsRelations = relations(casts, ({ one, many }) => ({
  author: one(profiles, {
    fields: [casts.fid],
    references: [profiles.fid],
  }),
  parent: one(casts, {
    fields: [casts.parentCastHash],
    references: [casts.hash],
  }),
  replies: many(casts),
  reactions: many(reactions),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  casts: many(casts),
  links: many(links),
  reactions: many(reactions),
  verifications: many(verifications),
}));

export const linksRelations = relations(links, ({ one }) => ({
  user: one(profiles, {
    fields: [links.fid],
    references: [profiles.fid],
  }),
  target: one(profiles, {
    fields: [links.targetFid],
    references: [profiles.fid],
  }),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(profiles, {
    fields: [reactions.fid],
    references: [profiles.fid],
  }),
  cast: one(casts, {
    fields: [reactions.targetCastHash],
    references: [casts.hash],
  }),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
  user: one(profiles, {
    fields: [verifications.fid],
    references: [profiles.fid],
  }),
}));

// Types for TypeScript
export type Cast = typeof casts.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Link = typeof links.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;
export type Verification = typeof verifications.$inferSelect;

// Helper types for common operations
export type CastWithAuthor = Cast & {
  author?: Profile;
};

export type CastWithReplies = Cast & {
  replies?: Cast[];
  reactions?: Reaction[];
};

export type ProfileWithStats = Profile & {
  castCount?: number;
  followerCount?: number;
  followingCount?: number;
};
