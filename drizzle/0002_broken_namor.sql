ALTER TABLE "expenses" ALTER COLUMN "createdAt" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "createdAt" SET DEFAULT now();