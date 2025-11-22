/**
 * Text Summarization Endpoint
 * Uses OpenAI to create concise summaries of input text
 *
 * LEARNING GOALS:
 * - Make API calls to OpenAI Chat Completions
 * - Handle temperature (0.3 for deterministic output)
 * - Calculate token usage and costs
 * - Implement input validation
 * - Return structured responses
 */

import express from 'express';
import { OpenAI } from 'openai';
import { logRequest, logSuccess, logError } from '../utils/logger.js';
import { estimateTokens, calculateCost, formatCost } from '../utils/tokens.js';

const router = express.Router();

// Initialize OpenAI client lazily (only when needed)
let openai = null;

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please add it to .env file.');
  }
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

/**
 * POST /ai/summarize
 * Summarize provided text using GPT-4o-mini
 *
 * Request body:
 * {
 *   "text": "Long text to summarize...",
 *   "max_words": 100,  // optional, default 100
 *   "model": "gpt-4o-mini"  // optional
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "summary": "...",
 *     "original_length": 500,
 *     "summary_length": 150,
 *     "compression_ratio": "30.0%",
 *     "word_count": 45
 *   },
 *   "metadata": {
 *     "model": "gpt-4o-mini",
 *     "provider": "openai",
 *     "duration_ms": 1234,
 *     "tokens": { ... },
 *     "cost": { ... }
 *   }
 * }
 */
router.post('/', async (req, res, next) => {
  const startTime = Date.now();
  const { text, max_words = 100, model = 'gpt-4o-mini' } = req.body;

  logRequest('POST', '/ai/summarize');

  try {
    // INPUT VALIDATION
    // Always validate inputs before using them
    if (!text) {
      const error = new Error('Text is required for summarization');
      error.message = 'validation: text field is required';
      throw error;
    }

    if (text.length < 50) {
      const error = new Error('Text must be at least 50 characters');
      error.message = 'validation: text must be at least 50 characters';
      throw error;
    }

    if (max_words < 50 || max_words > 500) {
      const error = new Error('max_words must be between 50 and 500');
      error.message = 'validation: max_words must be between 50-500';
      throw error;
    }

    console.log(`📝 Summarizing text (${text.length} chars) with model: ${model}`);

    /**
     * TEMPERATURE EXPLANATION:
     * We use 0.3 here (balanced) instead of 0.0 (precise) because:
     * - Summarization benefits from slightly more natural language variation
     * - Temperature 0.0 might produce robotic, awkward summaries
     * - Temperature 0.3 gives us consistent yet readable output
     * - For entity extraction (next endpoint), we use 0.0 for determinism
     */
    const temperature = 0.3;

    /**
     * TOKENS EXPLANATION:
     * max_tokens is the MAXIMUM output length the model can produce
     * Formula: max_tokens = max_words * 1.5
     * - Why 1.5x? Because tokens ≈ 0.75 words, so words ≈ 1.3 tokens
     * - Adding buffer ensures the model has room to work
     * - For 100 word summary: 100 * 1.5 = 150 tokens max
     */
    const max_tokens = Math.ceil(max_words * 1.5);

    // Get OpenAI client (lazy load)
    const client = getOpenAIClient();

    // Call OpenAI Chat Completions API
    const response = await client.chat.completions.create({
      model,
      temperature,
      max_tokens,
      messages: [
        {
          role: 'system',
          content: `You are a professional summarizer. Create a concise summary of about ${max_words} words. Focus on key points and maintain the original meaning.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
    });

    // Extract the summary from response
    const summary = response.choices[0].message.content;

    // CALCULATE METRICS
    const duration = Date.now() - startTime;

    // Get actual token counts from API response
    const inputTokens = response.usage.prompt_tokens;
    const outputTokens = response.usage.completion_tokens;
    const totalTokens = response.usage.total_tokens;

    // Calculate cost based on model and token usage
    const cost = calculateCost(inputTokens, outputTokens, model);

    // Calculate compression ratio
    const originalLength = text.length;
    const summaryLength = summary.length;
    const compressionRatio = ((1 - summaryLength / originalLength) * 100).toFixed(1);

    // Count words in summary
    const wordCount = summary.split(/\s+/).filter((w) => w.length > 0).length;

    // Build response
    const result = {
      success: true,
      data: {
        summary,
        original_length: originalLength,
        summary_length: summaryLength,
        compression_ratio: `${compressionRatio}%`,
        word_count: wordCount,
      },
      metadata: {
        model,
        provider: 'openai',
        duration_ms: duration,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens,
        },
        cost: {
          input: formatCost((inputTokens * 0.150) / 1000000),
          output: formatCost((outputTokens * 0.600) / 1000000),
          total: formatCost(cost),
        },
        parameters: {
          temperature,
          max_words,
          max_tokens,
        },
      },
    };

    logSuccess(`✅ Summarization complete. Cost: ${result.metadata.cost.total}, Time: ${duration}ms`);
    res.json(result);
  } catch (error) {
    // Handle different API error types
    let errorMessage = error.message;

    if (error.code === 'insufficient_quota') {
      errorMessage = 'insufficient_quota: You have exhausted your API quota';
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'invalid_api_key: Check your OPENAI_API_KEY environment variable';
    } else if (error.code === 'rate_limit_exceeded') {
      errorMessage = 'rate_limit_exceeded: Too many requests. Please wait before retrying';
    }

    logError(`❌ Summarization failed: ${errorMessage}`);
    next(new Error(errorMessage));
  }
});

export default router;
