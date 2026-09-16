import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CartoonCharacterType, AppLanguage } from '../types';

export interface SpokenWord {
  word: string;
  start: number;
  end: number;
}

interface UseCartoonTTSOptions {
  text: string;
  characterType: CartoonCharacterType;
  characterName: string;
  soundEnabled?: boolean;
  autoPlay?: boolean;
  language?: AppLanguage;
  onFinished?: () => void;
}

export function useCartoonTTS({
  text,
  characterType,
  characterName,
  soundEnabled = true,
  autoPlay = true,
  language = 'en',
  onFinished,
}: UseCartoonTTSOptions) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<number | null>(null);
  const boundaryReceivedRef = useRef<boolean>(false);
  const isCancelledRef = useRef<boolean>(false);
  const onFinishedRef = useRef<(() => void) | undefined>(onFinished);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  // Parse text into individual words with character offsets for precise subtitle highlighting
  const words: SpokenWord[] = useMemo(() => {
    if (!text) return [];
    const list: SpokenWord[] = [];
    const regex = /\S+/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      list.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    return list;
  }, [text]);

  // Load and cache voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const synth = window.speechSynthesis;

    const updateVoices = () => {
      const voices = synth.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = updateVoices;
    }

    return () => {
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = null;
      }
    };
  }, []);

  // Determine pitch based on cartoon character archetype to produce a fun, warm children's voice
  const characterPitch = useMemo(() => {
    switch (characterType) {
      case 'animal':
        return 1.1; // Barnaby Bear: warm, friendly, slightly elevated
      case 'plant':
        return 1.35; // Sprout Blossom: bright, sweet, cheerful flower
      case 'astronaut':
        return 1.2; // Cosmo Astronaut: enthusiastic cosmic explorer
      case 'scientist':
        return 1.28; // Dr. Spark: excited, animated, energetic scientist
      case 'teacher':
      default:
        return 1.22; // Miss Sunny: warm, expressive, encouraging teacher
    }
  }, [characterType]);

  // Pick the best voice: if Tamil, find a Tamil voice; otherwise, friendly child-friendly English voice
  const bestVoice = useMemo(() => {
    if (!availableVoices || availableVoices.length === 0) return null;

    if (language === 'ta') {
      // Look for Tamil voices (e.g. ta-IN, ta_IN, Google தமிழ், Microsoft Valluvar, etc.)
      const tamilVoice = availableVoices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('ta') ||
          v.name.toLowerCase().includes('tamil') ||
          v.name.includes('தமிழ்')
      );
      if (tamilVoice) return tamilVoice;

      // Fallback to any Indian English or default voice capable of multilingual TTS
      const indianVoice = availableVoices.find(
        (v) => v.lang.toLowerCase().includes('in') || v.lang.toLowerCase().includes('hi')
      );
      if (indianVoice) return indianVoice;

      const defaultVoice = availableVoices.find((v) => v.default);
      return defaultVoice || availableVoices[0] || null;
    }

    // Friendly female / expressive / child-oriented voices for English
    const friendlyKeywords = [
      'samantha',
      'victoria',
      'karen',
      'google us english',
      'moira',
      'fiona',
      'tessa',
      'zira',
      'flo',
      'junior',
      'child',
      'kid',
      'natural',
      'expressive',
    ];

    // Priority 1: English voice matching friendly keywords
    const friendlyEnVoice = availableVoices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('en') &&
        friendlyKeywords.some((kw) => v.name.toLowerCase().includes(kw))
    );
    if (friendlyEnVoice) return friendlyEnVoice;

    // Priority 2: Any English voice
    const anyEnVoice = availableVoices.find((v) => v.lang.toLowerCase().startsWith('en'));
    if (anyEnVoice) return anyEnVoice;

    // Priority 3: Default voice
    const defaultVoice = availableVoices.find((v) => v.default);
    return defaultVoice || availableVoices[0] || null;
  }, [availableVoices, language]);

  // Clean timer fallback
  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Stop any active utterance
  const stop = useCallback(() => {
    isCancelledRef.current = true;
    clearTimer();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  }, []);

  // Main speech invocation
  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    if (!soundEnabled || !text || text.trim().length === 0) {
      return;
    }

    const synth = window.speechSynthesis;
    // Cancel any ongoing speech before starting new
    isCancelledRef.current = false;
    clearTimer();
    try {
      synth.cancel();
    } catch {
      // ignore
    }

    // Clean spoken text: remove quotes or unusual chars for smoother pronunciation
    const cleanSpokenText = text.replace(/["“”«»]/g, '').trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
    utteranceRef.current = utterance;

    // Explicitly set language tag so browser speech synthesis uses Tamil or English phonetics
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';

    if (bestVoice) {
      utterance.voice = bestVoice;
      setSelectedVoiceName(bestVoice.name);
    }
    utterance.pitch = language === 'ta' ? 1.08 : characterPitch;
    utterance.rate = language === 'ta' ? 0.88 : 0.92; // Slightly relaxed, clear pace for children
    utterance.volume = 1.0;

    boundaryReceivedRef.current = false;

    utterance.onstart = () => {
      if (isCancelledRef.current) return;
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentWordIndex(0);

      // Start fallback word highlighter timer in case boundary events are not fired by the browser
      clearTimer();
      let estWordIdx = 0;
      // Word reading time estimate: ~380ms for Tamil, ~340ms for English
      const wordDelay = language === 'ta' ? 380 : 340;
      timerRef.current = window.setInterval(() => {
        if (!boundaryReceivedRef.current && isPlaying) {
          estWordIdx++;
          if (estWordIdx < words.length) {
            setCurrentWordIndex(estWordIdx);
          } else {
            clearTimer();
          }
        }
      }, wordDelay);
    };

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (isCancelledRef.current) return;
      boundaryReceivedRef.current = true;
      clearTimer();

      const charIdx = event.charIndex;
      if (charIdx !== undefined && words.length > 0) {
        const foundIdx = words.findIndex((w) => charIdx >= w.start && charIdx <= w.end);
        if (foundIdx !== -1) {
          setCurrentWordIndex(foundIdx);
        } else {
          // Closest word fallback
          const closest = words.findIndex((w) => w.start >= charIdx);
          if (closest !== -1) setCurrentWordIndex(closest);
        }
      }
    };

    utterance.onend = () => {
      clearTimer();
      setIsPlaying(false);
      setIsPaused(false);
      // Keep words highlighted or finish
      setCurrentWordIndex(words.length);
      if (!isCancelledRef.current) {
        onFinishedRef.current?.();
      }
    };

    utterance.onerror = (e) => {
      // Ignore if canceled intentionally
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      clearTimer();
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPlaying(false);
      setIsPaused(true);
      clearTimer();
    };

    utterance.onresume = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    try {
      synth.speak(utterance);
    } catch {
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [text, soundEnabled, bestVoice, characterPitch, words, isPlaying]);

  // Pause speech
  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        clearTimer();
        window.speechSynthesis.pause();
        setIsPlaying(false);
        setIsPaused(true);
      } catch {
        // Fallback
        stop();
      }
    }
  }, [stop]);

  // Play or resume
  const play = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;

    if (isPaused) {
      try {
        synth.resume();
        setIsPlaying(true);
        setIsPaused(false);
        return;
      } catch {
        // If resume fails in buggy engine, restart
        speak();
        return;
      }
    }

    speak();
  }, [isPaused, speak]);

  // Replay from beginning
  const replay = useCallback(() => {
    stop();
    // Short delay to allow speech engine to reset cleanly
    setTimeout(() => {
      speak();
    }, 60);
  }, [stop, speak]);

  // Automatically start speech when text or characterType changes if autoPlay and soundEnabled
  useEffect(() => {
    if (!autoPlay || !soundEnabled || !text) {
      stop();
      return;
    }

    // Delay slightly to let screen transition finish smoothly
    const timer = setTimeout(() => {
      speak();
    }, 450);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [text, characterType, autoPlay, soundEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isPlaying,
    isPaused,
    currentWordIndex,
    words,
    isSupported,
    selectedVoiceName,
    characterName,
    play,
    pause,
    replay,
    stop,
  };
}
