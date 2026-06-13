import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const issueStatuses = ['open', 'closed', 'in-progress'] as const;
export const issuePriorities = ['high', 'medium', 'low'] as const;

export type IssueStatus = (typeof issueStatuses)[number];
export type IssuePriority = (typeof issuePriorities)[number];

export const issues = pgTable('issues', {
  id: serial('id').primaryKey(),

  title: text('title').notNull(),

  description: text('description').notNull(),

  status: varchar('status', { length: 20 })
    .$type<IssueStatus>()
    .default('open')
    .notNull(),

  priority: varchar('priority', { length: 20 })
    .$type<IssuePriority>()
    .default('medium')
    .notNull(),

  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),
});
