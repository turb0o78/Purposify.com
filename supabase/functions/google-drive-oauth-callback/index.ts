
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const APP_URL = Deno.env.get("APP_URL") || "https://reel-stream-forge.lovable.app";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Google Drive OAuth Callback: Function started");
    
    // Get the authorization code and state from the URL
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    console.log(`Google Drive OAuth Callback: Code received: ${code ? "Yes" : "No"}, State: ${state}`);
    
    if (!code || !state) {
      throw new Error("Missing code or state in callback URL");
    }
    
    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get the stored state from database
    console.log(`Google Drive OAuth Callback: Looking up state ${state} in database`);
    const { data: storedState, error: stateError } = await supabaseAdmin
      .from('oauth_states')
      .select('user_id, provider')
      .eq('state', state)
      .single();
    
    if (stateError || !storedState) {
      console.error("Google Drive OAuth Callback: Invalid state:", stateError);
      throw new Error("Invalid state. Please try again");
    }
    
    console.log(`Google Drive OAuth Callback: State valid for user ${storedState.user_id}`);
    
    // Exchange the code for tokens
    console.log("Google Drive OAuth Callback: Exchanging code for token");
    const redirectUri = `${SUPABASE_URL}/functions/v1/google-drive-oauth-callback`;
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID || "",
        client_secret: GOOGLE_CLIENT_SECRET || "",
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error("Google Drive OAuth Callback: Token error:", tokenData);
      throw new Error("Failed to exchange code for token");
    }
    
    console.log("Google Drive OAuth Callback: Token received successfully");
    
    // Get user info
    console.log("Google Drive OAuth Callback: Getting user info");
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    const userData = await userResponse.json();
    
    if (!userResponse.ok) {
      console.error("Google Drive OAuth Callback: Failed to get user info:", userData);
      throw new Error(`Failed to get user info: ${JSON.stringify(userData)}`);
    }
    
    console.log("Google Drive OAuth Callback: User info received successfully");
    
    // Save the connection to database
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
    
    console.log(`Google Drive OAuth Callback: Saving connection for user ${storedState.user_id}`);
    
    const { error: connectionError } = await supabaseAdmin
      .from('platform_connections')
      .upsert({
        user_id: storedState.user_id,
        platform: 'google_drive',
        platform_user_id: userData.id,
        platform_username: userData.email || "Google Drive User",
        platform_avatar_url: userData.picture || null,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
      });
    
    if (connectionError) {
      console.error("Google Drive OAuth Callback: Failed to save connection:", connectionError);
      throw new Error("Failed to save connection");
    }
    
    console.log("Google Drive OAuth Callback: Connection saved successfully");
    
    // Delete the used state
    await supabaseAdmin
      .from('oauth_states')
      .delete()
      .eq('state', state);
    
    console.log("Google Drive OAuth Callback: Redirecting to app");
    
    // Redirect back to the app
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `${APP_URL}/connections?success=true`,
      },
    });
  } catch (error) {
    console.error("Google Drive OAuth Callback Error:", error);
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `${APP_URL}/connections?error=${encodeURIComponent(error.message)}`,
      },
    });
  }
});
