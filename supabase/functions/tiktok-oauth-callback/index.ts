
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

    // For sandbox mode, we need to handle the case where user info might not be available
    // or handle it differently
    let username = 'Unknown TikTok User';
    let avatarUrl = null;
    let platformUserId = tokenData.open_id || null;
    
    try {
      console.log('Fetching TikTok user profile information...');
      
      // First try the basic user info endpoint
      const userInfoResponse = await fetch(
        'https://open.tiktokapis.com/v2/user/info/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (userInfoResponse.ok) {
        const userInfoData = await userInfoResponse.json();
        console.log('User info response:', JSON.stringify(userInfoData));
        
        // Extract user data from the response according to TikTok API v2 structure
        if (userInfoData && userInfoData.data && userInfoData.data.user) {
          // In v2 API, the username can be in display_name or username fields
          username = userInfoData.data.user.display_name || 
                    userInfoData.data.user.username || 
                    'TikTok User'; // Fallback
          
          avatarUrl = userInfoData.data.user.avatar_url || null;
          platformUserId = userInfoData.data.user.open_id || tokenData.open_id || null;
          
          console.log(`Found user profile: name=${username}, avatar=${avatarUrl ? 'present' : 'missing'}, ID=${platformUserId}`);
        } else {
          console.log('Could not retrieve user profile information from TikTok response:', 
                      JSON.stringify(userInfoData).substring(0, 500));
        }
      } else {
        // If standard user info fails, try to find other ways to get username
        console.log('Failed to get user info, trying alternative approach for sandbox mode');
        
        // For sandbox mode, we'll use a combination of available data
        // If we have open_id, we'll use that to make a recognizable username
        if (tokenData.open_id) {
          username = `TikTok User (${tokenData.open_id.substring(0, 8)}...)`;
          console.log(`Using open_id to create username: ${username}`);
        }
      }
      
      // Fallback for sandbox mode: If we're in sandbox and couldn't get info,
      // at least make the username more distinctive than just "TikTok User"
      if (username === 'TikTok User' || username === 'Unknown TikTok User') {
        // Generate a pseudo-random username based on the open_id
        const randomPart = Math.floor(Math.random() * 1000).toString();
        username = `TikTok Sandbox User ${randomPart}`;
        console.log(`Created sandbox fallback username: ${username}`);
      }
      
      // Ensure we have some kind of user ID
      if (!platformUserId && tokenData.open_id) {
        platformUserId = tokenData.open_id;
        console.log(`Using open_id as platformUserId: ${platformUserId}`);
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

      // Log what we're about to save to the database
      console.log('About to save TikTok connection with data:', {
        platform_username: username,
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
              platform_username: username,
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
          
          console.log('Successfully updated existing connection in database with username:', username);
        } else {
          console.log('Creating new connection for user:', userId);
          const { error: insertError } = await supabaseClient
            .from('platform_connections')
            .insert({
              user_id: userId,
              platform: 'tiktok',
              platform_user_id: platformUserId,
              platform_username: username,
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
          
          console.log('Successfully created new connection in database with username:', username);
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
      
      // Even if user info fails, we still want to create a connection with the access token
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
      
      // For sandbox mode, create a better default username
      const sandboxUsername = `TikTok Sandbox User (${new Date().toISOString().split('T')[0]})`;
      
      try {
        const { data: existingConnection } = await supabaseClient
          .from('platform_connections')
          .select('id')
          .eq('user_id', userId)
          .eq('platform', 'tiktok')
          .maybeSingle();
          
        const connectionData = {
          platform_user_id: tokenData.open_id || 'unknown',
          platform_username: sandboxUsername,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
          scopes: tokenData.scope || 'user.info.basic,video.list,video.upload'
        };
        
        if (existingConnection) {
          await supabaseClient
            .from('platform_connections')
            .update(connectionData)
            .eq('id', existingConnection.id);
            
          console.log('Updated existing connection with sandbox data');
        } else {
          await supabaseClient
            .from('platform_connections')
            .insert({
              ...connectionData,
              user_id: userId,
              platform: 'tiktok',
            });
            
          console.log('Created new connection with sandbox data');
        }
      } catch (fallbackError) {
        console.error('Failed to create fallback connection:', fallbackError);
      }
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
