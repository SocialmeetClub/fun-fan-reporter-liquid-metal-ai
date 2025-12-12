// Service for ElevenLabs API
// Used for high-priority Broadcast Alerts (Best Voice Agent Track)

const API_KEY = process.env.ELEVEN_LABS_API_KEY;
const VOICE_ID = "CwhRBWXzGAHq8TQ4Fs17"; // "Roger" - Authoritative tactical voice

export const isElevenLabsAvailable = !!API_KEY;

export const generateElevenLabsAudio = async (text: string): Promise<string | null> => {
  // 1. Fallback: Browser TTS (Simulation Mode)
  if (!API_KEY) {
    console.warn("ElevenLabs API Key missing. Using Browser TTS fallback (Simulation Mode).");
    
    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a deeper, more authoritative voice if available in the browser
    const voices = window.speechSynthesis.getVoices();
    const authoritativeVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('David')) || voices[0];
    
    if (authoritativeVoice) utterance.voice = authoritativeVoice;
    utterance.rate = 1.0;
    utterance.pitch = 0.8; // Lower pitch for "Security" vibe

    window.speechSynthesis.speak(utterance);
    
    // Return null because we handled the audio directly via window.speechSynthesis
    // The App.tsx knows that null means "no audio file to play", but the sound happens anyway.
    return null;
  }

  // 2. Production: ElevenLabs API
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1", // Low latency model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs Error: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("ElevenLabs TTS Failed:", error);
    return null;
  }
};