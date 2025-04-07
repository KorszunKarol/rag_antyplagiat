/**
 * Defines the structure for a source document referenced in the report.
 */
export interface LlmSource {
  id: string;
  title: string;
  type: 'web' | 'file' | 'database' | 'ai' | string; // Extendable type
  originalUrl?: string;
  retrievedContent?: string;
  snippet?: string;
}

/**
 * Defines the structure for a detected match within the document.
 */
export interface LlmMatch {
  id: string;
  sourceId: string;
  startIndex: number;
  endIndex: number;
  matchType: 'exact' | 'paraphrase' | 'ai';
  confidenceScore?: number;
  explanation?: string;
}

/**
 * Defines the structure for the summary scores of the report.
 */
export interface LlmReportScores {
  exactMatch: number;
  paraphrase: number;
  aiLikelihood: number;
  overall?: number;
}

/**
 * Defines the overall structure for the plagiarism report data.
 */
export interface LlmReportData {
  documentId: string;
  documentTitle?: string;
  documentText: string;
  matches: LlmMatch[];
  sources: LlmSource[];
  scores: LlmReportScores;
  generatedAt: string;
}

/**
 * Mock data representing a sample plagiarism report.
 */
export const mockReportData: LlmReportData = {
  documentId: 'doc-12345',
  documentTitle: 'Research Paper on Climate Change Impacts',
  documentText:
    "Climate change represents a significant global challenge. Its impacts are widespread, affecting ecosystems, economies, and societies worldwide. Rising sea levels pose a direct threat to coastal communities, displacing millions. Furthermore, extreme weather events, such as hurricanes and heatwaves, are becoming more frequent and intense. According to recent studies, the agricultural sector is particularly vulnerable, with changing precipitation patterns impacting crop yields. Addressing this requires a concerted global effort towards mitigation and adaptation strategies. This involves reducing greenhouse gas emissions and building resilience in vulnerable regions.",
  matches: [
    {
      id: 'match-001',
      sourceId: 'src-web-A',
      startIndex: 90,
      endIndex: 145,
      matchType: 'exact',
      confidenceScore: 95,
      explanation: 'Direct copy from Source A.',
    },
    {
      id: 'match-002',
      sourceId: 'src-file-B',
      startIndex: 160,
      endIndex: 235,
      matchType: 'paraphrase',
      confidenceScore: 75,
      explanation: 'Similar phrasing and concepts found in Source B.',
    },
    {
      id: 'match-003',
      sourceId: 'src-web-C',
      startIndex: 380,
      endIndex: 460,
      matchType: 'paraphrase',
      confidenceScore: 80,
    },
     {
      id: 'match-004',
      sourceId: 'src-ai-gen',
      startIndex: 237,
      endIndex: 330,
      matchType: 'ai',
      confidenceScore: 65,
      explanation: 'This section exhibits patterns commonly found in AI-generated text, such as generic phrasing and lack of specific citation despite mentioning studies.',
    },
  ],
  sources: [
    {
      id: 'src-web-A',
      title: 'Wikipedia: Sea Level Rise',
      type: 'web',
      originalUrl: 'https://en.wikipedia.org/wiki/Sea_level_rise',
      snippet: '...global mean sea level has risen... Rising sea levels pose a direct threat to coastal populations...',
    },
    {
      id: 'src-file-B',
      title: 'IPCC Report Chapter 3.pdf',
      type: 'file',
      snippet:
        'Observations show increases in extreme weather phenomena, including heatwaves and heavy precipitation...',
    },
    {
      id: 'src-web-C',
      title: 'UN Framework Convention on Climate Change',
      type: 'web',
      originalUrl: 'https://unfccc.int',
      snippet: '...emphasizes the need for international cooperation and concerted efforts to mitigate climate change...',
    },
     {
      id: 'src-ai-gen',
      title: 'AI Generation Pattern',
      type: 'ai',
      snippet: 'Detected patterns consistent with Large Language Model outputs.',
    },
  ],
  scores: {
    exactMatch: 10,
    paraphrase: 25,
    aiLikelihood: 65,
    overall: 40,
  },
  generatedAt: new Date().toISOString(),
};