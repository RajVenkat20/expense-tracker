// Networth calculation logic
// Calculates and inserts monthly networth record

import { db } from '../utils/dbConfig';
import { Networth, Income, Expenses } from '../utils/schema';

// Helper to sum income for a given month/year/user
async function sumIncomeForMonth(month, year, userId) {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
  const result = await db
    .select({ total: db.fn.sum(Income.amount) })
    .from(Income)
    .where(db.and(
      db.gte(Income.createdAt, startDate),
      db.lte(Income.createdAt, endDate),
      db.eq(Income.createdBy, userId)
    ));
  return result[0]?.total || 0;
}

// Helper to sum expenses for a given month/year/user
async function sumExpensesForMonth(month, year, userId) {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
  const result = await db
    .select({ total: db.fn.sum(Expenses.amount) })
    .from(Expenses)
    .where(db.and(
      db.gte(Expenses.createdAt, startDate),
      db.lte(Expenses.createdAt, endDate),
      db.eq(Expenses.createdBy, userId)
    ));
  return result[0]?.total || 0;
}

// Main networth calculation and insert function
export async function calculateAndInsertNetworth(month, year, userId) {
  // Get previous month/year
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  // Fetch latest networth for previous month/year/user
  const prevNetworth = await db
    .select()
    .from(Networth)
    .where(db.and(
      db.eq(Networth.month, prevMonth),
      db.eq(Networth.year, prevYear),
      db.eq(Networth.userId, userId)
    ))
    .orderBy(Networth.createdAt, 'desc')
    .limit(1);
  const prevAmount = prevNetworth.length ? prevNetworth[0].amount : 0;

  // Fetch total income and expenses for current month/year/user
  const totalIncome = await sumIncomeForMonth(month, year, userId);
  const totalExpenses = await sumExpensesForMonth(month, year, userId);

  const newNetworth = prevAmount + (totalIncome - totalExpenses);

  // Insert new networth record
  await db.insert(Networth).values({
    userId,
    month,
    year,
    amount: newNetworth,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return newNetworth;
}
