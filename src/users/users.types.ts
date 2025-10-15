// src/users/users.types.ts
export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface BlockedUser {
  id: number;
  name: string;
  imageUrl?: string;
}
