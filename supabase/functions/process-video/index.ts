
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
    const { videoId } = await req.json();

    if (!videoId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Video ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the video information
    const { data: videoData, error: videoError } = await supabaseAdmin
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
      .eq('id', videoId)
      .single();

    if (videoError) {
      console.error('Error fetching video:', videoError);
      return new Response(
        JSON.stringify({ success: false, error: `Error fetching video: ${videoError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!videoData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Video not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the video status to processing
    const { error: updateError } = await supabaseAdmin
      .from('video_queue')
      .update({ 
        status: 'processing', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', videoId);

    if (updateError) {
      console.error('Error updating video status:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: `Error updating video status: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call the process-video-queue function to process this video
    // This is done in the background without waiting for it to complete
    fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-video-queue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ specificVideoId: videoId })
    }).catch(err => {
      console.error('Error calling process-video-queue:', err);
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video processing started',
        video: {
          id: videoData.id,
          title: videoData.title,
          status: 'processing',
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing video:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
