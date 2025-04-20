
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
      .limit(5);

    if (queueError) {
      throw new Error(`Error fetching video queue: ${queueError.message}`);
    }

    console.log(`Found ${queuedVideos.length} videos to process in queue`);
    
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
