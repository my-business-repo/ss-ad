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
            title: "User List",
            url: "/user-list",
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
