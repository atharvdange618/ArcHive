export enum ContentType {
  Text = "text",
  Link = "link",
  Code = "code",
}

export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
}

export interface IContentItem {
  _id: string;
  userId: string;
  type: ContentType;
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  tags: string[];
  previewImageUrl?: string;
  platform?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformStat {
  platform: string;
  count: number;
}
