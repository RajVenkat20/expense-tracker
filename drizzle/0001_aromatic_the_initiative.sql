CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"amount" numeric DEFAULT 0 NOT NULL,
	"budgetId" integer,
	"createdAt" varchar NOT NULL,
	"createdBy" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "income" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" varchar NOT NULL,
	"description" varchar,
	"amount" numeric DEFAULT 0 NOT NULL,
	"createdAt" date DEFAULT now() NOT NULL,
	"createdBy" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_budgetId_budgets_id_fk" FOREIGN KEY ("budgetId") REFERENCES "public"."budgets"("id") ON DELETE no action ON UPDATE no action;