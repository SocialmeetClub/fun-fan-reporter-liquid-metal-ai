import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const apiKey = process.env.API_KEY;

export class LiveService {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private sessionPromise: Promise<any> | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private active = false;
  private stream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
  }

  async connect(onActiveChange: (active: boolean) => void) {
    if (this.active) return;
    this.active = true;
    onActiveChange(true);

    // Initialize Audio Contexts
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Get Mic Stream
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 16000 } });

    const config = {
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // Authoritative voice
        },
        systemInstruction: "You are 'Control', the AI security dispatcher for a massive stadium event. Users are field reporters. Acknowledge reports instantly with brief, authoritative confirmations (e.g. 'Copy that, Section N', 'Logged', 'Stand by'). Keep responses under 10 words. Do not hallucinate incidents, just acknowledge user input.",
      },
    };

    this.sessionPromise = this.ai.live.connect({
      model: config.model,
      config: config.config,
      callbacks: {
        onopen: () => {
          console.log("Live Session Connected");
          this.startAudioInput();
        },
        onmessage: (message: LiveServerMessage) => this.handleMessage(message),
        onclose: () => {
          console.log("Live Session Closed");
          this.disconnect(onActiveChange);
        },
        onerror: (err) => {
          console.error("Live Session Error", err);
          this.disconnect(onActiveChange);
        }
      }
    });
  }

  private startAudioInput() {
    if (!this.inputAudioContext || !this.stream) return;

    this.sourceNode = this.inputAudioContext.createMediaStreamSource(this.stream);
    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.scriptProcessor.onaudioprocess = (e) => {
      if (!this.active) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      
      this.sessionPromise?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.sourceNode.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    
    if (base64Audio && this.outputAudioContext) {
      this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
      
      const audioBuffer = await this.decodeAudioData(
        this.decode(base64Audio),
        this.outputAudioContext,
        24000,
        1
      );

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination);
      
      source.addEventListener('ended', () => this.sources.delete(source));
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(source);
    }

    if (message.serverContent?.interrupted) {
      this.sources.forEach(s => s.stop());
      this.sources.clear();
      this.nextStartTime = 0;
    }
  }

  disconnect(onActiveChange: (active: boolean) => void) {
    if (!this.active) return;
    this.active = false;
    onActiveChange(false);

    this.sessionPromise?.then(session => session.close()); // Close the session explicitly
    this.sessionPromise = null;

    this.scriptProcessor?.disconnect();
    this.sourceNode?.disconnect();
    this.stream?.getTracks().forEach(t => t.stop());
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    
    this.sources.forEach(s => s.stop());
    this.sources.clear();
  }

  // --- Helpers ---

  private createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    // Simple manual base64 encoding for raw bytes to avoid library deps
    return {
      data: this.encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private decode(base64: string) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}