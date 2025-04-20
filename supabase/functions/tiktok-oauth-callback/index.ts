
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
    const stateComponents = state.split('_');
    if (stateComponents.length < 2) {
      throw new Error('Invalid state format: missing user ID or CSRF token');
    }
    
    const userId = stateComponents[0];
    if (!userId) {
      throw new Error('Invalid state format: missing user ID')
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
      
      if (!tokenResponse.ok || !tokenData.access_token) {
        console.error('Failed to get access token:', tokenData);
        throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
      }
    } catch (parseError) {
      console.error('Failed to parse token response:', parseError);
      throw new Error(`Failed to parse token response: ${tokenResponseText.substring(0, 100)}...`);
    }

    console.log('Successfully obtained access token with expiry:', tokenData.expires_in);

    try {
      // Verify the token was successfully obtained before storing connection
      if (!tokenData.open_id) {
        throw new Error('Missing open_id in token response - cannot identify TikTok user');
      }
      
      // Store connection in database with minimal information
      // TikTok API v2 returns user open_id in the token response
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Delete any existing connection for this user and platform
      // This ensures we don't have duplicate connections
      await supabaseClient
        .from('platform_connections')
        .delete()
        .match({
          user_id: userId,
          platform: 'tiktok'
        });
      
      // Insert the new connection
      const { data: connection, error: insertError } = await supabaseClient
        .from('platform_connections')
        .insert({
          user_id: userId,
          platform: 'tiktok',
          platform_user_id: tokenData.open_id,
          platform_username: 'TikTok User', // Default name since we can't fetch it
          platform_avatar_url: null,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          expires_at: new Date(Date.now() + ((tokenData.expires_in || 86400) * 1000)).toISOString(),
        })
        .select()
        .single();
        
      if (insertError) {
        throw insertError;
      }

      console.log('Successfully stored connection in database:', connection?.id);
    } catch (connectionError) {
      console.error('Error storing connection:', connectionError);
      throw connectionError;
    }

    // Redirect back to app with success parameter
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': 'https://reel-stream-forge.lovable.app/connections?success=true',
      },
    });
  } catch (error) {
    console.error('TikTok OAuth callback error:', error.message);
    
    // Redirect back to app with error parameter
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': 'https://reel-stream-forge.lovable.app/connections?error=' + encodeURIComponent(error.message),
      },
    });
  }
})
