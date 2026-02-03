export type MembershipLevel = {
    id: string;
    name: string;
    image: string;
    upgradePrice: string;
    orderInfo: {
        commissionRate: string;
        ratio: string;
        quantityRange: string;
    };
    constraints: {
        ordersPerDay: number;
        minBalance: string;
    };
    withdrawal: {
        min: string;
        max: string;
        withdrawableStatus: string;
    };
    fees: {
        trc: string;
        erc: string;
        card: string;
    };
    autoUpgrade: {
        numberOfInvitees: number;
    };
    rebateInfo: {
        level1: string;
        level2: string;
        level3: string;
    };
    status: "Active" | "Inactive";
};

const levels: MembershipLevel[] = [
    {
        id: "1",
        name: "VIP1",
        image: "/images/vip-badges/vip-silver.png",
        upgradePrice: "0.00",
        orderInfo: {
            commissionRate: "0.22% Balance",
            ratio: "60% - 60% Item",
            quantityRange: "1-1",
        },
        constraints: {
            ordersPerDay: 10,
            minBalance: "10.00",
        },
        withdrawal: {
            min: "10.00",
            max: "50000.00",
            withdrawableStatus: "Withdrawable (Number of Orders Doubled Status: 1)",
        },
        fees: {
            trc: "50.00%",
            erc: "20.00%",
            card: "5.00%",
        },
        autoUpgrade: {
            numberOfInvitees: 1,
        },
        rebateInfo: {
            level1: "15%",
            level2: "5%",
            level3: "2%",
        },
        status: "Active",
    },
    {
        id: "2",
        name: "VIP2",
        image: "/images/vip-badges/vip-cyan.png",
        upgradePrice: "100.00",
        orderInfo: {
            commissionRate: "0.3% Balance",
            ratio: "60% - 60% Item",
            quantityRange: "1-1",
        },
        constraints: {
            ordersPerDay: 10,
            minBalance: "100.00",
        },
        withdrawal: {
            min: "10.00",
            max: "50000.00",
            withdrawableStatus: "Withdrawable (Number of Orders Doubled Status: 1)",
        },
        fees: {
            trc: "50.00%",
            erc: "20.00%",
            card: "5.00%",
        },
        autoUpgrade: {
            numberOfInvitees: 5,
        },
        rebateInfo: {
            level1: "16%",
            level2: "6%",
            level3: "3%",
        },
        status: "Active",
    },
    {
        id: "3",
        name: "VIP3",
        image: "/images/vip-badges/vip-cyan.png", // Reusing cyan for Green/others for now or until I have more
        upgradePrice: "500.00",
        orderInfo: {
            commissionRate: "0.35% Balance",
            ratio: "60% - 60% Item",
            quantityRange: "1-1",
        },
        constraints: {
            ordersPerDay: 10,
            minBalance: "500.00",
        },
        withdrawal: {
            min: "10.00",
            max: "50000.00",
            withdrawableStatus: "Withdrawable (Number of Orders Doubled Status: 1)",
        },
        fees: {
            trc: "50.00%",
            erc: "20.00%",
            card: "5.00%",
        },
        autoUpgrade: {
            numberOfInvitees: 10,
        },
        rebateInfo: {
            level1: "17%",
            level2: "7%",
            level3: "3%",
        },
        status: "Active",
    },
    {
        id: "4",
        name: "VIP4",
        image: "/images/vip-badges/vip-gold.png", // Using Gold for higher tiers
        upgradePrice: "1000.00",
        orderInfo: {
            commissionRate: "0.4% Balance",
            ratio: "60% - 60% Item",
            quantityRange: "1-1",
        },
        constraints: {
            ordersPerDay: 10,
            minBalance: "1000.00",
        },
        withdrawal: {
            min: "10.00",
            max: "50000.00",
            withdrawableStatus: "Withdrawable (Number of Orders Doubled Status: 1)",
        },
        fees: {
            trc: "50.00%",
            erc: "20.00%",
            card: "5.00%",
        },
        autoUpgrade: {
            numberOfInvitees: 20,
        },
        rebateInfo: {
            level1: "18%",
            level2: "8%",
            level3: "4%",
        },
        status: "Active",
    },
    {
        id: "5",
        name: "VIP5",
        image: "/images/vip-badges/vip-gold.png",
        upgradePrice: "3000.00",
        orderInfo: {
            commissionRate: "0.45% Balance",
            ratio: "60% - 60% Item",
            quantityRange: "1-1",
        },
        constraints: {
            ordersPerDay: 10,
            minBalance: "3000.00",
        },
        withdrawal: {
            min: "10.00",
            max: "50000.00",
            withdrawableStatus: "Withdrawable (Number of Orders Doubled Status: 1)",
        },
        fees: {
            trc: "50.00%",
            erc: "20.00%",
            card: "5.00%",
        },
        autoUpgrade: {
            numberOfInvitees: 50,
        },
        rebateInfo: {
            level1: "20%",
            level2: "10%",
            level3: "5%",
        },
        status: "Active",
    },
];

export async function getMembershipLevels(): Promise<MembershipLevel[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return levels;
}
