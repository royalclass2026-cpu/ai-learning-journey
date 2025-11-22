/**
 * Models Configuration
 *
 * WHAT IS TEMPERATURE?
 * Temperature controls the randomness of model output:
 * - 0.0 = Deterministic (same input always produces same output)
 * - 0.3 = Balanced (slightly creative, mostly consistent)
 * - 0.7 = Creative (more varied responses)
 * - 1.0+ = Very random (highly unpredictable)
 *
 * When to use each:
 * - Summarization (0.0-0.3): Keep it factual, consistent
 * - Entity extraction (0.0): Must be deterministic for accuracy
 * - Creative writing (0.7-1.0): Encourage variety
 * - Brainstorming (1.0-1.5): Maximum creativity
 */

/**
 * Available models and their configurations
 * @type {Object}
 */
export const MODELS = {
  openai: {
    default: 'gpt-4o-mini',
    available: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
    description: {
      'gpt-4o-mini': 'Fast, cost-effective model for general tasks',
      'gpt-4o': 'Latest GPT-4 Omni, multimodal capabilities',
      'gpt-4-turbo': 'Previous generation, powerful reasoning',
    },
  },
  gemini: {
    default: 'gemini-1.5-flash',
    available: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
    description: {
      'gemini-1.5-flash': 'Fast, free tier available - BEST FOR LEARNING',
      'gemini-1.5-pro': 'More capable, limited free tier',
      'gemini-2.0-flash': 'Latest Gemini model',
    },
    pricing: {
      'gemini-1.5-flash': { input: 0.075, output: 0.300 }, // per 1M tokens
      'gemini-1.5-pro': { input: 1.50, output: 6.00 },
      'gemini-2.0-flash': { input: 0.075, output: 0.300 },
    },
  },
};

/**
 * Temperature presets for different use cases
 * These are recommended values for common tasks
 * @type {Object}
 */
export const TEMPERATURE_PRESETS = {
  precise: 0.0,      // For factual, deterministic tasks (summarization, extraction)
  balanced: 0.3,     // Default for most tasks (good mix of consistency and creativity)
  creative: 0.7,     // For creative writing, brainstorming
  very_creative: 1.2, // Maximum creativity for open-ended generation
};

/**
 * Get temperature for a given task
 * @param {string} task - Task name ('summarize', 'extract', 'creative', etc.)
 * @returns {number} Recommended temperature
 */
export const getTemperatureForTask = (task) => {
  const taskTemperatures = {
    summarize: TEMPERATURE_PRESETS.precise,
    extract: TEMPERATURE_PRESETS.precise,
    translate: TEMPERATURE_PRESETS.balanced,
    creative: TEMPERATURE_PRESETS.creative,
    brainstorm: TEMPERATURE_PRESETS.very_creative,
  };
  return taskTemperatures[task] || TEMPERATURE_PRESETS.balanced;
};
