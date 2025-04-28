
import { VideoData, UploadResult } from '../types.ts';

export async function downloadTikTokVideo(videoId: string, accessToken: string): Promise<VideoData> {
  try {
    console.log(`Downloading TikTok video with ID: ${videoId}`);
    
    // Utiliser l'endpoint v2 pour obtenir des informations sur la vidéo
    const response = await fetch(
      'https://open.tiktokapis.com/v2/video/query/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: ["video_description", "video_url", "title", "duration", "cover_image_url"],
          video_ids: [videoId]
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TikTok API error (video query): ${response.status} ${errorText}`);
      
      // Tentative avec un autre endpoint si le premier échoue
      const alternativeResponse = await fetch(
        'https://open.tiktokapis.com/v2/post/info/',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            post_id: videoId,
            fields: ["video_url", "description", "title"]
          })
        }
      );
      
      if (!alternativeResponse.ok) {
        const alternativeErrorText = await alternativeResponse.text();
        console.error(`TikTok API error (post info): ${alternativeResponse.status} ${alternativeErrorText}`);
        throw new Error(`Could not download TikTok video: ${response.status} ${errorText}`);
      }
      
      const alternativeData = await alternativeResponse.json();
      console.log('TikTok alternative response:', JSON.stringify(alternativeData).substring(0, 500));
      
      const videoUrl = alternativeData?.data?.video_url;
      if (!videoUrl) {
        throw new Error('Could not get video URL from TikTok alternative API');
      }
      
      return { success: true, videoUrl };
    }
    
    const data = await response.json();
    console.log('TikTok API response:', JSON.stringify(data).substring(0, 500));
    
    const videoUrl = data?.data?.videos?.[0]?.video_url;
    if (!videoUrl) {
      throw new Error('Could not get video URL from TikTok API');
    }
    
    console.log(`Successfully obtained video URL: ${videoUrl.substring(0, 50)}...`);
    return { success: true, videoUrl };
  } catch (error) {
    console.error('Error downloading TikTok video:', error);
    return { success: false, error: error.message };
  }
}

export async function uploadToTikTok(
  videoUrl: string, 
  title: string, 
  description: string, 
  accessToken: string
): Promise<UploadResult> {
  try {
    console.log('Initiating TikTok direct upload');
    
    // Étape 1: Initialiser le téléchargement
    const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post_info: {
          title,
          privacy_level: 'SELF_ONLY', // Commencer comme privé pour éviter les erreurs
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 0
        }
      })
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      console.error(`TikTok upload initialization failed: ${initResponse.status} ${errorText}`);
      throw new Error(`TikTok upload initialization failed: ${errorText}`);
    }

    const initData = await initResponse.json();
    console.log('TikTok upload initialized:', JSON.stringify(initData).substring(0, 300));

    if (!initData?.data?.upload_url || !initData?.data?.video_id) {
      throw new Error('Invalid response from TikTok initialization endpoint');
    }

    // Étape 2: Télécharger le fichier vidéo depuis l'URL source
    console.log('Downloading video from source URL:', videoUrl.substring(0, 50));
    const videoResponse = await fetch(videoUrl);
    
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video from source: ${videoResponse.status}`);
    }
    
    const videoBuffer = await videoResponse.arrayBuffer();
    console.log(`Downloaded video buffer size: ${videoBuffer.byteLength} bytes`);

    // Étape 3: Télécharger la vidéo vers le stockage TikTok
    console.log('Uploading video to TikTok:', initData.data.upload_url.substring(0, 50));
    const uploadResponse = await fetch(initData.data.upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4'
      },
      body: videoBuffer
    });

    if (!uploadResponse.ok) {
      const uploadErrorText = await uploadResponse.text();
      console.error(`Failed to upload video to TikTok: ${uploadResponse.status} ${uploadErrorText}`);
      throw new Error(`Failed to upload video to TikTok: Status ${uploadResponse.status}`);
    }

    console.log('Video uploaded to TikTok successfully, now finalizing...');

    // Étape 4: Finaliser le processus de téléchargement
    const completeResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/complete/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_id: initData.data.video_id,
        post_info: {
          title,
          description, // Inclure la description dans l'étape de finalisation
          privacy_level: 'SELF_ONLY', // Commencer comme privé pour que le créateur puisse vérifier
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false
        }
      })
    });

    if (!completeResponse.ok) {
      const errorText = await completeResponse.text();
      console.error(`Failed to complete TikTok upload: ${completeResponse.status} ${errorText}`);
      throw new Error(`Failed to complete TikTok upload: ${errorText}`);
    }

    const completeData = await completeResponse.json();
    console.log('TikTok upload completed:', JSON.stringify(completeData).substring(0, 300));

    if (!completeData?.data?.video_id) {
      throw new Error('Invalid response from TikTok completion endpoint');
    }

    // Construire l'URL de la vidéo TikTok en utilisant le nom d'utilisateur des connexions de plate-forme
    // Ceci est un espace réservé - l'URL réelle aura besoin du nom d'utilisateur de la connexion de plate-forme
    return {
      success: true,
      videoId: completeData.data.video_id,
      url: `https://www.tiktok.com/@username/video/${completeData.data.video_id}`
    };
  } catch (error) {
    console.error('Error uploading to TikTok:', error);
    return { success: false, error: error.message };
  }
}
