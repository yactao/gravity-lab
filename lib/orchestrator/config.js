import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: resolve(__dirname, '../../.env') });

const config = {
  providers: {
    deepseek: {
      name: 'DeepSeek',
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      models: ['deepseek-chat', 'deepseek-reasoner'],
      defaultModel: 'deepseek-chat',
    },
    kimi: {
      name: 'Kimi (Moonshot)',
      baseURL: 'https://api.moonshot.ai/v1',
      apiKey: process.env.KIMI_API_KEY || '',
      models: ['kimi-k2.5', 'kimi-k2-turbo-preview', 'moonshot-v1-auto', 'moonshot-v1-128k', 'moonshot-v1-32k-vision-preview'],
      defaultModel: 'kimi-k2.5',
    },
  },

  roles: {
    coder: {
      provider: 'deepseek',
      model: 'deepseek-chat',
      systemPrompt: `You are an expert software engineer. You write clean, efficient, well-documented code.
- Follow best practices and design patterns
- Include error handling
- Write self-documenting code with clear variable names
- Prefer simplicity over cleverness
- Always respond with the code, not explanations unless asked`,
    },
    researcher: {
      provider: 'kimi',
      model: 'kimi-k2.5',
      systemPrompt: `You are a technical researcher and analyst. Your role is to:
- Analyze documentation, codebases, and technical concepts in depth
- Provide structured summaries with key findings
- Identify patterns, trade-offs, and potential issues
- Give clear, actionable recommendations
- Cite sources and provide evidence for claims`,
    },
    reviewer: {
      provider: 'deepseek',
      model: 'deepseek-chat',
      systemPrompt: `You are a senior code reviewer. Your role is to:
- Review code for bugs, security issues, and performance problems
- Check adherence to best practices and design patterns
- Identify code smells and suggest improvements
- Categorize issues as: CRITICAL (must fix), IMPORTANT (should fix), SUGGESTION (nice to have)
- Be constructive — acknowledge what's done well before pointing out issues
- Provide specific, actionable feedback with code examples`,
    },
    tester: {
      provider: 'deepseek',
      model: 'deepseek-chat',
      systemPrompt: `You are a QA engineer and test specialist. Your role is to:
- Generate comprehensive test cases (unit, integration, edge cases)
- Identify boundary conditions and corner cases
- Write test code with clear assertions and descriptions
- Think about: null/undefined inputs, empty collections, concurrency, error paths
- Suggest test strategy and coverage priorities
- Use appropriate testing frameworks (Jest, Mocha, etc.)
- Always include both happy path and failure path tests`,
    },
    architect: {
      provider: 'deepseek',
      model: 'deepseek-chat',
      systemPrompt: `You are a software architect. Your role is to:
- Design system architectures and component interactions
- Choose appropriate patterns (MVC, event-driven, microservices, etc.)
- Consider scalability, maintainability, and extensibility
- Make technology stack recommendations with trade-off analysis
- Create clear diagrams and documentation
- Follow SOLID principles and separation of concerns`,
    },
    debugger: {
      provider: 'deepseek',
      model: 'deepseek-chat',
      systemPrompt: `You are a debugging specialist. Your role is to:
- Analyze error messages, stack traces, and logs systematically
- Form and test hypotheses about root causes
- Suggest targeted diagnostic steps
- Identify the minimal reproduction case
- Propose fixes ranked by likelihood of success
- Consider both immediate fixes and underlying design issues`,
    },
    ocr: {
      provider: 'kimi',
      model: 'kimi-k2.5',
      systemPrompt: `You are an OCR and document analysis specialist. Your role is to:
- Extract ALL text from images with maximum accuracy
- Preserve the original structure: headings, paragraphs, lists, tables
- Output in clean markdown format
- For tables, use markdown table syntax
- For code snippets, use fenced code blocks with language detection
- For mathematical formulas, use LaTeX notation
- Describe any diagrams, charts, or non-text elements
- If text is partially obscured or unclear, indicate it with [unclear]
- Always maintain the reading order of the original document`,
    },
  },

  defaults: {
    temperature: 0.7,
    maxTokens: 4096,
    timeout: 60000, // 60 seconds
    retries: 2,
  },
};

/**
 * Validate that required API keys are set
 */
export function validateConfig(providerName) {
  const provider = config.providers[providerName];
  if (!provider) {
    throw new Error(`Unknown provider: ${providerName}. Available: ${Object.keys(config.providers).join(', ')}`);
  }
  const envVarMap = {
    deepseek: 'DEEPSEEK_API_KEY',
    kimi: 'KIMI_API_KEY',
  };
  if (!provider.apiKey || provider.apiKey.startsWith('sk-your-') || provider.apiKey.startsWith('your-')) {
    throw new Error(
      `API key not set for ${provider.name}. Please set ${envVarMap[providerName] || providerName.toUpperCase() + '_API_KEY'} in .env file.`
    );
  }
  return true;
}

/**
 * Get the role config with provider details merged in
 */
export function getRoleConfig(roleName) {
  const role = config.roles[roleName];
  if (!role) {
    throw new Error(`Unknown role: ${roleName}. Available: ${Object.keys(config.roles).join(', ')}`);
  }
  const provider = config.providers[role.provider];
  return { ...role, providerConfig: provider };
}

export default config;
