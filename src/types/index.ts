
export type Platform = "tiktok" | "youtube" | "instagram" | "facebook";

export type ConnectionStatus = "connected" | "disconnected" | "pending";

export interface Connection {
  id: string;
  platform: Platform;
  name: string;
  status: ConnectionStatus;
  avatar?: string;
  connected_at?: Date;
}

export type ContentStatus = "pending" | "processing" | "published" | "failed";

export interface Content {
  id: string;
  sourcePlatform: Platform;
  targetPlatform: Platform;
  sourceId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  createdAt: Date;
  status: ContentStatus;
  scheduledFor?: Date;
  publishedAt?: Date;
  error?: string;
}

export interface Workflow {
  id: string;
  name: string;
  sourcePlatform: Platform;
  targetPlatform: Platform;
  sourceAccount: string;
  targetAccount: string;
  isActive: boolean;
  rules: WorkflowRule[];
  createdAt: Date;
}

export interface WorkflowRule {
  id: string;
  type: "hashtag" | "caption" | "duration" | "view_count";
  operator: "contains" | "not_contains" | "equals" | "not_equals" | "greater_than" | "less_than";
  value: string;
}

export interface ContentStats {
  totalRepurposed: number;
  pending: number;
  published: number;
  failed: number;
  averageViews?: number;
  averageLikes?: number;
}

export interface DashboardStats extends ContentStats {
  videos_processed: number;
  videos_published: number;
  accounts_connected: number;
  platforms_connected: number;
}
