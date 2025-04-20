
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
      errorDescription,
      rawUrl: req.url
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

    // Log raw token response for debugging
    const tokenResponseText = await tokenResponse.text();
    console.log('Raw token response:', tokenResponseText);
    
    let tokenData;
    try {
      tokenData = JSON.parse(tokenResponseText);
      console.log('Token response status:', tokenResponse.status);
      
      if (!tokenResponse.ok) {
        console.error('Failed to get access token:', tokenData);
        throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
      }
    } catch (parseError) {
      console.error('Failed to parse token response:', parseError);
      throw new Error(`Failed to parse token response: ${tokenResponseText.substring(0, 100)}...`);
    }

    console.log('Successfully obtained access token');

    // Store connection with just token info initially
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if connection already exists for this user and platform
    const { data: existingConnection } = await supabaseClient
      .from('platform_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', 'tiktok')
      .maybeSingle();
      
    // We'll store basic profile info that we got from the token response
    const platformUserId = tokenData.open_id || 'unknown';
    
    try {
      // Try to get user details - if this fails, we'll still create the connection
      // with the basic info we have from the token response
      if (existingConnection) {
        await supabaseClient
          .from('platform_connections')
          .update({
            platform_user_id: platformUserId,
            platform_username: 'TikTok User', 
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
            updated_at: new Date().toISOString(),
            scopes: tokenData.scope || 'user.info.basic,video.list'
          })
          .eq('id', existingConnection.id);
        
        console.log('Successfully updated existing connection in database');
      } else {
        await supabaseClient.from('platform_connections').insert({
          user_id: userId,
          platform: 'tiktok',
          platform_user_id: platformUserId,
          platform_username: 'TikTok User',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
          scopes: tokenData.scope || 'user.info.basic,video.list'
        });
        
        console.log('Successfully created new connection in database');
      }
    } catch (dbError) {
      console.error('Error storing connection in database:', dbError);
      throw new Error('Failed to store connection data');
    }

    // Redirect back to app with success parameter
    const redirectUrl = 'https://reel-stream-forge.lovable.app/connections?success=true';
    console.log('Redirecting to:', redirectUrl);
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    });
  } catch (error) {
    console.error('TikTok OAuth callback error:', error.message);
    
    // Redirect back to app with error parameter
    const errorUrl = 'https://reel-stream-forge.lovable.app/connections?error=' + encodeURIComponent(error.message);
    console.log('Redirecting to error URL:', errorUrl);
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': errorUrl,
      },
    });
  }
})
