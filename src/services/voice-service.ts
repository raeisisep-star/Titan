/**
 * Voice Enhancement Service
 * Handles speech recognition, text-to-speech, and voice processing
 */

import { geminiAPI } from './gemini-api';

interface VoiceSettings {
  language: string;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  language: string;
  isFinal: boolean;
}

export class VoiceService {
  private synthesis: SpeechSynthesis;
  private recognition: any; // SpeechRecognition
  private currentVoice: SpeechSynthesisVoice | null = null;
  private isSupported: boolean;
  private voiceSettings: VoiceSettings;
  private isListening = false;
  private onResultCallback: ((result: SpeechRecognitionResult) => void) | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.isSupported = 'speechSynthesis' in window && 'webkitSpeechRecognition' in window;
    
    this.voiceSettings = {
      language: 'fa-IR',
      voice: '',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    };

    this.initializeSpeechRecognition();
    this.loadVoiceSettings();
  }

  private initializeSpeechRecognition() {
    if (!this.isSupported) return;

    // @ts-ignore - webkitSpeechRecognition is not in TypeScript definitions
    this.recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.voiceSettings.language;

    this.recognition.onstart = () => {
      console.log('Voice recognition started');
      this.isListening = true;
    };

    this.recognition.onend = () => {
      console.log('Voice recognition ended');
      this.isListening = false;
    };

    this.recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }

        if (this.onResultCallback) {
          this.onResultCallback({
            transcript: finalTranscript || interimTranscript,
            confidence: confidence || 0,
            language: this.voiceSettings.language,
            isFinal: event.results[i].isFinal
          });
        }
      }
    };
  }

  private loadVoiceSettings() {
    try {
      const saved = localStorage.getItem('titan_voice_settings');
      if (saved) {
        this.voiceSettings = { ...this.voiceSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load voice settings:', error);
    }
  }

  private saveVoiceSettings() {
    try {
      localStorage.setItem('titan_voice_settings', JSON.stringify(this.voiceSettings));
    } catch (error) {
      console.warn('Failed to save voice settings:', error);
    }
  }

  // Get available voices for the current language
  getAvailableVoices(language?: string): SpeechSynthesisVoice[] {
    const voices = this.synthesis.getVoices();
    const targetLang = language || this.voiceSettings.language;
    
    return voices.filter(voice => 
      voice.lang.startsWith(targetLang.split('-')[0]) || 
      voice.lang === targetLang
    );
  }

  // Set voice by name or auto-select best voice for language
  setVoice(voiceName?: string, language?: string) {
    const voices = this.getAvailableVoices(language);
    
    if (voiceName) {
      this.currentVoice = voices.find(voice => voice.name === voiceName) || voices[0] || null;
    } else {
      // Auto-select best voice for language
      const targetLang = language || this.voiceSettings.language;
      this.currentVoice = voices.find(voice => voice.lang === targetLang) || voices[0] || null;
    }

    if (this.currentVoice) {
      this.voiceSettings.voice = this.currentVoice.name;
      this.saveVoiceSettings();
    }
  }

  // Enhanced text-to-speech with Gemini optimization
  async speak(text: string, options?: Partial<VoiceSettings>): Promise<void> {
    if (!this.isSupported || !text.trim()) {
      throw new Error('Text-to-speech not supported or empty text');
    }

    try {
      // Enhance text for better speech output using Gemini
      const enhancedText = await geminiAPI.enhancePromptForVoice(text, 'Persian');
      
      return this.speakDirect(enhancedText, options);
    } catch (error) {
      console.warn('Failed to enhance text, using original:', error);
      return this.speakDirect(text, options);
    }
  }

  // Direct text-to-speech without enhancement
  speakDirect(text: string, options?: Partial<VoiceSettings>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Text-to-speech not supported'));
        return;
      }

      // Stop any current speech
      this.stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply settings
      const settings = { ...this.voiceSettings, ...options };
      utterance.lang = settings.language;
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      if (this.currentVoice) {
        utterance.voice = this.currentVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  // Stop current speech
  stopSpeaking() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  // Start voice recognition
  startListening(callback: (result: SpeechRecognitionResult) => void) {
    if (!this.isSupported || this.isListening) {
      throw new Error('Speech recognition not supported or already listening');
    }

    this.onResultCallback = callback;
    this.recognition.lang = this.voiceSettings.language;
    this.recognition.start();
  }

  // Stop voice recognition
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.onResultCallback = null;
  }

  // Toggle listening state
  toggleListening(callback?: (result: SpeechRecognitionResult) => void): boolean {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      if (callback) {
        this.startListening(callback);
        return true;
      }
      return false;
    }
  }

  // Language detection and switching
  async detectAndSetLanguage(text: string): Promise<string> {
    try {
      const detectedLanguage = await geminiAPI.detectLanguage(text);
      
      // Map language names to locale codes
      const languageMap: { [key: string]: string } = {
        'Persian': 'fa-IR',
        'English': 'en-US',
        'Arabic': 'ar-SA',
        'French': 'fr-FR',
        'German': 'de-DE',
        'Spanish': 'es-ES'
      };

      const locale = languageMap[detectedLanguage] || this.voiceSettings.language;
      this.setLanguage(locale);
      
      return detectedLanguage;
    } catch (error) {
      console.warn('Language detection failed:', error);
      return 'Unknown';
    }
  }

  // Set language for both recognition and synthesis
  setLanguage(language: string) {
    this.voiceSettings.language = language;
    
    if (this.recognition) {
      this.recognition.lang = language;
    }
    
    this.setVoice(undefined, language);
    this.saveVoiceSettings();
  }

  // Update voice settings
  updateSettings(newSettings: Partial<VoiceSettings>) {
    this.voiceSettings = { ...this.voiceSettings, ...newSettings };
    
    if (newSettings.language) {
      this.setLanguage(newSettings.language);
    }
    
    if (newSettings.voice) {
      this.setVoice(newSettings.voice);
    }
    
    this.saveVoiceSettings();
  }

  // Get current settings
  getSettings(): VoiceSettings {
    return { ...this.voiceSettings };
  }

  // Check if voice features are supported
  isVoiceSupported(): boolean {
    return this.isSupported;
  }

  // Get current listening state
  getIsListening(): boolean {
    return this.isListening;
  }

  // Generate voice summary for complex data
  async generateVoiceSummary(data: any, context: string): Promise<string> {
    try {
      const summary = await geminiAPI.summarizeForVoice(
        JSON.stringify(data), 
        150, 
        this.voiceSettings.language === 'fa-IR' ? 'Persian' : 'English'
      );
      return summary;
    } catch (error) {
      console.error('Failed to generate voice summary:', error);
      return context || 'خلاصه در دسترس نیست';
    }
  }

  // Health check for voice features
  async healthCheck(): Promise<{ synthesis: boolean; recognition: boolean; gemini: boolean }> {
    return {
      synthesis: 'speechSynthesis' in window,
      recognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      gemini: await geminiAPI.healthCheck()
    };
  }
}

// Create singleton instance
export const voiceService = new VoiceService();