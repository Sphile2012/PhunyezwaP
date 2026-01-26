
// Client-side wrapper that calls the server-side caption generation endpoint.
export const generateCaption = async (imageBase64: string): Promise<string> => {
  try {
    const res = await fetch('/api/generate-caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 })
    });

    if (!res.ok) {
      console.error('Caption API error', await res.text());
      return 'Exploring new horizons! 🌟 #instaphoto';
    }

    const data = await res.json();
    return data.caption || 'Just another amazing day! ✨ #vibes';
  } catch (err) {
    console.error('Network error', err);
    return 'Exploring new horizons! 🌟 #instaphoto';
  }
};
