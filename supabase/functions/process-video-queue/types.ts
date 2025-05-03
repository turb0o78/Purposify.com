
export interface QueuedVideo {
  id: string;
  workflow_id: string;
  source_platform: string;
  platform_video_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string;
  created_at: string;
  updated_at?: string;
  workflow: {
    id: string;
    name: string;
    source_platform: string;
    target_platform: string;
    source_connection: {
      id: string;
      access_token: string;
      refresh_token?: string;
    };
    target_connection: {
      id: string;
      access_token: string;
      refresh_token?: string;
    };
  }
}

export interface ProcessingResult {
  videoId: string;
  status: "completed" | "failed";
  targetVideoId?: string;
  error?: string;
}

export interface VideoData {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

export interface UploadResult {
  success: boolean;
  videoId?: string;
  error?: string;
}

export interface DriveVideoResponse {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
}
