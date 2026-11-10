export interface User {
  _id: string;
  fullName: string;
  phoneNumber: string;
  department?: string;
  team?: string;
  yearOfStudy?: string;
  telegramUserName?: string;
  profileImage?: string | null;
  role?: string;
  createdAt: string;
}
