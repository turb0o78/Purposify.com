
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
    console.log('TikTok OAuth callback function started');
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
    
    if (error) {
      throw new Error(`TikTok authorization error: ${error} - ${errorDescription || 'No description provided'}`)
    }
    
    if (!code) {
      throw new Error('Missing authorization code')
    }
    
    if (!state) {
      throw new Error('Missing state parameter')
    }

    const userId = state.split('_')[0]
    if (!userId) {
      throw new Error('Invalid state format')
    }

    console.log('Processing request for user ID:', userId);

    const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY')
    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET')
    
    if (!clientKey || !clientSecret) {
      throw new Error('TikTok credentials not configured')
    }

    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/tiktok-oauth-callback`

    console.log('Exchanging code for access token with redirect URI:', redirectUri)

    // Exchange code for access token
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

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`Failed to get access token: Status ${tokenResponse.status}`, errorText);
      throw new Error(`Failed to get access token: Status ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Successfully obtained access token');

    if (!tokenData.access_token) {
      throw new Error('No access token received from TikTok');
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token || null;
    const expiresIn = tokenData.expires_in || 86400;
    const scope = tokenData.scope || 'user.info.basic,video.list,video.upload';
    const openId = tokenData.open_id || null;
    
    console.log(`Access token obtained with scopes: ${scope}, open_id: ${openId}`);

    // Get user profile information using the correct TikTok API v2 endpoint
    let username = null;
    let displayName = null;
    let avatarUrl = null;
    let platformUserId = openId;
    
    try {
      console.log('Fetching TikTok user profile information with access token');
      
      // Use the correct TikTok API v2 user info endpoint for sandbox mode
      const userInfoResponse = await fetch(
        'https://open.tiktokapis.com/v2/user/info/', 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: [
              "open_id", 
              "union_id", 
              "avatar_url", 
              "avatar_url_100", 
              "avatar_large_url", 
              "display_name", 
              "username",
              "bio_description",
              "profile_deep_link"
            ]
          })
        }
      );
      
      console.log(`User info response status: ${userInfoResponse.status}`);
      const responseText = await userInfoResponse.text();
      console.log('User info response body:', responseText);
      
      if (userInfoResponse.ok) {
        const userInfoData = JSON.parse(responseText);
        console.log('Parsed user info data:', JSON.stringify(userInfoData, null, 2));
        
        if (userInfoData && userInfoData.data && userInfoData.data.user) {
          const user = userInfoData.data.user;
          displayName = user.display_name;
          username = user.username || user.display_name;
          avatarUrl = user.avatar_large_url || user.avatar_url_100 || user.avatar_url;
          platformUserId = user.open_id || openId;
          
          console.log(`Successfully retrieved user profile: display_name=${displayName}, username=${username}, avatar=${avatarUrl ? 'present' : 'missing'}, open_id=${platformUserId}`);
        } else {
          console.log('User data not found in expected format. Response structure:', JSON.stringify(userInfoData, null, 2));
          
          // In sandbox mode, TikTok might return limited data, so let's use what we have
          if (openId) {
            platformUserId = openId;
            username = `TikTok_${openId.substring(0, 8)}`;
            displayName = username;
            console.log(`Using sandbox fallback: username=${username}, open_id=${platformUserId}`);
          }
        }
      } else {
        console.error(`Failed to get user info: Status ${userInfoResponse.status}`, responseText);
        
        // For sandbox mode, create a meaningful username from the open_id
        if (openId) {
          platformUserId = openId;
          username = `TikTok_${openId.substring(0, 8)}`;
          displayName = username;
          console.log(`Using error fallback for sandbox: username=${username}, open_id=${platformUserId}`);
        } else {
          throw new Error('Unable to retrieve user information and no open_id available');
        }
      }
      
      // Ensure we have minimum required data
      if (!platformUserId) {
        throw new Error('Unable to retrieve platform user ID from TikTok');
      }
      
      if (!username && !displayName) {
        username = `TikTok_${platformUserId.substring(0, 8)}`;
        displayName = username;
        console.log(`Using final fallback username: ${username}`);
      }
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase credentials not configured');
      }

      console.log('Creating Supabase client');
      const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

      // Check for existing connection
      const { data: existingConnection, error: fetchError } = await supabaseClient
        .from('platform_connections')
        .select('id')
        .eq('user_id', userId)
        .eq('platform', 'tiktok')
        .maybeSingle();
        
      if (fetchError) {
        console.error('Error checking for existing connection:', fetchError);
        throw new Error(`Failed to check for existing connection: ${fetchError.message}`);
      }

      const finalUsername = username || displayName || `TikTok_${platformUserId.substring(0, 8)}`;
      const connectionData = {
        platform_user_id: platformUserId,
        platform_username: finalUsername,
        platform_avatar_url: avatarUrl,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + (expiresIn * 1000)).toISOString(),
        scopes: scope
      };
      
      console.log('Saving TikTok connection with data:', {
        ...connectionData,
        access_token: 'REDACTED',
        refresh_token: refreshToken ? 'REDACTED' : null
      });
      
      // Update or create connection
      if (existingConnection) {
        console.log('Updating existing connection:', existingConnection.id);
        const { error: updateError } = await supabaseClient
          .from('platform_connections')
          .update({
            ...connectionData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConnection.id);
        
        if (updateError) {
          console.error('Error updating connection:', updateError);
          throw new Error(`Failed to update connection data: ${updateError.message}`);
        }
        
        console.log('Successfully updated TikTok connection');
      } else {
        console.log('Creating new connection for user:', userId);
        const { error: insertError } = await supabaseClient
          .from('platform_connections')
          .insert({
            user_id: userId,
            platform: 'tiktok',
            ...connectionData
          });
        
        if (insertError) {
          console.error('Error creating connection:', insertError);
          throw new Error(`Failed to create connection data: ${insertError.message}`);
        }
        
        console.log('Successfully created new TikTok connection');
      }

      // Verify the connection was saved correctly
      const { data: verifyConnection, error: verifyError } = await supabaseClient
        .from('platform_connections')
        .select('platform_username, platform_user_id, access_token')
        .eq('user_id', userId)
        .eq('platform', 'tiktok')
        .single();
        
      if (verifyError) {
        console.error('Error verifying connection data:', verifyError);
      } else {
        console.log('Verified connection in database:', {
          username: verifyConnection.platform_username,
          user_id: verifyConnection.platform_user_id,
          token_exists: !!verifyConnection.access_token
        });
      }
      
    } catch (userInfoError) {
      console.error('Error in user profile handling:', userInfoError);
      throw userInfoError;
    }

    // Redirect to success page
    const redirectUrl = 'https://opaldesign.fr/connections?success=true';
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
    
    // Redirect to error page
    const errorUrl = 'https://opaldesign.fr/connections?error=' + encodeURIComponent(error.message);
    console.log('Redirecting to error URL:', errorUrl);
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': errorUrl,
      },
    });
  }
});
