
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the user session
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      throw new Error('Not authenticated')
    }

    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY')
    // Use fixed redirect URI without dynamic state parameter in the URI itself
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/tiktok-oauth-callback`
    
    console.log('Initiating TikTok OAuth with redirect URI:', redirectUri)
    
    // State parameter is included separately in the params, not in the URI
    const params = new URLSearchParams({
      client_key: clientKey,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'user.info.basic,video.list',
      state: user.id,
    })

    return new Response(
      JSON.stringify({ url: `${TIKTOK_AUTH_URL}?${params.toString()}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('TikTok OAuth error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
