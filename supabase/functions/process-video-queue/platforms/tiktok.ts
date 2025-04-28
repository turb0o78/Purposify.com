
import { VideoData, UploadResult } from '../types.ts';

export async function downloadTikTokVideo(videoId: string, accessToken: string): Promise<VideoData> {
  try {
    console.log(`Downloading TikTok video with ID: ${videoId}`);
    
    // First try the video query endpoint with the proper fields parameter
    const response = await fetch(
      'https://open.tiktokapis.com/v2/video/query/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: ["video_description", "video_url"],
          video_ids: [videoId]
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TikTok API error (video query): ${response.status} ${errorText}`);
      
      // Fallback to older API format
      const fallbackResponse = await fetch(
        `https://open.tiktokapis.com/v2/video/query/?fields=video_description,video_url&video_ids=${videoId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!fallbackResponse.ok) {
        const fallbackErrorText = await fallbackResponse.text();
        throw new Error(`TikTok API error (fallback): ${fallbackResponse.status} ${fallbackErrorText}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      console.log('TikTok fallback response:', JSON.stringify(fallbackData).substring(0, 500));
      
      const videoUrl = fallbackData?.data?.videos?.[0]?.video_url;
      if (!videoUrl) {
        throw new Error('Could not get video URL from TikTok fallback API');
      }
      
      return { success: true, videoUrl };
    }
    
    const data = await response.json();
    console.log('TikTok API response:', JSON.stringify(data).substring(0, 500));
    
    const videoUrl = data?.data?.videos?.[0]?.video_url;
    if (!videoUrl) {
      throw new Error('Could not get video URL from TikTok API');
    }
    
    console.log(`Successfully obtained video URL: ${videoUrl.substring(0, 50)}...`);
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
    
    // Step 1: Initialize the upload
    const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post_info: {
          title,
          privacy_level: 'SELF_ONLY', // Start as private to avoid errors
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 0
        }
      })
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      console.error(`TikTok upload initialization failed: ${initResponse.status} ${errorText}`);
      throw new Error(`TikTok upload initialization failed: ${errorText}`);
    }

    const initData = await initResponse.json();
    console.log('TikTok upload initialized:', JSON.stringify(initData).substring(0, 300));

    if (!initData?.data?.upload_url || !initData?.data?.video_id) {
      throw new Error('Invalid response from TikTok initialization endpoint');
    }

    // Step 2: Download the video file from the source URL
    console.log('Downloading video from source URL:', videoUrl.substring(0, 50));
    const videoResponse = await fetch(videoUrl);
    
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video from source: ${videoResponse.status}`);
    }
    
    const videoBuffer = await videoResponse.arrayBuffer();
    console.log(`Downloaded video buffer size: ${videoBuffer.byteLength} bytes`);

    // Step 3: Upload the video to TikTok's storage
    console.log('Uploading video to TikTok:', initData.data.upload_url.substring(0, 50));
    const uploadResponse = await fetch(initData.data.upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4'
      },
      body: videoBuffer
    });

    if (!uploadResponse.ok) {
      const uploadErrorText = await uploadResponse.text();
      console.error(`Failed to upload video to TikTok: ${uploadResponse.status} ${uploadErrorText}`);
      throw new Error(`Failed to upload video to TikTok: Status ${uploadResponse.status}`);
    }

    console.log('Video uploaded to TikTok successfully, now finalizing...');

    // Step 4: Complete the upload process
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
          description, // Include description in completion step
          privacy_level: 'SELF_ONLY', // Start as private so creator can review
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false
        }
      })
    });

    if (!completeResponse.ok) {
      const errorText = await completeResponse.text();
      console.error(`Failed to complete TikTok upload: ${completeResponse.status} ${errorText}`);
      throw new Error(`Failed to complete TikTok upload: ${errorText}`);
    }

    const completeData = await completeResponse.json();
    console.log('TikTok upload completed:', JSON.stringify(completeData).substring(0, 300));

    if (!completeData?.data?.video_id) {
      throw new Error('Invalid response from TikTok completion endpoint');
    }

    // Construct the TikTok video URL using the username from platform connections
    // This is a placeholder - the actual URL will need the username from the platform connection
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
