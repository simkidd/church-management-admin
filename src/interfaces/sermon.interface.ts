export interface Sermon {
  _id: string;
  title: string;
  description: string;
  pastor: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  videoUrl: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  datePreached: string;
  scripture?: string;
  tags?: string[];
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}