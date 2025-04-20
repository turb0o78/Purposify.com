
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
    const error = url.searchParams.get('error')
    const errorDescription = url.searchParams.get('error_description')
    
    console.log('TikTok callback received with parameters:', { 
      codeExists: !!code, 
      stateExists: !!state,
      error,
      errorDescription 
    })
    
    // Check for TikTok-returned errors first
    if (error) {
      throw new Error(`TikTok authorization error: ${error} - ${errorDescription || 'No description provided'}`)
    }
    
    if (!code) {
      throw new Error('Missing authorization code')
    }
    
    if (!state) {
      throw new Error('Missing state parameter')
    }

    // Extract user ID from state (format: userId_csrfToken)
    const userId = state.split('_')[0]
    if (!userId) {
      throw new Error('Invalid state format')
    }

    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY')
    if (!clientKey) {
      throw new Error('TikTok client key not configured')
    }
    
    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET')
    if (!clientSecret) {
      throw new Error('TikTok client secret not configured')
    }

    // Must match exactly what was used in the authorization request
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/tiktok-oauth-callback`

    console.log('Exchanging code for access token with redirect URI:', redirectUri)

    // Exchange code for access token (using v2 API)
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }).toString(),
    })

    const tokenData = await tokenResponse.json()
    console.log('Token response status:', tokenResponse.status)
    
    if (!tokenResponse.ok) {
      console.error('Failed to get access token:', tokenData)
      throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`)
    }

    console.log('Successfully obtained access token')

    // Get user info using the new access token
    const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    const userData = await userResponse.json()
    console.log('User info response status:', userResponse.status)
    
    if (!userResponse.ok) {
      console.error('Failed to get user info:', userData)
      throw new Error(`Failed to get user info: ${JSON.stringify(userData)}`)
    }

    console.log('Successfully obtained user info', userData)

    // Store connection in database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extract user data from the TikTok response (V2 API structure)
    const userInfo = userData.data?.user || {};
    
    await supabaseClient.from('platform_connections').upsert({
      user_id: userId,
      platform: 'tiktok',
      platform_user_id: userInfo.open_id || 'unknown',
      platform_username: userInfo.display_name || userInfo.nickname || 'TikTok User',
      platform_avatar_url: userInfo.avatar_url || userInfo.avatar_large_url || null,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
    })

    console.log('Successfully stored connection in database')

    // Redirect back to app with success parameter
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': 'https://reel-stream-forge.lovable.app/connections?success=true',
      },
    })
  } catch (error) {
    console.error('TikTok OAuth callback error:', error.message)
    
    // Redirect back to app with error parameter
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': 'https://reel-stream-forge.lovable.app/connections?error=' + encodeURIComponent(error.message),
      },
    })
  }
})
