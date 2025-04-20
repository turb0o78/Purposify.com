
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/'

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
    if (!clientKey) {
      console.error('Missing TIKTOK_CLIENT_KEY environment variable')
      throw new Error('TikTok client key not configured')
    }

    // Make sure redirect URI is exactly as registered in TikTok developer portal
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/tiktok-oauth-callback`
    
    console.log('Initiating TikTok OAuth with redirect URI:', redirectUri)
    console.log('Using client key:', clientKey)
    
    // Generate a random string to use as a CSRF protection token (combined with user ID)
    const csrfToken = crypto.randomUUID()
    const state = `${user.id}_${csrfToken}`
    
    // Format params exactly as required by TikTok documentation
    const params = new URLSearchParams()
    params.append('client_key', clientKey)
    params.append('response_type', 'code')
    params.append('scope', 'user.info.basic,video.list')
    params.append('redirect_uri', redirectUri)
    params.append('state', state)
    params.append('disable_auto_auth', '1') // Force the authorization screen to show
    
    const authUrl = `${TIKTOK_AUTH_URL}?${params.toString()}`
    console.log('Authorization URL:', authUrl)

    return new Response(
      JSON.stringify({ url: authUrl }),
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
