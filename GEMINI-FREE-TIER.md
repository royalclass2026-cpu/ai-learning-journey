# 🆓 Google Gemini API - Free Tier Guide

## 📚 Why Gemini for Learning?

### Pricing Comparison
| Model | Cost | Notes |
|-------|------|-------|
| **Gemini 1.5 Flash** | ✅ **FREE** | Best for learning! 15 req/min |
| **Gemini 1.5 Pro** | Paid | More powerful, same API |
| **GPT-4o-mini** | $0.00015 per 1K input tokens | Cheapest OpenAI option |
| **Claude (Paid)** | Much more expensive | Not free tier available |

### Free Tier Benefits
✅ **15 requests per minute** - Perfect for learning  
✅ **50 requests per day** - Plenty for practice  
✅ **No credit card required** - Completely free  
✅ **Same API patterns** - Learn like professional APIs  
✅ **Fully functional** - Works for most tasks  

---

## 🚀 Getting Your Free Gemini API Key

### Step 1: Visit Google AI Studio
Go to: **https://ai.google.dev/**

### Step 2: Create API Key
1. Click "Create API Key" (on the left side)
2. Select "Create API key in new Google Cloud project"
3. Copy your API key (starts with `AIza...`)

### Step 3: Add to .env
```env
GEMINI_API_KEY=AIza_xxxxxxxxxxxxxxxxxxxx
```

### Step 4: Test It
```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "apiKeys": {
    "openai": "✓ Loaded",
    "gemini": "✓ Loaded"
  }
}
```

---

## 💻 Using Gemini in Your API

### Endpoint
```http
POST http://localhost:3000/ai/summarize-gemini
Content-Type: application/json

{
  "text": "Your text here...",
  "max_words": 100,
  "model": "gemini-1.5-flash"
}
```

### Response Example
```json
{
  "success": true,
  "data": {
    "summary": "AI is transforming technology through machine learning and deep learning...",
    "original_length": 245,
    "summary_length": 82,
    "compression_ratio": "66.5%",
    "word_count": 15
  },
  "metadata": {
    "model": "gemini-1.5-flash",
    "provider": "google",
    "duration_ms": 1234,
    "cost": {
      "total": "$0.00000563",
      "note": "FREE tier - no charges!"
    },
    "free_tier": {
      "available": true,
      "limit": "15 requests per minute",
      "cost": "FREE"
    }
  }
}
```

---

## 🧪 Test Cases

### Test 1: Simple Summarization (FREE)
```
Open tests/api-tests.http
Click "Send Request" on test #4:
  "Test Summarize - Gemini FREE TIER (30 words max)"
```

### Test 2: Longer Text (FREE)
```
Click on test #6:
  "Test Summarize - Gemini with Longer Text"
```

### Test 3: Compare with OpenAI
```
Run test #3 (OpenAI) and test #4 (Gemini)
Compare costs and response quality!
```

---

## 📊 Understanding Gemini vs OpenAI

### API Differences

**OpenAI (Chat Completions)**:
```javascript
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{role: 'user', content: text}]
})
```

**Gemini (Generative)**:
```javascript
const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'});
const response = await model.generateContent(prompt);
```

### Feature Comparison

| Feature | Gemini | OpenAI |
|---------|--------|--------|
| Free Tier | ✅ Yes | ❌ No |
| Chat API | ✅ Yes | ✅ Yes |
| JSON Mode | Limited | ✅ Full |
| Streaming | ✅ Yes | ✅ Yes |
| Token Counting | Estimated | ✅ Exact |
| Vision API | ✅ Yes | ✅ Yes |

---

## 💰 Cost Analysis

### Your First 100 Requests (Free)

**Gemini 1.5 Flash**:
- Input: 1000 tokens × $0.075/1M = $0.000075
- Output: 500 tokens × $0.300/1M = $0.00015
- **Total per request: $0.000225**
- **100 requests: $0.02** (literally pennies!)

**OpenAI GPT-4o-mini**:
- Input: 1000 tokens × $0.150/1M = $0.00015
- Output: 500 tokens × $0.600/1M = $0.0003
- **Total per request: $0.00045**
- **100 requests: $0.045** (still cheap, but more)

