import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const { users, admins, deposits, withdrawals, orders, products } = await getOverviewData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:gap-7.5">
      <OverviewCard
        label="Total Users"
        data={{
          value: compactFormat(users.value),
          growthRate: 0,
        }}
        Icon={icons.Users}
      />

      <OverviewCard
        label="Total Admins"
        data={{
          value: compactFormat(admins.value),
          growthRate: 0,
        }}
        Icon={icons.Users}
      />

      <OverviewCard
        label="Total Deposits"
        data={{
          value: "$" + compactFormat(deposits.value),
          growthRate: 0,
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Total Withdrawals"
        data={{
          value: "$" + compactFormat(withdrawals.value),
          growthRate: 0,
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Total Orders"
        data={{
          value: compactFormat(orders.value),
          growthRate: 0,
        }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Total Products"
        data={{
          value: compactFormat(products.value),
          growthRate: 0,
        }}
        Icon={icons.Product}
      />
    </div>
  );
}
