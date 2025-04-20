
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
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    
    if (!code || !state) {
      throw new Error('Missing code or state')
    }

    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY')
    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET')
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/tiktok-oauth-callback`

    // Exchange code for access token
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token')
    }

    // Get user info
    const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    // Store connection in database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabaseClient.from('platform_connections').upsert({
      user_id: state,
      platform: 'tiktok',
      platform_user_id: userData.user_id,
      platform_username: userData.display_name,
      platform_avatar_url: userData.avatar_url,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    })

    // Redirect back to app
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': '/connections?success=true',
      },
    })
  } catch (error) {
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': '/connections?error=' + encodeURIComponent(error.message),
      },
    })
  }
})
