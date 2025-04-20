
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TIKTOK_AUTH_URL = 'https://www.tiktok.com/auth/authorize/'

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

    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY')
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/tiktok-oauth-callback`
    
    const params = new URLSearchParams({
      client_key: clientKey,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'user.info.basic,video.list',
      state: session.user.id,
    })

    return new Response(
      JSON.stringify({ url: `${TIKTOK_AUTH_URL}?${params.toString()}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
