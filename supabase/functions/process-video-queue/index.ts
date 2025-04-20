
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get videos from queue that need processing
    const { data: queuedVideos, error: queueError } = await supabaseAdmin
      .from('video_queue')
      .select(`
        *,
        workflow:workflow_id(
          id,
          name,
          source_platform,
          target_platform,
          source_connection:source_connection_id(*),
          target_connection:target_connection_id(*)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5); // Process 5 at a time to avoid timeout

    if (queueError) {
      throw new Error(`Error fetching video queue: ${queueError.message}`);
    }

    console.log(`Found ${queuedVideos.length} videos to process in queue`);
    
    const results = [];
    
    for (const video of queuedVideos) {
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
          videoData.videoUrl,
          video.title,
          video.description,
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
          
        results.push({ 
          videoId: video.id, 
          status: 'completed',
          targetVideoId: uploadResult.videoId 
        });
        
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
        
        results.push({ 
          videoId: video.id, 
          status: 'failed',
          error: error.message 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${queuedVideos.length} videos`, 
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing video queue:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function downloadVideo(platform: string, videoId: string, accessToken: string) {
  console.log(`Downloading ${platform} video: ${videoId}`);
  
  try {
    // Note: In a real implementation, we would download the actual video file
    // For this example, we'll simulate by returning the video URL
    // A full implementation would use platform-specific download APIs or third-party services
    
    if (platform === 'tiktok') {
      // For TikTok, we need to get the video URL first
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
    } 
    else if (platform === 'youtube') {
      // For YouTube, we would need to use youtube-dl or a similar tool
      // For this example, we'll simulate with a direct URL
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      return { success: true, videoUrl };
    }
    
    throw new Error(`Unsupported platform: ${platform}`);
  } catch (error) {
    console.error(`Error downloading ${platform} video:`, error);
    return { success: false, error: error.message };
  }
}

async function uploadVideo(platform: string, videoUrl: string, title: string, description: string, accessToken: string) {
  console.log(`Uploading to ${platform}: ${title}`);
  
  try {
    // Note: In a real implementation, we would upload the actual video file
    // For this example, we'll simulate the upload process
    // A full implementation would use platform-specific upload APIs
    
    if (platform === 'youtube') {
      // YouTube upload would typically use the YouTube Data API
      console.log(`Simulating YouTube upload for: ${title}`);
      
      // A real implementation would upload the video using the YouTube API
      // For now, we'll just simulate a successful upload
      const simulatedVideoId = `YT_${Date.now().toString(36)}`;
      
      return { 
        success: true, 
        videoId: simulatedVideoId,
        url: `https://www.youtube.com/watch?v=${simulatedVideoId}` 
      };
    } 
    else if (platform === 'tiktok') {
      // TikTok upload would use the TikTok API
      console.log(`Simulating TikTok upload for: ${title}`);
      
      // A real implementation would upload the video using the TikTok API
      // For now, we'll just simulate a successful upload
      const simulatedVideoId = `TT_${Date.now().toString(36)}`;
      
      return { 
        success: true, 
        videoId: simulatedVideoId,
        url: `https://www.tiktok.com/@username/video/${simulatedVideoId}` 
      };
    }
    
    throw new Error(`Unsupported platform: ${platform}`);
  } catch (error) {
    console.error(`Error uploading to ${platform}:`, error);
    return { success: false, error: error.message };
  }
}
