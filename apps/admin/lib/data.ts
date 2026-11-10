export interface User {
  _id: string;
  fullName: string;
  phoneNumber: string;
  role: "admin" | "user";
  profileImage?: string;
}

export interface Donation {
  _id: string;
  userId: string;
  amount: number;
  status: "pending" | "success" | "failed";
  createdAt: string;
}

export interface Event {
  _id: string;
  title: string;
  shortDescription: string;
  fullDescription?: string;
  startDate: string;
  endDate: string;
  buttonText?: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  _id: string;
  userId: string;
  eventId: string;
  createdAt: string;
}

// Initial Mock Data
export const users: User[] = [
  {
    _id: "u1",
    fullName: "Admin User",
    phoneNumber: "0911223344",
    role: "admin",
  },
  {
    _id: "u2",
    fullName: "John Doe",
    phoneNumber: "0922334455",
    role: "user",
  },
];

export const donations: Donation[] = [
  {
    _id: "d1",
    userId: "u2",
    amount: 1000,
    status: "success",
    createdAt: new Date().toISOString(),
  },
];

export const events: Event[] = [
  {
    _id: "e1",
    title: "Annual Fellowship Conference",
    shortDescription: "Our biggest gathering of the year.",
    fullDescription:
      "Join us for a weekend of spiritual growth, community, and inspiration.",
    startDate: "2024-12-01T10:00:00.000Z",
    endDate: "2024-12-03T18:00:00.000Z",
    buttonText: "Register Now",
    imageUrl: "/images/event1.jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const registrations: Registration[] = [
  {
    _id: "r1",
    userId: "u2",
    eventId: "e1",
    createdAt: new Date().toISOString(),
  },
];
