export interface SubScore {
  score: number;
  max: number;
  good: string[];
  bad: string[];
}

export interface Breakdown {
  keywords: SubScore;
  formatting: SubScore;
  length: SubScore;
  readability: SubScore;
  impact: SubScore;
}

interface GrammaticalError {
  original: string;
  correction: string;
}

interface VerbSuggestion {
  original: string;
  suggestion: string;
}

export interface WordFormat {
  grammaticalErrors: GrammaticalError[];
  verbSuggestions: VerbSuggestion[];
  quantificationSuggestions: string[];
}

export interface EducationEntry {
  degree?: string;
  university?: string;
  graduationDate?: string;
  notes?: string;
  certificate?: string;
  year?: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

interface HeadingFormat {
  suggestedChanges: Record<string, string>;
  missingHeadings: string[];
}

export interface Analysis {
  score: number;
  breakdown: Breakdown;
  layoutFormat: string;
  wordFormat: WordFormat;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  headingFormat: HeadingFormat;
}