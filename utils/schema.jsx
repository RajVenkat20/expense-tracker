import { date, integer, numeric, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const Budgets=pgTable('budgets', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    amount: varchar('amount').notNull(),
    icon: varchar('icon').notNull(),
    createdBy: varchar('createdBy').notNull()
})

export const Expenses=pgTable('expenses', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    amount: numeric('amount').notNull().default(0),
    budgetId: integer('budgetId').references(() => Budgets.id),
    createdAt: varchar('createdAt').notNull(),
    createdBy: varchar('createdBy').notNull(),
})

export const Income=pgTable('income', {
    id: serial('id').primaryKey(),
    source: varchar('source').notNull(),
    description: varchar('description'),
    amount: numeric('amount').notNull().default(0),
    createdAt: date("createdAt").notNull().defaultNow(),
    createdBy: varchar('createdBy').notNull()
})