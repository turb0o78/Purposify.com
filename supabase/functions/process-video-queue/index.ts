import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { processVideo } from "./video-processor.ts";
import type { QueuedVideo } from "./types.ts";

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
    // Check if a specific video ID is provided
    let specificVideoId: string | undefined;
    try {
      const body = await req.json();
      specificVideoId = body.specificVideoId;
    } catch (e) {
      // No body or invalid JSON, proceed with all pending videos
    }

    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get videos from queue that need processing
    let query = supabaseAdmin
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
      .order('created_at', { ascending: true });

    // If a specific video ID is provided, query only that video regardless of status
    if (specificVideoId) {
      query = query.eq('id', specificVideoId);
    } else {
      // Otherwise, get pending videos only
      query = query.eq('status', 'pending');
    }

    // Limit to 5 videos if processing all pending videos
    if (!specificVideoId) {
      query = query.limit(5);
    }

    const { data: queuedVideos, error: queueError } = await query;

    if (queueError) {
      throw new Error(`Error fetching video queue: ${queueError.message}`);
    }

    console.log(`Found ${queuedVideos.length} videos to process in queue`);
    
    if (queuedVideos.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No videos to process',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const results = [];
    
    for (const video of (queuedVideos as QueuedVideo[])) {
      const result = await processVideo(video, supabaseAdmin);
      results.push(result);
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
