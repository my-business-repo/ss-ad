
export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  lastLogin: string;
};

const mockUsers: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2023-10-25",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "User",
    status: "Inactive",
    lastLogin: "2023-09-15",
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "Editor",
    status: "Active",
    lastLogin: "2023-10-24",
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana@example.com",
    role: "User",
    status: "Pending",
    lastLogin: "-",
  },
  {
    id: "5",
    name: "Evan Wright",
    email: "evan@example.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2023-10-26",
  },
];

export async function getUsers(): Promise<User[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockUsers;
}
