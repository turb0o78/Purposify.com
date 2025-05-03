
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const REDIRECT_URI = `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-drive-oauth-callback`;
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:3000";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Google Drive OAuth Callback: Function started");
    
    // Get URL and search parameters
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    
    console.log("Google Drive OAuth Callback: Received parameters", { 
      hasCode: !!code, 
      hasState: !!state, 
      hasError: !!error 
    });
    
    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Check if there was an error in the OAuth flow
    if (error) {
      console.error("OAuth error:", error);
      return Response.redirect(`${APP_URL}/connections?error=${encodeURIComponent(error)}`);
    }
    
    // Check if we have the necessary parameters
    if (!code || !state) {
      console.error("Missing required OAuth parameters");
      return Response.redirect(`${APP_URL}/connections?error=${encodeURIComponent("Missing required OAuth parameters")}`);
    }
    
    // Verify the state to prevent CSRF
    const { data: stateData, error: stateError } = await supabaseAdmin
      .from('oauth_states')
      .select('user_id')
      .eq('state', state)
      .eq('provider', 'google_drive')
      .single();
    
    if (stateError || !stateData) {
      console.error("State verification failed:", stateError);
      return Response.redirect(`${APP_URL}/connections?error=${encodeURIComponent("Invalid OAuth state")}`);
    }
    
    const userId = stateData.user_id;
    console.log("Google Drive OAuth Callback: State verified for user", userId);
    
    // Exchange the code for access and refresh tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    
    const tokenResponseText = await tokenResponse.text();
    console.log("Google Drive OAuth Callback: Token response status", tokenResponse.status);
    
    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokenResponseText);
      return Response.redirect(`${APP_URL}/connections?error=${encodeURIComponent("Failed to exchange auth code: " + tokenResponseText)}`);
    }
    
    const tokenData = JSON.parse(tokenResponseText);
    console.log("Google Drive OAuth Callback: Token obtained successfully");
    
    // Get user info to display in the UI
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error("Failed to get user info:", errorText);
      return Response.redirect(`${APP_URL}/connections?error=${encodeURIComponent("Failed to get user info: " + errorText)}`);
    }
    
    const userInfo = await userInfoResponse.json();
    console.log("Google Drive OAuth Callback: User info obtained");
    
    // Store the connection in Supabase
    const { error: insertError } = await supabaseAdmin
      .from('platform_connections')
      .insert({
        user_id: userId,
        platform: 'google_drive',
        platform_user_id: userInfo.id,
        platform_username: userInfo.email,
        platform_avatar_url: userInfo.picture,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        token_metadata: tokenData
      });
    
    if (insertError) {
      console.error("Failed to store connection:", insertError);
      return Response.redirect(`${APP_URL}/connections?error=${encodeURIComponent("Failed to store connection: " + insertError.message)}`);
    }
    
    console.log("Google Drive OAuth Callback: Connection stored successfully");
    
    // Delete the used state to prevent replay attacks
    await supabaseAdmin
      .from('oauth_states')
      .delete()
      .eq('state', state);
    
    console.log("Google Drive OAuth Callback: State record deleted");
    
    // Redirect back to the app with success
    return Response.redirect(`${APP_URL}/connections?success=true`);
    
  } catch (error) {
    console.error("Google Drive OAuth Callback Error:", error);
    return Response.redirect(`${APP_URL}/connections?error=${encodeURIComponent(error.message)}`);
  }
});
