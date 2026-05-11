const config = require('../config/env');

// Simple AI service - uses fetch to call Gemini API if available
const callGemini = async (prompt) => {
  if (!config.geminiApiKey || config.geminiApiKey === 'your-gemini-api-key') {
    return null;
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (e) {
    console.error('Gemini API error:', e.message);
    return null;
  }
};

// @desc    Summarize announcement content
// @route   POST /api/ai/summarize
exports.summarize = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required.' });

    const result = await callGemini(
      `Summarize this internal company announcement in 1-2 concise sentences. Return only the summary, no formatting:\n\n${content}`
    );

    if (!result) {
      return res.status(503).json({ message: 'AI service unavailable. Configure GEMINI_API_KEY in environment.' });
    }
    res.json({ summary: result.trim() });
  } catch (error) {
    next(error);
  }
};

// @desc    Suggest better titles
// @route   POST /api/ai/suggest-title
exports.suggestTitle = async (req, res, next) => {
  try {
    const { content, currentTitle } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required.' });

    const result = await callGemini(
      `Given this announcement content and current title "${currentTitle || ''}", suggest 3 better, more engaging titles. Return them as a JSON array of strings, nothing else:\n\n${content}`
    );

    if (!result) {
      return res.status(503).json({ message: 'AI service unavailable. Configure GEMINI_API_KEY in environment.' });
    }
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const titles = JSON.parse(cleaned);
      res.json({ suggestions: titles });
    } catch {
      res.json({ suggestions: [result.trim()] });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auto-categorize announcement
// @route   POST /api/ai/categorize
exports.categorize = async (req, res, next) => {
  try {
    const { content, title } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required.' });

    const result = await callGemini(
      `Categorize this announcement into one of these categories: general, hr, engineering, finance, marketing, operations, safety, events, policy. Return only the single category word:\n\nTitle: ${title || ''}\nContent: ${content}`
    );

    if (!result) {
      return res.status(503).json({ message: 'AI service unavailable. Configure GEMINI_API_KEY in environment.' });
    }
    res.json({ category: result.trim().toLowerCase() });
  } catch (error) {
    next(error);
  }
};
