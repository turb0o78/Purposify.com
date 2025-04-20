
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

    // This function will be triggered by a cron job or manually
    // Get all active workflows
    const { data: workflows, error: workflowsError } = await supabaseAdmin
      .from('workflows')
      .select('*, source_connection:source_connection_id(*), target_connection:target_connection_id(*)')
      .eq('is_active', true);

    if (workflowsError) {
      throw new Error(`Error fetching workflows: ${workflowsError.message}`);
    }

    console.log(`Found ${workflows.length} active workflows`);
    
    const results = [];
    
    // Process each workflow
    for (const workflow of workflows) {
      try {
        // Check source platform for new videos
        if (workflow.source_platform === 'tiktok') {
          const result = await checkTikTokForNewVideos(
            workflow.source_connection.access_token, 
            workflow.source_connection.platform_user_id, 
            workflow.id,
            supabaseAdmin
          );
          results.push({ workflow: workflow.id, platform: 'tiktok', result });
        } else if (workflow.source_platform === 'youtube') {
          const result = await checkYouTubeForNewVideos(
            workflow.source_connection.access_token, 
            workflow.source_connection.platform_user_id, 
            workflow.id,
            supabaseAdmin
          );
          results.push({ workflow: workflow.id, platform: 'youtube', result });
        }
      } catch (workflowError) {
        console.error(`Error processing workflow ${workflow.id}:`, workflowError);
        results.push({ 
          workflow: workflow.id, 
          platform: workflow.source_platform, 
          error: workflowError.message 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${workflows.length} workflows`, 
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking new videos:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkTikTokForNewVideos(accessToken: string, userId: string, workflowId: string, supabase: any) {
  console.log(`Checking TikTok videos for user ID: ${userId}`);
  
  try {
    // Check if we need to refresh the token
    // This would normally be done in a separate function that handles token refreshing
    
    // Get videos using TikTok API v2
    const response = await fetch(`https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,thumbnail_uri,embed_html,embed_link,like_count,comment_count,share_count,view_count,create_time`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TikTok API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(`Found ${data.data.videos?.length || 0} videos on TikTok`);
    
    // Get videos we've already processed
    const { data: processedVideos, error: processedError } = await supabase
      .from('processed_videos')
      .select('platform_video_id')
      .eq('workflow_id', workflowId)
      .eq('source_platform', 'tiktok');
      
    if (processedError) {
      throw new Error(`Error fetching processed videos: ${processedError.message}`);
    }
    
    const processedIds = new Set(processedVideos.map(v => v.platform_video_id));
    const newVideos = data.data.videos?.filter(video => !processedIds.has(video.id)) || [];
    
    console.log(`Found ${newVideos.length} new TikTok videos to process`);
    
    // Process new videos
    for (const video of newVideos) {
      // Queue video for processing
      await supabase.from('video_queue').insert({
        workflow_id: workflowId,
        source_platform: 'tiktok',
        platform_video_id: video.id,
        title: video.title || '',
        description: video.video_description || '',
        thumbnail: video.thumbnail_uri || '',
        duration: video.duration,
        status: 'pending'
      });
      
      // Mark as processed
      await supabase.from('processed_videos').insert({
        workflow_id: workflowId,
        source_platform: 'tiktok',
        platform_video_id: video.id,
        processed_at: new Date().toISOString()
      });
    }
    
    return { 
      success: true, 
      message: `Processed ${newVideos.length} new TikTok videos` 
    };
  } catch (error) {
    console.error('TikTok API error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

async function checkYouTubeForNewVideos(accessToken: string, channelId: string, workflowId: string, supabase: any) {
  console.log(`Checking YouTube videos for channel ID: ${channelId}`);
  
  try {
    // Check if we need to refresh the token first
    // This would be handled by a token refresh function
    
    // Get videos from YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video&key=${Deno.env.get('YOUTUBE_CLIENT_ID')}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`YouTube API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(`Found ${data.items?.length || 0} videos on YouTube`);
    
    // Get videos we've already processed
    const { data: processedVideos, error: processedError } = await supabase
      .from('processed_videos')
      .select('platform_video_id')
      .eq('workflow_id', workflowId)
      .eq('source_platform', 'youtube');
      
    if (processedError) {
      throw new Error(`Error fetching processed videos: ${processedError.message}`);
    }
    
    const processedIds = new Set(processedVideos.map(v => v.platform_video_id));
    const newVideos = data.items?.filter(item => !processedIds.has(item.id.videoId)) || [];
    
    console.log(`Found ${newVideos.length} new YouTube videos to process`);
    
    // Process new videos
    for (const video of newVideos) {
      // Get video details to get duration
      const videoDetailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${video.id.videoId}&key=${Deno.env.get('YOUTUBE_CLIENT_ID')}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!videoDetailsResponse.ok) {
        console.error(`Error getting details for video ${video.id.videoId}`);
        continue;
      }
      
      const videoDetails = await videoDetailsResponse.json();
      const item = videoDetails.items[0];
      
      // Parse ISO 8601 duration
      let duration = 0;
      if (item?.contentDetails?.duration) {
        const match = item.contentDetails.duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (match) {
          const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
          const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
          const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;
          duration = hours * 3600 + minutes * 60 + seconds;
        }
      }
      
      // Queue video for processing
      await supabase.from('video_queue').insert({
        workflow_id: workflowId,
        source_platform: 'youtube',
        platform_video_id: video.id.videoId,
        title: video.snippet?.title || '',
        description: video.snippet?.description || '',
        thumbnail: video.snippet?.thumbnails?.high?.url || '',
        duration: duration,
        status: 'pending'
      });
      
      // Mark as processed
      await supabase.from('processed_videos').insert({
        workflow_id: workflowId,
        source_platform: 'youtube',
        platform_video_id: video.id.videoId,
        processed_at: new Date().toISOString()
      });
    }
    
    return { 
      success: true, 
      message: `Processed ${newVideos.length} new YouTube videos` 
    };
  } catch (error) {
    console.error('YouTube API error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}
