
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
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:3000";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Google Drive OAuth: Function started");
    
    // Extract user ID from request body
    const { userId } = await req.json();
    
    console.log("Google Drive OAuth: User ID received:", userId);
    
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    // Check if we have necessary credentials
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("Google Drive OAuth: Missing Google API credentials");
      throw new Error("Google API credentials not configured");
    }

    console.log("Google Drive OAuth: Credentials checked");
    console.log("Google client ID:", GOOGLE_CLIENT_ID ? "Present" : "Missing");
    console.log("Google client secret:", GOOGLE_CLIENT_SECRET ? "Present" : "Missing");

    // Create a random state identifier for this OAuth flow
    const state = crypto.randomUUID();
    
    // Store the state and user ID in Supabase for verification later
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log("Google Drive OAuth: Creating state record with:", {
      state,
      provider: 'google_drive',
      created_at: new Date().toISOString()
    });
    
    const { error: stateError } = await supabaseAdmin
      .from('oauth_states')
      .insert({
        state,
        user_id: userId,
        provider: 'google_drive',
        created_at: new Date().toISOString()
      });
      
    if (stateError) {
      console.error("Google Drive OAuth: Error storing state:", stateError);
      throw new Error("Failed to store OAuth state");
    }

    console.log("Google Drive OAuth: State stored in database");

    // Create the OAuth authorization URL
    const redirectUri = `${SUPABASE_URL}/functions/v1/google-drive-oauth-callback`;
    const scope = encodeURIComponent("https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly");
    
    // Construct Google OAuth URL
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&access_type=offline&prompt=consent`;
    
    console.log("Google Drive OAuth: OAuth URL created:", url);
    
    return new Response(
      JSON.stringify({ url }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Google Drive OAuth Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
