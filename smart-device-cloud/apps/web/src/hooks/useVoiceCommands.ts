import { useCallback, useEffect, useRef, useState } from 'react';

interface VoiceCommand {
  command: string;
  params: Record<string, unknown>;
  confidence: number;
}

interface UseVoiceCommandsOptions {
  onCommand?: (command: VoiceCommand) => void;
  enabled?: boolean;
  language?: string;
}

interface UseVoiceCommandsReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  abort: () => void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export function useVoiceCommands(
  options: UseVoiceCommandsOptions = {}
): UseVoiceCommandsReturn {
  const { onCommand, enabled = true, language = 'en-US' } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (!enabled) return;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript && onCommand) {
          const command = parseVoiceCommand(finalTranscript);
          if (command) onCommand(command);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      setError('Speech recognition not supported in this browser');
    }
  }, [enabled, language, onCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const abort = useCallback(() => {
    recognitionRef.current?.abort?.();
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort?.();
    };
  }, []);

  return { isListening, transcript, error, startListening, stopListening, abort };
}

function parseVoiceCommand(text: string): VoiceCommand | null {
  const lower = text.toLowerCase().trim();
  const patterns: [RegExp, string, (match: RegExpMatchArray) => Record<string, unknown>][] = [
    [/^(reboot|restart|reset)\s+(\w+)$/, 'device:reboot', m => ({ deviceId: m[2] })],
    [/^(start|begin|launch)\s+(\w+)$/, 'device:start', m => ({ deviceId: m[2] })],
    [/^(stop|halt|pause)\s+(\w+)$/, 'device:stop', m => ({ deviceId: m[2] })],
    [/^(allocate|reserve|book)\s+(\w+)$/, 'device:allocate', m => ({ deviceId: m[2] })],
    [/^(release|free|unreserve)\s+(\w+)$/, 'device:release', m => ({ deviceId: m[2] })],
  ];

  for (const [regex, command, params] of patterns) {
    const match = lower.match(regex);
    if (match) return { command, params: params(match), confidence: 0.85 };
  }
  return null;
}