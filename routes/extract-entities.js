/**
 * Entity Extraction Endpoint
 * Uses OpenAI with JSON mode to extract structured entities from text
 *
 * LEARNING GOALS:
 * - Use JSON mode for deterministic structured output
 * - Work with temperature 0.0 for consistency
 * - Parse and validate JSON responses
 * - Extract named entities (person, org, date, etc.)
 * - Provide confidence scores for extractions
 */

import express from 'express';
import { OpenAI } from 'openai';
import { logRequest, logSuccess, logError } from '../utils/logger.js';
import { calculateCost, formatCost } from '../utils/tokens.js';

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
 * POST /ai/extract-entities
 * Extract named entities from provided text using GPT with JSON mode
 *
 * Request body:
 * {
 *   "text": "John Smith from Acme Corp...",
 *   "entity_types": ["person", "organization", "date", "money"]  // optional
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "entities": [
 *       {
 *         "type": "person",
 *         "value": "John Smith",
 *         "confidence": 0.95
 *       },
 *       ...
 *     ]
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
  const { text, entity_types = null } = req.body;
  const model = 'gpt-4o-mini';

  logRequest('POST', '/ai/extract-entities');

  try {
    // INPUT VALIDATION
    if (!text) {
      const error = new Error('Text is required for entity extraction');
      error.message = 'validation: text field is required';
      throw error;
    }

    if (text.length < 10) {
      const error = new Error('Text must be at least 10 characters');
      error.message = 'validation: text must be at least 10 characters';
      throw error;
    }

    const entityTypesList = entity_types || [
      'person',
      'organization',
      'location',
      'date',
      'money',
      'product',
    ];

    console.log(`🔍 Extracting entities (${entityTypesList.join(', ')}) from text`);

    /**
     * JSON MODE EXPLANATION:
     * When you set response_format: { type: "json_object" }:
     * - Model MUST return valid JSON
     * - Enables structured output extraction
     * - Perfect for parsing data from text
     * - Requires a JSON instruction in the system prompt
     *
     * WHY JSON MODE?
     * - Easy to parse and validate
     * - Predictable structure
     * - Can integrate into downstream systems
     * - Enables confidence scores
     */

    /**
     * TEMPERATURE 0.0 EXPLANATION:
     * We use 0.0 (deterministic) for entity extraction because:
     * - Same input should always produce same entities
     * - Randomness would lead to inconsistent results
     * - For named entity recognition, accuracy > creativity
     * - Production systems need reproducibility
     *
     * If we used 0.3 or higher, the same text might produce different entities!
     */
    const temperature = 0.0;

    // Get OpenAI client (lazy load)
    const client = getOpenAIClient();

    // Call OpenAI with JSON mode
    const response = await client.chat.completions.create({
      model,
      temperature,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert entity extraction system. Extract named entities from the provided text.
Return a JSON object with this structure:
{
  "entities": [
    {"type": "person", "value": "name", "confidence": 0.95},
    {"type": "organization", "value": "org name", "confidence": 0.90}
  ]
}
Entity types to extract: ${entityTypesList.join(', ')}
Only return entities that are actually present in the text.
Confidence should be 0.0-1.0, higher = more confident.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
    });

    // Extract JSON response
    const responseText = response.choices[0].message.content;
    let parsedResponse;

    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Failed to parse JSON response from model: ${parseError.message}`);
    }

    // Validate response structure
    if (!parsedResponse.entities || !Array.isArray(parsedResponse.entities)) {
      throw new Error('Invalid response format: missing or invalid entities array');
    }

    // CALCULATE METRICS
    const duration = Date.now() - startTime;

    // Get actual token counts from API response
    const inputTokens = response.usage.prompt_tokens;
    const outputTokens = response.usage.completion_tokens;
    const totalTokens = response.usage.total_tokens;

    // Calculate cost
    const cost = calculateCost(inputTokens, outputTokens, model);

    // Build response
    const result = {
      success: true,
      data: {
        entities: parsedResponse.entities,
        entity_count: parsedResponse.entities.length,
        unique_types: [...new Set(parsedResponse.entities.map((e) => e.type))],
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
          entity_types: entityTypesList,
          json_mode: true,
        },
      },
    };

    logSuccess(
      `✅ Entity extraction complete. Found ${result.data.entity_count} entities. Cost: ${result.metadata.cost.total}`
    );
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

    logError(`❌ Entity extraction failed: ${errorMessage}`);
    next(new Error(errorMessage));
  }
});

export default router;