**Saving**: ~50% cheaper with Gemini + FREE tier!

---

## 🎓 Learning Path

### Week 1: Master Gemini (FREE)
1. Get your API key (5 minutes)
2. Test /ai/summarize-gemini endpoint
3. Run all test cases
4. Understand token estimation
5. Compare with OpenAI results

### Week 2: Mix and Match
1. Use Gemini for practice (free)
2. Use OpenAI for production (small costs)
3. Understand API differences
4. Learn when to use each

### Week 3: Advanced Features
1. Try streaming responses
2. Implement error handling
3. Build multi-model fallbacks
4. Optimize for cost

---

## ⚠️ Gemini Free Tier Limitations

### Rate Limits
```
15 requests per minute
50 requests per day
```

### What This Means
✅ Perfect for learning and testing  
✅ Great for hobby projects  
❌ Not suitable for production apps  
❌ Can't use for high-traffic APIs  

### How to Stay Within Limits
1. Test locally first
2. Use test cases (built-in delays)
3. Cache responses
4. Wait 4 seconds between requests

---

## 🔄 Switching Between APIs

### Use Gemini for Testing
```bash
# Test free Gemini endpoint
curl -X POST http://localhost:3000/ai/summarize-gemini \
  -H "Content-Type: application/json" \
  -d '{"text": "...", "max_words": 50}'
```

### Use OpenAI for Production
```bash
# Production OpenAI endpoint
curl -X POST http://localhost:3000/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "...", "max_words": 50}'
```

### Compare Results
Both endpoints:
- Accept same input format
- Return same response structure
- Use same error handling
- Easy to compare and swap

---

## 🐛 Troubleshooting

### Error: "API_KEY not found"
```
Solution: Add GEMINI_API_KEY to .env file
Get key from: https://ai.google.dev/
```

### Error: "quota exceeded"
```
Solution: You've hit rate limit (15 req/min)
Fix: Wait a few seconds and retry
Note: Free tier has daily limit of 50 requests
```

### Error: "Invalid API Key"
```
Solutions:
1. Check key format starts with "AIza"
2. Copy entire key (no spaces)
3. Regenerate key if needed
4. Restart server after updating .env
```

### Responses are slow
```
Solutions:
1. Normal - Gemini API is in US (latency)
2. Use shorter texts for testing
3. Set appropriate max_words
4. Try simpler prompts
```

---

## 📖 Official Resources

- **Google AI Studio**: https://ai.google.dev/
- **Gemini API Docs**: https://ai.google.dev/docs
- **Google Generative AI SDK**: https://github.com/google/generative-ai-node
- **Free Tier Info**: https://ai.google.dev/pricing

---

## 🎯 Next Steps

### Immediately
1. Get free API key from https://ai.google.dev/
2. Add `GEMINI_API_KEY` to `.env`
3. Test `/ai/summarize-gemini` endpoint

### This Week
1. Run all Gemini test cases
2. Compare with OpenAI responses
3. Understand the API differences
4. Monitor costs (should be free!)

### Practice Ideas
- [ ] Summarize articles (free!)
- [ ] Test different models
- [ ] Compare response quality
- [ ] Measure performance
- [ ] Build cost comparison dashboard

---

## ✅ Checklist

- [ ] Got free Gemini API key
- [ ] Added GEMINI_API_KEY to .env
- [ ] npm install completed successfully
- [ ] Health check shows Gemini as loaded
- [ ] /ai/summarize-gemini endpoint works
- [ ] Ran test #4 successfully
- [ ] Compared Gemini vs OpenAI responses
- [ ] Understood free tier limits

---

## 💡 Pro Tips

**Tip 1**: Always test with Gemini first (it's free!)  
**Tip 2**: Only use OpenAI for production  
**Tip 3**: Cache responses to stay within limits  
**Tip 4**: Monitor your daily request count  
**Tip 5**: Use test cases to practice error handling  

---

## 🎉 You're All Set!

You now have:
- ✅ Free Gemini API access
- ✅ Working /ai/summarize-gemini endpoint
- ✅ 50 free requests per day
- ✅ Complete learning environment
- ✅ No credit card needed!

**Happy learning! 🚀**
