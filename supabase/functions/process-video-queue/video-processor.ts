
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { QueuedVideo, ProcessingResult } from './types.ts';
import { downloadTikTokVideo, uploadToTikTok } from './platforms/tiktok.ts';
import { downloadYouTubeVideo, uploadToYouTube } from './platforms/youtube.ts';

export async function processVideo(
  video: QueuedVideo,
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<ProcessingResult> {
  try {
    // Mark as processing
    await supabaseAdmin
      .from('video_queue')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', video.id);
    
    // Step 1: Download the video
    const videoData = await downloadVideo(
      video.source_platform,
      video.platform_video_id,
      video.workflow.source_connection.access_token
    );
    
    if (!videoData.success) {
      throw new Error(`Failed to download video: ${videoData.error}`);
    }
    
    // Step 2: Upload to target platform
    const uploadResult = await uploadVideo(
      video.workflow.target_platform,
      videoData.videoUrl!,
      video.title || '',
      video.description || '',
      video.workflow.target_connection.access_token
    );
    
    if (!uploadResult.success) {
      throw new Error(`Failed to upload video: ${uploadResult.error}`);
    }
    
    // Mark as completed
    await supabaseAdmin
      .from('video_queue')
      .update({ 
        status: 'completed', 
        target_platform_id: uploadResult.videoId,
        updated_at: new Date().toISOString()
      })
      .eq('id', video.id);
    
    // Record republished content
    await supabaseAdmin
      .from('republished_content')
      .insert({
        workflow_id: video.workflow_id,
        source_platform: video.source_platform,
        target_platform: video.workflow.target_platform,
        source_video_id: video.platform_video_id,
        target_video_id: uploadResult.videoId,
        title: video.title,
        description: video.description,
        status: 'published'
      });
      
    return { 
      videoId: video.id, 
      status: 'completed',
      targetVideoId: uploadResult.videoId 
    };
    
  } catch (error) {
    console.error(`Error processing video ${video.id}:`, error);
    
    // Mark as failed
    await supabaseAdmin
      .from('video_queue')
      .update({ 
        status: 'failed', 
        error_message: error.message,
        updated_at: new Date().toISOString() 
      })
      .eq('id', video.id);
    
    return { 
      videoId: video.id, 
      status: 'failed',
      error: error.message 
    };
  }
}

async function downloadVideo(
  platform: string,
  videoId: string,
  accessToken: string
): Promise<VideoData> {
  console.log(`Downloading ${platform} video: ${videoId}`);
  
  switch (platform) {
    case 'tiktok':
      return downloadTikTokVideo(videoId, accessToken);
    case 'youtube':
      return downloadYouTubeVideo(videoId, accessToken);
    default:
      return { success: false, error: `Unsupported platform: ${platform}` };
  }
}

async function uploadVideo(
  platform: string,
  videoUrl: string,
  title: string,
  description: string,
  accessToken: string
): Promise<UploadResult> {
  console.log(`Uploading to ${platform}: ${title}`);
  
  switch (platform) {
    case 'tiktok':
      return uploadToTikTok(videoUrl, title, description, accessToken);
    case 'youtube':
      return uploadToYouTube(videoUrl, title, description, accessToken);
    default:
      return { success: false, error: `Unsupported platform: ${platform}` };
  }
}
