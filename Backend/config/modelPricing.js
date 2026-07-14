//the pricing of the differnt models
const pricingModels = {
    // --- OPENAI MODELS ---
    "gpt-5": 1.25,         // Next-gen flagship (Agentic workflows)
    "gpt-4o": 2.50,        // Current premier workhorse
    "gpt-4.1": 2.00,       // Standard developer production model
    "gpt-4.1-mini": 0.40,  // Fast, mid-tier production model
    "gpt-4o-mini": 0.15,   // Legacy micro-budget tier
    "gpt-4.1-nano": 0.10,  // Cheapest entry-level classification model
    "o3": 2.00,            // Advanced reasoning model
    "o4-mini": 1.10,       // High-value budget reasoning model

    // --- ANTHROPIC (CLAUDE) MODELS ---
    "claude-opus-4.8": 5.00,   // Premium reasoning and complex coding flagship
    "claude-sonnet-4.6": 3.00, // Balanced industry favorite for developers
    "claude-haiku-4.5": 1.00,  // Lightweight, rapid-fire automation model

    // --- GOOGLE (GEMINI) MODELS ---
    "gemini-3.1-pro": 2.00,       // State-of-the-art preview model
    "gemini-2.5-pro": 1.25,       // Standard deep reasoning tier (under 200k context)
    "gemini-2.5-flash": 0.15,     // Balanced, fast production workhorse
    "gemini-2.5-flash-lite": 0.10 // Maximum budget optimization tier
};

module.exports = { pricingModels }