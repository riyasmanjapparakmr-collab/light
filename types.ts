
export interface QuranVerseExample {
  verseReference: string;
  arabicText: string;
  transliteration: string;
  malayalamTranslation: string;
}

export interface QuranVerb {
  arabicVerb: string;
  malayalamMeaning: string;
  rootLetters: string;
  verses: QuranVerseExample[];
}

export interface ConjugationForm {
  arabic: string;
  malayalam: string;
}

export interface TenseConjugations {
  singular_masculine: ConjugationForm;
  plural_masculine: ConjugationForm;
  singular_feminine: ConjugationForm;
  plural_feminine: ConjugationForm;
}

export interface DetailedVerb {
  root_verb: string;
  meaning: string;
  past_tense: TenseConjugations;
  present_tense: TenseConjugations;
  imperative: TenseConjugations;
}
