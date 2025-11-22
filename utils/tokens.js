/**
 * Token & Cost Utility Module
 *
 * WHAT ARE TOKENS?
 * Tokens are the basic units that LLMs process text in. Not the same as words!
 * - 1 token ≈ 4 characters or ~0.75 words
 * - Why it matters: LLMs charge based on tokens, not words
 * - Punctuation, spaces, and special characters each consume tokens
 *
 * COST CALCULATION:
 * Total Cost = (input_tokens × input_rate) + (output_tokens × output_rate)
 * Rates are typically per 1 million tokens, so divide by 1,000,000
 *
 * Example: GPT-4o-mini with 1000 input tokens and 500 output tokens
 * - Input cost: 1000 × (0.150 / 1,000,000) = $0.00015
 * - Output cost: 500 × (0.600 / 1,000,000) = $0.0003
 * - Total: $0.00045
 */

/**
 * Pricing data for different models
 * Prices are per 1 million tokens (divided by 1,000,000 when calculating actual cost)
 * @type {Object}
 */
const MODEL_PRICING = {
  'gpt-4o-mini': { input: 0.150, output: 0.600 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
  'gemini-1.5-flash': { input: 0.075, output: 0.300 },  // FREE TIER AVAILABLE
  'gemini-1.5-pro': { input: 1.50, output: 6.00 },
  'gemini-2.0-flash': { input: 0.075, output: 0.300 },  // LOWEST COST
};

/**
 * Rough estimate of token count from text
 * Formula: tokens ≈ characters / 4
 *
 * Why this estimate?
 * - On average, 1 token = ~4 English characters
 * - This is a heuristic; actual token count depends on tokenizer
 * - For precise counts, use the model's tokenizer or count from API response
 *
 * @param {string} text - Text to estimate token count for
 * @returns {number} Estimated token count
 */
const estimateTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

/**
 * Calculate actual cost in USD based on token counts and model
 *
 * Why this is important:
 * - Helps you understand API spending and optimize queries
 * - Different models have different pricing tiers
 * - Output tokens often cost more than input tokens (2-4x more)
 *
 * @param {number} inputTokens - Number of input tokens used
 * @param {number} outputTokens - Number of output tokens used
 * @param {string} model - Model name (e.g., 'gpt-4o-mini')
 * @returns {number} Cost in USD
 */
const calculateCost = (inputTokens, outputTokens, model) => {
  // Get pricing for this model, or return 0 if model not found
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    console.warn(`Unknown model: ${model}. Pricing not available.`);
    return 0;
  }

  // Convert pricing from per-1M-tokens to per-token by dividing by 1,000,000
  const inputCost = (inputTokens * pricing.input) / 1000000;
  const outputCost = (outputTokens * pricing.output) / 1000000;

  return inputCost + outputCost;
};

/**
 * Format cost as a human-readable USD string
 *
 * Example outputs:
 * - formatCost(0.000123) → "$0.00012"
 * - formatCost(0.05) → "$0.05"
 * - formatCost(1.234) → "$1.23"
 *
 * @param {number} cost - Cost in USD
 * @returns {string} Formatted cost string
 */
const formatCost = (cost) => {
  if (cost === 0) return '$0.00';
  if (cost < 0.01) {
    // For very small costs, show more decimal places
    return `$${cost.toFixed(6)}`;
  }
  return `$${cost.toFixed(2)}`;
};

export { estimateTokens, calculateCost, formatCost, MODEL_PRICING };
