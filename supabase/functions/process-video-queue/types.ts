
export interface VideoData {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

export interface UploadResult {
  success: boolean;
  videoId?: string;
  url?: string;
  error?: string;
}

export interface ProcessingResult {
  videoId: string;
  status: 'completed' | 'failed';
  targetVideoId?: string;
  error?: string;
}

export interface QueuedVideo {
  id: string;
  workflow_id: string;
  source_platform: string;
  platform_video_id: string;
  title: string | null;
  description: string | null;
  workflow: {
    id: string;
    name: string;
    source_platform: string;
    target_platform: string;
    source_connection: {
      access_token: string;
      [key: string]: any;
    };
    target_connection: {
      access_token: string;
      [key: string]: any;
    };
  };
}
