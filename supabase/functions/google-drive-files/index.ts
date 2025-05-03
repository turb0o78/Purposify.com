
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get request body
    const { userId, connectionId, fileType } = await req.json();
    
    if (!userId || !connectionId) {
      throw new Error("User ID and Connection ID are required");
    }
    
    // Get the connection from database
    const { data: connection, error: connectionError } = await supabaseAdmin
      .from('platform_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', userId)
      .eq('platform', 'google_drive')
      .single();
    
    if (connectionError || !connection) {
      throw new Error("Google Drive connection not found");
    }
    
    // Check if token is expired and refresh if needed
    const now = new Date();
    const expiresAt = new Date(connection.expires_at);
    
    let accessToken = connection.access_token;
    
    if (expiresAt <= now && connection.refresh_token) {
      // Refresh the token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get("GOOGLE_CLIENT_ID"),
          client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET"),
          refresh_token: connection.refresh_token,
          grant_type: 'refresh_token',
        }),
      });
      
      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh access token");
      }
      
      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;
      
      // Update the token in database
      await supabaseAdmin
        .from('platform_connections')
        .update({
          access_token: refreshData.access_token,
          expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          token_metadata: { ...connection.token_metadata, ...refreshData }
        })
        .eq('id', connectionId);
    }
    
    // Query for video files in Drive
    let query = "mimeType contains 'video/'";
    if (fileType === 'image') {
      query = "mimeType contains 'image/'";
    }
    
    // Make request to Google Drive API
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,thumbnailLink,webViewLink,createdTime,modifiedTime,size)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!driveResponse.ok) {
      const errorText = await driveResponse.text();
      console.error("Google Drive API error:", errorText);
      throw new Error("Failed to fetch Google Drive files");
    }
    
    const driveFiles = await driveResponse.json();
    
    return new Response(
      JSON.stringify({ files: driveFiles.files }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error("Google Drive Files Error:", error);
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
