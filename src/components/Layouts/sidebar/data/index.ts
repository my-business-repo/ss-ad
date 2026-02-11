import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "Customer List",
            url: "/customers",
          },
          {
            title: "Membership Levels",
            url: "/membership-levels",
          },
        ],
      },
      {
        title: "Trading",
        icon: Icons.PieChart,
        items: [
          {
            title: "Order List",
            url: "/trading/order-list",
          },
          {
            title: "Order Plan",
            url: "/trading/order-plan",
          },
          {
            title: "Deposit",
            url: "/trading/deposit",
          },
          {
            title: "Withdrawal",
            url: "/trading/withdrawal",
          },

        ],
      },
      {
        title: "Admin",
        icon: Icons.Authentication, // Using Authentication icon as a temporary placeholder or reused
        items: [
          {
            title: "Admin List",
            url: "/trading/admin",
          },
        ]
      },
      {
        title: "Product",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Product List",
            url: "/products",
          },
          {
            title: "New Product",
            url: "/products/new",
          },
        ]
      },
      {
        title: "Profile",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Settings",
        url: "/pages/settings",
        icon: Icons.Gear,
        items: [],
      },
    ],
  },
  {
    label: "OTHERS",
    items: [
      {
        title: "Chatting",
        url: "/chatting",
        icon: Icons.Message,
        items: [],
      },
      {
        title: "Sign Out",
        url: "/auth/sign-in",
        icon: Icons.Authentication,
        items: [],
      },
    ],
  },
];
