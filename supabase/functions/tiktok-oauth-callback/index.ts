
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
    
    // Vérifier d'abord les erreurs retournées par TikTok
    if (error) {
      throw new Error(`TikTok authorization error: ${error} - ${errorDescription || 'No description provided'}`)
    }
    
    if (!code) {
      throw new Error('Missing authorization code')
    }
    
    if (!state) {
      throw new Error('Missing state parameter')
    }

    // Extraire l'ID utilisateur de l'état (format: userId_csrfToken)
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

    // Doit correspondre exactement à ce qui a été utilisé dans la demande d'autorisation
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/tiktok-oauth-callback`

    console.log('Exchanging code for access token with redirect URI:', redirectUri)

    // Échanger le code contre un jeton d'accès (en utilisant l'API v2)
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

    // Stocker les informations importantes du jeton
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token || null;
    const expiresIn = tokenData.expires_in || 86400; // Défaut à 24 heures si non fourni
    const scope = tokenData.scope || 'user.info.basic,video.list,video.upload';
    const openId = tokenData.open_id || null;
    
    console.log(`Access token obtained with scopes: ${scope}`);

    // Récupérer les informations de profil utilisateur - d'abord essayer avec le point de terminaison userinfo
    let username = null;
    let displayName = null;
    let avatarUrl = null;
    let platformUserId = openId || null;
    
    try {
      console.log('Fetching TikTok user profile information with access token');
      
      // Essayez le point de terminaison d'informations utilisateur recommandé en premier
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
      
      if (userInfoResponse.ok) {
        const userInfoData = await userInfoResponse.json();
        console.log('User info response:', JSON.stringify(userInfoData));
        
        if (userInfoData && userInfoData.data && userInfoData.data.user) {
          const user = userInfoData.data.user;
          displayName = user.display_name;
          username = user.username || displayName;
          
          // Obtenez la meilleure URL d'avatar disponible
          avatarUrl = user.avatar_large_url || user.avatar_url_100 || user.avatar_url;
          platformUserId = user.open_id || openId;
          
          console.log(`Found user profile: display_name=${displayName}, username=${username}, avatar=${avatarUrl ? 'present' : 'missing'}`);
        } else {
          console.log('User data not found in the expected format, trying alternative endpoint');
        }
      } else {
        const errorText = await userInfoResponse.text();
        console.error(`Failed to get user info: Status ${userInfoResponse.status}`, errorText);
        
        // Si le format de la requête est invalide, essayons une version plus simple
        const simpleUserInfoResponse = await fetch(
          'https://open.tiktokapis.com/v2/user/info/', 
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            }
          }
        );
        
        if (simpleUserInfoResponse.ok) {
          const simpleUserInfoData = await simpleUserInfoResponse.json();
          console.log('Simple user info response:', JSON.stringify(simpleUserInfoData));
          
          if (simpleUserInfoData && simpleUserInfoData.data && simpleUserInfoData.data.user) {
            const user = simpleUserInfoData.data.user;
            displayName = user.display_name || displayName;
            username = user.username || displayName;
            avatarUrl = user.avatar_url || avatarUrl;
            platformUserId = user.open_id || platformUserId;
          }
        }
      }
      
      // Si nous n'avons toujours pas d'informations sur l'utilisateur, essayons le point de terminaison me alternatif
      if (!username) {
        console.log('Trying alternative "me" endpoint');
        
        // Essayons l'endpoint me V2
        const meResponse = await fetch(
          'https://open.tiktokapis.com/v2/user/info/', 
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            }
          }
        );
        
        if (meResponse.ok) {
          const meData = await meResponse.json();
          console.log('Me endpoint response:', JSON.stringify(meData));
          
          if (meData && meData.data && meData.data.user) {
            displayName = meData.data.user.display_name || displayName;
            username = meData.data.user.username || displayName;
            avatarUrl = meData.data.user.avatar_url || avatarUrl;
            platformUserId = meData.data.user.open_id || platformUserId;
            
            console.log(`Updated user profile from "me" endpoint: username=${username}, avatar=${avatarUrl ? 'present' : 'missing'}`);
          }
        } else {
          console.error('Failed to get user info from me endpoint:', await meResponse.text());
        }
      }
      
      // Dernier recours - utiliser un nom par défaut si nous n'avons pas pu obtenir le nom d'utilisateur
      if (!username && !displayName) {
        username = "TikTok User";
        displayName = "TikTok User";
        console.log(`Using fallback username: ${username}`);
      }
      
      // Initialiser le client Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase credentials not configured');
      }

      console.log('Creating Supabase client with URL:', supabaseUrl);
      const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

      // Vérifier si la connexion existe déjà
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

      // S'assurer que nous avons les champs requis
      if (!platformUserId) {
        platformUserId = openId || `tiktok-${Date.now()}`; // ID de repli
        console.log(`Using fallback platform user ID: ${platformUserId}`);
      }
      
      const finalUsername = username || displayName || "TikTok User";
      const connectionData = {
        platform_user_id: platformUserId,
        platform_username: finalUsername,
        platform_avatar_url: avatarUrl,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + (expiresIn * 1000)).toISOString(),
        scopes: scope
      };
      
      // Consigner ce que nous enregistrons dans la base de données
      console.log('Saving TikTok connection with data:', {
        ...connectionData,
        access_token: 'REDACTED',
        refresh_token: refreshToken ? 'REDACTED' : null
      });
      
      // Mettre à jour ou créer la connexion
      try {
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

        // Vérifier que la connexion a été correctement enregistrée
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
      } catch (dbError) {
        console.error('Error storing connection in database:', dbError);
        throw new Error(`Failed to store connection data: ${dbError.message}`);
      }
    } catch (userInfoError) {
      console.error('Error in user profile handling:', userInfoError);
      throw userInfoError;
    }

    // Rediriger vers l'application avec le paramètre de succès
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
    
    // Rediriger vers l'application avec le paramètre d'erreur
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
