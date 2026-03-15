import { db as prisma } from "@/lib/db";
import { compactFormat } from "@/lib/format-number"; // Keep if needed, but data processing might be better in component

export async function getOverviewData() {
  const [
    totalCustomers,
    totalAdmins,
    totalDepositsResult,
    totalWithdrawalsResult,
    totalOrders,
    totalProducts, // Add this
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.admin.count(),
    prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        type: "DEPOSIT",
        status: "APPROVED",
      },
    }),
    prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        type: "WITHDRAWAL",
        status: "APPROVED",
      },
    }),
    prisma.order.count(),
    prisma.product.count(), // Add this query
  ]);

  const totalDeposits = totalDepositsResult._sum.amount || 0;
  const totalWithdrawals = totalWithdrawalsResult._sum.amount || 0;

  return {
    users: {
      value: totalCustomers,
    },
    admins: {
      value: totalAdmins,
    },
    deposits: {
      value: totalDeposits,
    },
    withdrawals: {
      value: totalWithdrawals,
    },
    orders: {
      value: totalOrders,
    },
    products: { // Add this return
      value: totalProducts,
    }
  };
}

export async function getRecentCustomers() {
  const recentCustomers = await prisma.customer.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      status: true,
    },
  });

  return recentCustomers;
}

export async function getDashboardChartData() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 13); // 14 days inclusive
  startDate.setHours(0, 0, 0, 0);

  // Fetch all relevant data within the 14-day window concurrently
  // and baseline sums for cumulative calculations
  const [
    customers, 
    deposits, 
    withdrawals,
    baselineDeposits,
    baselineWithdrawals
  ] = await Promise.all([
    prisma.customer.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true },
    }),
    prisma.transaction.findMany({
      where: { type: "DEPOSIT", status: "APPROVED", createdAt: { gte: startDate, lte: endDate } },
      select: { amount: true, createdAt: true },
    }),
    prisma.transaction.findMany({
      where: { type: "WITHDRAWAL", status: "APPROVED", createdAt: { gte: startDate, lte: endDate } },
      select: { amount: true, createdAt: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "DEPOSIT", status: "APPROVED", createdAt: { lt: startDate } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "WITHDRAWAL", status: "APPROVED", createdAt: { lt: startDate } },
      _sum: { amount: true },
    })
  ]);

  // Aggregate by Date
  const aggregatedData: Record<string, { customers: number; deposits: number; withdrawals: number }> = {};

  // Build skeleton for the 14 days so we don't have empty gaps on the chart
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const defaultDateStr = d.toISOString().split("T")[0];
    aggregatedData[defaultDateStr] = { customers: 0, deposits: 0, withdrawals: 0 };
  }

  // Populate Customers (Daily)
  customers.forEach(item => {
    const dateStr = item.createdAt.toISOString().split("T")[0];
    if (aggregatedData[dateStr]) aggregatedData[dateStr].customers += 1;
  });

  // Populate Deposits (Daily sums to be accumulated)
  deposits.forEach(item => {
    const dateStr = item.createdAt.toISOString().split("T")[0];
    if (aggregatedData[dateStr]) aggregatedData[dateStr].deposits += item.amount;
  });

  // Populate Withdrawals (Daily sums to be accumulated)
  withdrawals.forEach(item => {
    const dateStr = item.createdAt.toISOString().split("T")[0];
    if (aggregatedData[dateStr]) aggregatedData[dateStr].withdrawals += item.amount;
  });

  // Sort dates chronologically
  const sortedData = Object.entries(aggregatedData)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());

  // Calculate cumulative sums sequentially
  let cumulativeDeposits = baselineDeposits._sum.amount || 0;
  let cumulativeWithdrawals = baselineWithdrawals._sum.amount || 0;

  return sortedData.map(([date, metrics]) => {
    cumulativeDeposits += metrics.deposits;
    cumulativeWithdrawals += metrics.withdrawals;

    return {
      date,
      customers: metrics.customers,
      deposits: cumulativeDeposits,
      withdrawals: cumulativeWithdrawals,
    };
  });
}
