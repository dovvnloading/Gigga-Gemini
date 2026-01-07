import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Attachment, ModelType } from '../types';
import { useSpeech } from './useSpeech';

interface UseComposerInputProps {
  onSend: (text: string, attachments: Attachment[], model: ModelType) => void;
  currentModel: ModelType;
  inputOverride?: string;
  onError?: (message: string) => void;
}

export const useComposerInput = ({ onSend, currentModel, inputOverride, onError }: UseComposerInputProps) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle Input Override
  useEffect(() => {
    if (inputOverride !== undefined && inputOverride !== input) {
        setInput(inputOverride);
    }
  }, [inputOverride]);

  // Speech to Text Integration
  const { isListening, toggleListening } = useSpeech(
    (text) => {
        setInput(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + text);
    },
    (errorMessage) => {
        onError?.(errorMessage);
    }
  );

  const isTextFile = (file: File) => {
      const textTypes = [
          'text/', 'application/json', 'application/javascript', 'application/x-javascript', 
          'application/xml', 'application/typescript', 'application/csv'
      ];
      const textExts = [
          '.ts', '.tsx', '.js', '.jsx', '.py', '.rb', '.java', '.c', '.cpp', '.h', '.cs', '.php', 
          '.go', '.rs', '.swift', '.kt', '.md', '.txt', '.css', '.html', '.json', '.yaml', '.yml', 
          '.xml', '.sql', '.sh', '.bat', '.ps1', '.csv', '.toml', '.ini', '.log', '.tex', '.lua', 
          '.r', '.dart', '.vue', '.svelte', '.env'
      ];
      
      return textTypes.some(t => file.type.startsWith(t)) || 
             textExts.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  const processFiles = async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const newAttachments: Attachment[] = [];

      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const isText = isTextFile(file);
          
          try {
              if (isText) {
                  const text = await file.text();
                  newAttachments.push({
                      id: Date.now() + i + Math.random().toString(),
                      type: 'file',
                      mimeType: file.type || 'text/plain',
                      name: file.name,
                      content: text
                  });
              } else {
                  const dataUrl = await new Promise<string>((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve(reader.result as string);
                      reader.onerror = reject;
                      reader.readAsDataURL(file);
                  });
                  
                  newAttachments.push({
                      id: Date.now() + i + Math.random().toString(),
                      type: 'image',
                      mimeType: file.type,
                      name: file.name,
                      content: dataUrl
                  });
              }
          } catch (e) {
              console.error(`Failed to read file ${file.name}`, e);
              onError?.(`Failed to read ${file.name}`);
          }
      }

      setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
      setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSend = useCallback(() => {
    if (!input.trim() && attachments.length === 0) return;
    onSend(input, attachments, currentModel);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, attachments, currentModel, onSend]);

  return {
    input,
    setInput,
    attachments,
    fileInputRef,
    textareaRef,
    isListening,
    toggleListening,
    handleFileUpload,
    processFiles,
    removeAttachment,
    handleSend
  };
};