export enum ContentType {
  Text = "text",
  Link = "link",
  Code = "code",
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
  createdAt: string;
  updatedAt: string;
}
