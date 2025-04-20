
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user auth info from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // Verify the JWT token to get the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error(`Authentication error: ${authError?.message || 'Invalid token'}`);
    }

    console.log(`Fetching connections for user: ${user.id}`);

    // Get user connections
    const { data: connections, error: connectionsError } = await supabaseClient
      .from('platform_connections')
      .select('*')
      .eq('user_id', user.id);

    if (connectionsError) {
      throw new Error(`Error fetching connections: ${connectionsError.message}`);
    }

    console.log(`Found ${connections?.length || 0} connections for user ${user.id}`);

    const videos = [];

    // Fetch TikTok videos
    const tiktokConnection = connections.find(c => c.platform === 'tiktok');
    if (tiktokConnection) {
      console.log(`Found TikTok connection for user: ${tiktokConnection.platform_username || 'Unknown'}`);
      try {
        console.log('Fetching TikTok videos with access token');
        const tiktokResponse = await fetch(
          `https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,thumbnail_uri,create_time`,
          {
            headers: {
              'Authorization': `Bearer ${tiktokConnection.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (tiktokResponse.ok) {
          const tiktokData = await tiktokResponse.json();
          console.log(`TikTok API response: ${JSON.stringify(tiktokData).substring(0, 200)}...`);
          
          if (tiktokData.data && tiktokData.data.videos && Array.isArray(tiktokData.data.videos)) {
            console.log(`Found ${tiktokData.data.videos.length} TikTok videos`);
            const tiktokVideos = tiktokData.data.videos.map(video => ({
              id: video.id,
              platform: 'tiktok',
              title: video.title || 'Untitled TikTok Video',
              description: video.video_description,
              thumbnail: video.thumbnail_uri,
              duration: video.duration,
              createdAt: new Date(video.create_time * 1000),
            }));
            videos.push(...tiktokVideos);
          } else {
            console.log('No videos found in TikTok response or invalid response format');
          }
        } else {
          const errorText = await tiktokResponse.text();
          console.error(`Error fetching TikTok videos: Status ${tiktokResponse.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Error fetching TikTok videos:', error);
      }
    } else {
      console.log('No TikTok connection found for this user');
    }

    // Fetch YouTube videos
    const youtubeConnection = connections.find(c => c.platform === 'youtube');
    if (youtubeConnection) {
      console.log(`Found YouTube connection for user: ${youtubeConnection.platform_username || 'Unknown'}`);
      try {
        console.log('Fetching YouTube videos with access token');
        const youtubeResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&type=video&forMine=true&key=${Deno.env.get('YOUTUBE_CLIENT_ID')}`,
          {
            headers: {
              'Authorization': `Bearer ${youtubeConnection.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (youtubeResponse.ok) {
          const youtubeData = await youtubeResponse.json();
          console.log(`YouTube API response: ${JSON.stringify(youtubeData).substring(0, 200)}...`);
          
          if (youtubeData.items && Array.isArray(youtubeData.items)) {
            console.log(`Found ${youtubeData.items.length} YouTube videos`);
            const youtubeVideos = youtubeData.items.map(item => ({
              id: item.id.videoId,
              platform: 'youtube',
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnail: item.snippet.thumbnails.high?.url,
              createdAt: new Date(item.snippet.publishedAt),
            }));
            videos.push(...youtubeVideos);
          } else {
            console.log('No videos found in YouTube response or invalid response format');
          }
        } else {
          const errorText = await youtubeResponse.text();
          console.error(`Error fetching YouTube videos: Status ${youtubeResponse.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
      }
    } else {
      console.log('No YouTube connection found for this user');
    }

    console.log(`Returning ${videos.length} total videos`);

    return new Response(
      JSON.stringify({ videos }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
