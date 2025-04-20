
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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { session }, error: authError } = await supabaseClient.auth.getSession()
    if (authError || !session) {
      throw new Error('Not authenticated')
    }

    const clientId = Deno.env.get('YOUTUBE_CLIENT_ID')
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/youtube-oauth-callback`
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload',
      state: session.user.id,
      access_type: 'offline',
      prompt: 'consent',
    })

    return new Response(
      JSON.stringify({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
