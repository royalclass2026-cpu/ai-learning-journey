/**
 * Text Summarization using Google Gemini API (FREE TIER)
 * 
 * WHY GEMINI FOR LEARNING?
 * - Free tier available: 15 requests per minute
 * - Perfect for practice without spending money
 * - Similar API patterns to OpenAI
 * - Great for understanding different LLM APIs
 * 
 * Get free API key: https://ai.google.dev/
 */

import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logRequest, logSuccess, logError } from '../utils/logger.js';
import { estimateTokens, calculateCost, formatCost } from '../utils/tokens.js';

const router = express.Router();

// Initialize Gemini client lazily (only when needed)
let genAI = null;

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Get a free key from https://ai.google.dev/');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * POST /ai/summarize-gemini
 * Summarize text using Google Gemini (FREE TIER AVAILABLE)
 *
 * Request body:
 * {
 *   "text": "Long text to summarize...",
 *   "max_words": 100,  // optional, default 100
 *   "model": "gemini-1.5-flash"  // optional
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
 *     "model": "gemini-1.5-flash",
 *     "provider": "google",
 *     "duration_ms": 1234,
 *     "tokens": { ... },
 *     "cost": { ... },
 *     "free_tier": true
 *   }
 * }
 */
router.post('/', async (req, res, next) => {
  const startTime = Date.now();
  const { text, max_words = 100, model = 'gemini-1.5-flash' } = req.body;

  logRequest('POST', '/ai/summarize-gemini');

  try {
    // INPUT VALIDATION
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

    console.log(`📝 Summarizing text (${text.length} chars) with Gemini model: ${model}`);

    /**
     * GEMINI API EXPLANATION:
     * Gemini uses a different API pattern than OpenAI
     * - No Chat Completions, uses generative model directly
     * - generateContent() for single responses
     * - streamGenerateContent() for streaming
     * - Temperature range: 0.0 to 2.0
     */

    const temperature = 0.3; // Balanced temperature like OpenAI version

    // Get Gemini client (lazy load)
    const client = getGeminiClient();

    // Initialize the model
    const geminiModel = client.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: Math.ceil(max_words * 1.5),
      },
    });

    // Create the summarization prompt
    const prompt = `You are a professional summarizer. Create a concise summary of about ${max_words} words. Focus on key points and maintain the original meaning.

Text to summarize:
${text}

Please provide only the summary without any additional commentary.`;

    // Call Gemini API
    const response = await geminiModel.generateContent(prompt);
    const summary = response.response.text();

    // CALCULATE METRICS
    const duration = Date.now() - startTime;

    // Estimate tokens (Gemini doesn't always return exact counts in free tier)
    const inputTokens = estimateTokens(prompt);
    const outputTokens = estimateTokens(summary);
    const totalTokens = inputTokens + outputTokens;

    // Calculate cost
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
        provider: 'google',
        duration_ms: duration,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens,
          note: 'Estimated tokens (free tier does not return exact counts)',
        },
        cost: {
          input: formatCost((inputTokens * 0.075) / 1000000),
          output: formatCost((outputTokens * 0.300) / 1000000),
          total: formatCost(cost),
          note: 'Gemini 1.5 Flash pricing',
        },
        free_tier: {
          available: true,
          limit: '15 requests per minute',
          cost: 'FREE',
          link: 'https://ai.google.dev/',
        },
        parameters: {
          temperature,
          max_words,
          max_tokens: Math.ceil(max_words * 1.5),
        },
      },
    };

    logSuccess(
      `✅ Gemini summarization complete. Cost: ${result.metadata.cost.total}, Time: ${duration}ms`
    );
    res.json(result);
  } catch (error) {
    // Handle different error types
    let errorMessage = error.message;

    if (error.message.includes('API_KEY')) {
      errorMessage = 'invalid_api_key: Check your GEMINI_API_KEY environment variable. Get free key from https://ai.google.dev/';
    } else if (error.message.includes('quota') || error.message.includes('rate_limit')) {
      errorMessage = 'rate_limit_exceeded: Free tier limit reached (15 requests/min). Wait a moment before retrying.';
    } else if (error.message.includes('validation')) {
      // Keep validation errors as-is
    }

    logError(`❌ Gemini summarization failed: ${errorMessage}`);
    next(new Error(errorMessage));
  }
});

export default router;
