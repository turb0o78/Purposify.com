
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const requestBody = await req.json().catch(() => ({}));
  console.log('Request received with body:', requestBody);

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Try to get user from either the authorization header or request body
    let user = null;
    
    // First try from authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      console.log('Auth header found');
      const token = authHeader.replace('Bearer ', '');
      const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);
      
      if (authError) {
        console.error('Authentication error from header:', authError);
      } else if (authData?.user) {
        user = authData.user;
        console.log('User authenticated from header:', user.id);
      }
    }
    
    // If no user from header, try from request body
    if (!user && requestBody.userId) {
      console.log('Using userId from request body:', requestBody.userId);
      user = { id: requestBody.userId };
    }
    
    if (!user) {
      throw new Error('Authentication required. Please provide a valid session token or userId.');
    }

    const clientId = Deno.env.get('YOUTUBE_CLIENT_ID')
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/youtube-oauth-callback`
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload',
      state: user.id,
      access_type: 'offline',
      prompt: 'consent',
    })

    return new Response(
      JSON.stringify({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('YouTube OAuth error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
