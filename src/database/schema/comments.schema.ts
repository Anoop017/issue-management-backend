import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { issues } from './issues.schema';

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),

  issueId: integer('issue_id')
    .notNull()
    .references(() => issues.id, { onDelete: 'cascade' }),

  content: text('content').notNull(),

  authorName: varchar('author_name', { length: 255 }),

  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),
});
