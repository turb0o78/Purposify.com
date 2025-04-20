
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

    // Get user connections
    const { data: connections, error: connectionsError } = await supabaseClient
      .from('platform_connections')
      .select('*');

    if (connectionsError) {
      throw new Error(`Error fetching connections: ${connectionsError.message}`);
    }

    const videos = [];

    // Fetch TikTok videos
    const tiktokConnection = connections.find(c => c.platform === 'tiktok');
    if (tiktokConnection) {
      try {
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
          const tiktokVideos = tiktokData.data.videos.map(video => ({
            id: video.id,
            platform: 'tiktok',
            title: video.title,
            description: video.video_description,
            thumbnail: video.thumbnail_uri,
            duration: video.duration,
            createdAt: new Date(video.create_time * 1000),
          }));
          videos.push(...tiktokVideos);
        } else {
          console.error('Error fetching TikTok videos:', await tiktokResponse.text());
        }
      } catch (error) {
        console.error('Error fetching TikTok videos:', error);
      }
    }

    // Fetch YouTube videos
    const youtubeConnection = connections.find(c => c.platform === 'youtube');
    if (youtubeConnection) {
      try {
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
          console.error('Error fetching YouTube videos:', await youtubeResponse.text());
        }
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
      }
    }

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
