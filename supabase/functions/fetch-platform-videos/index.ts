
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
    
    // Log details about connections
    connections.forEach(conn => {
      console.log(`Connection: platform=${conn.platform}, username=${conn.platform_username || 'Unknown'}, token=${conn.access_token ? 'present' : 'missing'}`);
    });

    const videos = [];

    // Fetch TikTok videos
    const tiktokConnection = connections.find(c => c.platform === 'tiktok');
    if (tiktokConnection) {
      console.log(`Found TikTok connection for user: ${tiktokConnection.platform_username || 'Unknown'}`);
      try {
        console.log('Fetching TikTok videos with access token');
        
        // For sandbox mode, we need to handle the API differently
        // First try the standard v2 API approach
        const tiktokResponse = await fetch(
          'https://open.tiktokapis.com/v2/video/list/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tiktokConnection.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: ["id", "title", "video_description", "duration", "cover_image_url", "create_time", "share_url"]
          })
        });

        const responseText = await tiktokResponse.text();
        console.log(`TikTok API raw response: ${responseText.substring(0, 500)}...`);
        
        if (tiktokResponse.ok) {
          try {
            const tiktokData = JSON.parse(responseText);
            
            if (tiktokData.data && tiktokData.data.videos && Array.isArray(tiktokData.data.videos)) {
              console.log(`Found ${tiktokData.data.videos.length} TikTok videos`);
              
              const tiktokVideos = tiktokData.data.videos.map(video => ({
                id: video.id,
                platform: 'tiktok',
                title: video.title || 'Untitled TikTok Video',
                description: video.video_description,
                thumbnail: video.cover_image_url,
                duration: video.duration,
                createdAt: new Date(video.create_time * 1000),
                shareUrl: video.share_url
              }));
              
              videos.push(...tiktokVideos);
            } else {
              console.log('No videos found in TikTok response or invalid response format:', 
                          JSON.stringify(tiktokData).substring(0, 500));
                
              // For sandbox mode, we may need to create some mock data
              if (tiktokConnection.platform_username && tiktokConnection.platform_username.includes('Sandbox')) {
                console.log('Creating sample videos for sandbox mode');
                // Add mock videos for testing in sandbox mode
                const mockVideos = [
                  {
                    id: 'sand-1',
                    platform: 'tiktok',
                    title: 'Sandbox Test Video 1',
                    description: 'This is a sample video for TikTok sandbox testing',
                    thumbnail: 'https://via.placeholder.com/300x500.png?text=TikTok+Sandbox',
                    duration: 30,
                    createdAt: new Date(),
                  },
                  {
                    id: 'sand-2',
                    platform: 'tiktok',
                    title: 'Sandbox Test Video 2',
                    description: 'Another sample video for TikTok sandbox mode',
                    thumbnail: 'https://via.placeholder.com/300x500.png?text=TikTok+Sandbox+2',
                    duration: 45,
                    createdAt: new Date(Date.now() - 86400000), // 1 day ago
                  }
                ];
                videos.push(...mockVideos);
                console.log('Added sample videos for sandbox mode:', mockVideos.length);
              }
            }
          } catch (parseError) {
            console.error('Error parsing TikTok API response:', parseError);
            throw new Error(`Failed to parse TikTok API response: ${responseText.substring(0, 100)}...`);
          }
        } else {
          console.error(`Error fetching TikTok videos: Status ${tiktokResponse.status} - ${responseText}`);
          
          // For sandbox mode, create sample data if we detect it's probably sandbox mode
          if (tiktokConnection.platform_username && tiktokConnection.platform_username.includes('Sandbox')) {
            console.log('Creating sample videos for sandbox mode due to API error');
            // Add mock videos for testing in sandbox mode
            const mockVideos = [
              {
                id: 'sand-1',
                platform: 'tiktok',
                title: 'Sandbox Test Video 1',
                description: 'This is a sample video for TikTok sandbox testing',
                thumbnail: 'https://via.placeholder.com/300x500.png?text=TikTok+Sandbox',
                duration: 30,
                createdAt: new Date(),
              },
              {
                id: 'sand-2',
                platform: 'tiktok',
                title: 'Sandbox Test Video 2',
                description: 'Another sample video for TikTok sandbox mode',
                thumbnail: 'https://via.placeholder.com/300x500.png?text=TikTok+Sandbox+2',
                duration: 45,
                createdAt: new Date(Date.now() - 86400000), // 1 day ago
              }
            ];
            videos.push(...mockVideos);
            console.log('Added sample videos for sandbox mode:', mockVideos.length);
          } else {
            throw new Error(`TikTok API error: Status ${tiktokResponse.status}`);
          }
        }
      } catch (error) {
        console.error('Error fetching TikTok videos:', error);
        
        // For sandbox testing, we'll add mock videos
        if (tiktokConnection.platform_username && tiktokConnection.platform_username.includes('Sandbox')) {
          console.log('Creating sample videos for sandbox mode after error');
          const mockVideos = [
            {
              id: 'sand-error-1',
              platform: 'tiktok',
              title: 'Sandbox Test Video (Error Fallback)',
              description: 'This is a sample video created after an API error',
              thumbnail: 'https://via.placeholder.com/300x500.png?text=TikTok+Sandbox+Error',
              duration: 30,
              createdAt: new Date(),
            }
          ];
          videos.push(...mockVideos);
        } else {
          throw new Error(`Failed to fetch TikTok videos: ${error.message}`);
        }
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
