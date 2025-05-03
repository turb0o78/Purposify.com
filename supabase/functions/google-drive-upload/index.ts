
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
    const { userId, connectionId, videoUrl, videoName, sourceInfo } = await req.json();
    
    if (!userId || !connectionId || !videoUrl || !videoName) {
      throw new Error("Missing required parameters");
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
    
    // Download the video from the URL
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error("Failed to download video from source URL");
    }
    
    const videoBlob = await videoResponse.blob();
    const videoArrayBuffer = await videoBlob.arrayBuffer();
    
    // Upload to Google Drive
    // First, get the metadata
    const metadataResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: videoName,
          description: sourceInfo ? `Imported from ${sourceInfo.platform}: ${sourceInfo.id}` : 'Imported via Purposify',
          mimeType: 'video/mp4', // Assuming MP4 format
        }),
      }
    );
    
    if (!metadataResponse.ok) {
      throw new Error("Failed to initiate Google Drive upload");
    }
    
    // Get the resumable upload URL
    const uploadUrl = metadataResponse.headers.get('Location');
    if (!uploadUrl) {
      throw new Error("Failed to get upload URL from Google Drive");
    }
    
    // Upload the file content
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Length': videoArrayBuffer.byteLength.toString(),
        'Content-Type': 'video/mp4',
      },
      body: videoArrayBuffer,
    });
    
    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to Google Drive");
    }
    
    const uploadResult = await uploadResponse.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        fileId: uploadResult.id,
        fileName: uploadResult.name,
        webViewLink: uploadResult.webViewLink
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error("Google Drive Upload Error:", error);
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
