
import React, { useState, useCallback, useEffect } from 'react';
import type { QuranVerb, DetailedVerb } from './types';
import { getVerbMeaning } from './services/geminiService';
import VerbInput from './components/VerbInput';
import ResultDisplay from './components/ResultDisplay';
import ExampleVerbs from './components/ExampleVerbs';
import SearchHistory from './components/SearchHistory';
import { BookOpenIcon } from './components/icons';

const App: React.FC = () => {
  const [verb, setVerb] = useState<string>('');
  const [result, setResult] = useState<QuranVerb | null>(null);
  const [detailedVerb, setDetailedVerb] = useState<DetailedVerb | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verbsData, setVerbsData] = useState<DetailedVerb[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const HISTORY_KEY = 'quranicVerbHistory';
  const MAX_HISTORY_SIZE = 15;

  useEffect(() => {
    fetch('./data/verbs.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setVerbsData(data))
      .catch(err => {
        console.error("Failed to load local verb data:", err);
        setError("Could not load common verb examples.");
      });
  }, []);
  
  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load search history from localStorage:", error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
    } catch (error) {
      console.error("Failed to save search history to localStorage:", error);
    }
  }, [searchHistory]);


  const performSearch = useCallback(async (verbToSearch: string) => {
    const trimmedVerb = verbToSearch.trim();
    if (!trimmedVerb) {
      setError('Please enter an Arabic verb.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setDetailedVerb(null);

    // Check local data first
    const foundVerb = verbsData.find(v => v.root_verb === trimmedVerb);
    setDetailedVerb(foundVerb || null);

    try {
      const meaning = await getVerbMeaning(trimmedVerb);
      setResult(meaning);
      // Add to history on success
      setSearchHistory(prevHistory => {
          const newHistory = [trimmedVerb, ...prevHistory.filter(v => v !== trimmedVerb)];
          return newHistory.slice(0, MAX_HISTORY_SIZE);
      });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch Quranic examples. The verb might not be in the Quran or an API error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [verbsData]);

  const handleExampleClick = useCallback(async (exampleVerb: string) => {
    setVerb(exampleVerb);
    await performSearch(exampleVerb);
  }, [performSearch]);

  const handleHistoryClick = useCallback(async (historyVerb: string) => {
    setVerb(historyVerb);
    await performSearch(historyVerb);
  }, [performSearch]);

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <BookOpenIcon className="h-10 w-10 text-cyan-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
              Quranic Verb Meaning Finder
            </h1>
          </div>
          <p className="text-lg text-slate-400">ഖുർആനിലെ ക്രിയകളുടെ മലയാള അർത്ഥം കണ്ടെത്തുക</p>
        </header>

        <main>
          <VerbInput
            verb={verb}
            setVerb={setVerb}
            onSearch={() => performSearch(verb)}
            isLoading={isLoading}
          />
          
          <ExampleVerbs verbs={verbsData} onVerbSelect={handleExampleClick} />
          
          <SearchHistory
            history={searchHistory}
            onHistorySelect={handleHistoryClick}
            onClearHistory={handleClearHistory}
          />

          <ResultDisplay
            result={result}
            detailedVerb={detailedVerb}
            isLoading={isLoading}
            error={error}
          />
        </main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
