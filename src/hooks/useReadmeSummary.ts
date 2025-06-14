import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const useReadmeSummary = (repoFullName?: string) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!repoFullName) return;

    const fetchAndSummarize = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 1. GitHub APIからREADMEを取得
        const readmeResponse = await fetch(
          `https://raw.githubusercontent.com/${repoFullName}/main/README.md`
        );
        
        if (!readmeResponse.ok) {
          throw new Error('READMEの取得に失敗しました');
        }
        
        const readmeText = await readmeResponse.text();
        
        // 2. Geminiで要約
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
          以下のGitHubリポジトリのREADMEを3行で日本語に要約してください。
          技術スタックや主な機能、目的を簡潔にまとめてください。
          
          README:
          ${readmeText.substring(0, 10000)}  // 長すぎる場合は最初の10000文字に制限
        `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        setSummary(text);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err : new Error('要約の取得に失敗しました'));
        setSummary('要約を取得できませんでした');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSummarize();
  }, [repoFullName]);

  return { summary, isLoading, error };
};
