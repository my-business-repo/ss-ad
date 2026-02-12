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
