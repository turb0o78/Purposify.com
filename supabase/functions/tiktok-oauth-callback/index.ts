
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

    console.log('Processing request for user ID:', userId);

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

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`Failed to get access token: Status ${tokenResponse.status}`, errorText);
      throw new Error(`Failed to get access token: Status ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Successfully obtained access token');
    console.log('Token response data:', JSON.stringify(tokenData));

    if (!tokenData.access_token) {
      throw new Error('No access token received from TikTok');
    }

    // Fetch user profile information using the correct fields parameter
    let username = null;
    let displayName = null;
    let avatarUrl = null;
    let platformUserId = tokenData.open_id || null;
    
    try {
      console.log('Fetching TikTok user profile information with the access token');
      
      // Using the correct fields parameter as specified in the documentation
      const userInfoResponse = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count', 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('User info response status:', userInfoResponse.status);
      
      if (userInfoResponse.ok) {
        const userInfoResponseText = await userInfoResponse.text();
        console.log('User info raw response:', userInfoResponseText);
        
        try {
          const userInfoData = JSON.parse(userInfoResponseText);
          console.log('Parsed user info response:', JSON.stringify(userInfoData));
          
          if (userInfoData && userInfoData.data && userInfoData.data.user) {
            displayName = userInfoData.data.user.display_name || null;
            username = userInfoData.data.user.username || displayName || null;
            avatarUrl = userInfoData.data.user.avatar_url || 
                        userInfoData.data.user.avatar_large_url || 
                        userInfoData.data.user.avatar_url_100 || null;
            platformUserId = userInfoData.data.user.open_id || tokenData.open_id || null;
            
            console.log(`Found user profile: display_name=${displayName}, username=${username}, avatar=${avatarUrl ? 'present' : 'missing'}, ID=${platformUserId}`);
          } else {
            console.log('User data not found in expected format:', JSON.stringify(userInfoData));
          }
        } catch (parseError) {
          console.error('Error parsing user info response:', parseError);
          // Continue with default values
        }
      } else {
        const errorText = await userInfoResponse.text();
        console.error(`Failed to get user info: Status ${userInfoResponse.status}`, errorText);
      }
      
      // If we still don't have a username, try with the me endpoint as fallback
      if (!username) {
        console.log('Trying alternative me endpoint to get user info');
        
        const meResponse = await fetch(
          'https://open.tiktokapis.com/v2/user/me/?fields=open_id,union_id,avatar_url,display_name,username', 
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json',
            }
          }
        );
        
        if (meResponse.ok) {
          try {
            const meData = await meResponse.json();
            console.log('Me endpoint response:', JSON.stringify(meData));
            
            if (meData && meData.data && meData.data.user) {
              displayName = meData.data.user.display_name || displayName;
              username = meData.data.user.username || displayName || username;
              avatarUrl = meData.data.user.avatar_url || avatarUrl;
              platformUserId = meData.data.user.open_id || platformUserId;
            }
          } catch (parseError) {
            console.error('Error parsing me endpoint response:', parseError);
          }
        } else {
          console.error('Failed to get user info from me endpoint:', await meResponse.text());
        }
      }
      
      // Final fallback: if we still don't have a username, use a more meaningful default
      if (!username && !displayName) {
        username = "TikTok User";
        console.log(`Using fallback username: ${username}`);
      }
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase credentials not configured');
      }

      console.log('Creating Supabase client with URL:', supabaseUrl);
      const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

      // Check if connection already exists
      const { data: existingConnection, error: fetchError } = await supabaseClient
        .from('platform_connections')
        .select('id')
        .eq('user_id', userId)
        .eq('platform', 'tiktok')
        .maybeSingle();
        
      if (fetchError) {
        console.error('Error checking for existing connection:', fetchError);
        throw new Error('Failed to check for existing connection');
      }

      // Create a proper display name for the user
      const finalDisplayName = displayName || username || "TikTok User";
      
      // Log what we're about to save to the database
      console.log('About to save TikTok connection with data:', {
        platform_username: finalDisplayName,
        platform_user_id: platformUserId,
        platform_avatar_url: avatarUrl ? 'present' : 'missing'
      });
      
      try {
        if (existingConnection) {
          console.log('Updating existing connection:', existingConnection.id);
          const { error: updateError } = await supabaseClient
            .from('platform_connections')
            .update({
              platform_user_id: platformUserId,
              platform_username: finalDisplayName,
              platform_avatar_url: avatarUrl,
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token,
              expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
              updated_at: new Date().toISOString(),
              scopes: tokenData.scope || 'user.info.basic,video.list,video.upload'
            })
            .eq('id', existingConnection.id);
          
          if (updateError) {
            console.error('Error updating connection:', updateError);
            throw new Error('Failed to update connection data');
          }
          
          console.log('Successfully updated existing connection in database with username:', finalDisplayName);
        } else {
          console.log('Creating new connection for user:', userId);
          const { error: insertError } = await supabaseClient
            .from('platform_connections')
            .insert({
              user_id: userId,
              platform: 'tiktok',
              platform_user_id: platformUserId,
              platform_username: finalDisplayName,
              platform_avatar_url: avatarUrl,
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token,
              expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
              scopes: tokenData.scope || 'user.info.basic,video.list,video.upload'
            });
          
          if (insertError) {
            console.error('Error creating connection:', insertError);
            throw new Error('Failed to create connection data');
          }
          
          console.log('Successfully created new connection in database with username:', finalDisplayName);
        }

        // Verify the data was saved correctly
        const { data: verifyConnection, error: verifyError } = await supabaseClient
          .from('platform_connections')
          .select('platform_username')
          .eq('user_id', userId)
          .eq('platform', 'tiktok')
          .single();
          
        if (verifyError) {
          console.error('Error verifying connection data:', verifyError);
        } else {
          console.log('Verified connection data in database, username:', verifyConnection.platform_username);
        }
      } catch (dbError) {
        console.error('Error storing connection in database:', dbError);
        throw new Error('Failed to store connection data');
      }
    } catch (userInfoError) {
      console.error('Error in user profile handling:', userInfoError);
      throw userInfoError; // Rethrow for better error handling
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
});
