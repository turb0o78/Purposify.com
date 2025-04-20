
import { VideoData, UploadResult } from '../types.ts';

export async function downloadTikTokVideo(videoId: string, accessToken: string): Promise<VideoData> {
  try {
    const response = await fetch(
      `https://open.tiktokapis.com/v2/video/query/?fields=video_description,video_url&video_ids=${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TikTok API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    const videoUrl = data?.data?.videos?.[0]?.video_url;
    
    if (!videoUrl) {
      throw new Error('Could not get video URL from TikTok API');
    }
    
    return { success: true, videoUrl };
  } catch (error) {
    console.error('Error downloading TikTok video:', error);
    return { success: false, error: error.message };
  }
}

export async function uploadToTikTok(
  videoUrl: string, 
  title: string, 
  description: string, 
  accessToken: string
): Promise<UploadResult> {
  try {
    console.log('Initiating TikTok direct upload');
    
    const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post_info: {
          title,
          privacy_level: 'SELF_ONLY',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 0
        }
      })
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      throw new Error(`TikTok upload initialization failed: ${errorText}`);
    }

    const initData = await initResponse.json();
    console.log('TikTok upload initialized:', initData);

    const videoResponse = await fetch(videoUrl);
    const videoBuffer = await videoResponse.arrayBuffer();

    const uploadResponse = await fetch(initData.data.upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4'
      },
      body: videoBuffer
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload video to TikTok');
    }

    const completeResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/complete/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_id: initData.data.video_id,
        post_info: {
          title,
          description,
          privacy_level: 'SELF_ONLY',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false
        }
      })
    });

    if (!completeResponse.ok) {
      const errorText = await completeResponse.text();
      throw new Error(`Failed to complete TikTok upload: ${errorText}`);
    }

    const completeData = await completeResponse.json();
    console.log('TikTok upload completed:', completeData);

    return {
      success: true,
      videoId: completeData.data.video_id,
      url: `https://www.tiktok.com/@username/video/${completeData.data.video_id}`
    };
  } catch (error) {
    console.error('Error uploading to TikTok:', error);
    return { success: false, error: error.message };
  }
}
