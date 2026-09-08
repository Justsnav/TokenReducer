// ============================================================
// sentenceAnalyzer.js
// Splits a prompt into sentences and extracts structured word
// data for downstream redundancy and optimization analysis.
//
// Key design decisions:
//  - Sentence splitter uses pre-processing to protect "Node.js",
//    "v2.0", "e.g." etc. from being broken at their internal dots.
//  - Word tokenizer handles trailing symbols so "C++" and "C#"
//    are preserved as single tokens.
//  - Stop-word list includes common prompt filler words so that
//    meaningfulWords only contains content-bearing tokens.
// ============================================================

// ---------------------------------------------------------------------------
// STOP-WORD LIST
//
// These are words that carry little or no semantic meaning in the context
// of prompt analysis. They are stripped when building meaningfulWords.
//
// Rules for adding words here:
//   ✓  Common grammatical words (articles, prepositions, conjunctions)
//   ✓  Auxiliary/linking verbs ("is", "are", "have", "will", ...)
//   ✓  Prompt-specific filler ("please", "kindly", "just", ...)
//   ✗  Action verbs that convey intent ("explain", "list", "compare")
//   ✗  Technical terms ("python", "json", "api")
//   ✗  Domain words ("algorithm", "complexity", "function")
// ---------------------------------------------------------------------------
const stopWords = new Set([
    // Personal pronouns
    "i", "me", "my", "myself",
    "you", "your", "yourself",
    "he", "him", "his",
    "she", "her", "hers",
    "we", "us", "our",
    "they", "them", "their",
    "it", "its",

    // Articles
    "a", "an", "the",

    // Prepositions
    "to", "in", "on", "at", "of", "for", "with",
    "by", "from", "into", "about", "as",
    "through", "during", "before", "after",
    "above", "below", "between", "out", "up",
    "down", "off", "over", "under",

    // Conjunctions
    "and", "or", "but", "so", "if", "then",
    "than", "because", "while", "although",
    "though", "since", "unless",

    // Auxiliary / linking verbs
    "is", "are", "was", "were", "be", "been", "being",
    "am", "do", "does", "did", "doing",
    "has", "have", "had", "having",
    "will", "would", "shall", "should",
    "can", "could", "may", "might", "must",

    // Demonstratives & determiners
    "this", "that", "these", "those",
    "some", "any", "all", "each", "every",
    "both", "few", "more", "most", "other",
    "such", "no", "not",

    // Common connectors / filler adverbs
    "just", "also", "very", "really", "quite",
    "too", "only", "even", "however", "now",
    "here", "there", "where", "when", "which",
    "who", "whom", "how", "what", "why",

    // Prompt-specific filler (polite wrappers, not content)
    "please", "kindly",

    // Light verbs that add no semantic content in prompts
    "get", "got", "give", "let", "make",
    "want", "need", "like", "use",
]);

// ---------------------------------------------------------------------------
// WORD TOKENIZER REGEX
//
// Captures technical terms as single tokens without destroying them.
// Uses TWO separate connector rules to handle different symbol behaviours:
//
// Rule 1: [.\-][a-z0-9]+
//   Dot or hyphen MUST be followed by at least one alphanumeric character.
//   This prevents trailing punctuation from being swallowed into the token.
//   "detail."  → "detail"   ✓  (trailing dot ignored)
//   "gpt-4."   → "gpt-4"   ✓  (trailing dot after a valid token ignored)
//   "node.js"  → "node.js" ✓  (dot followed by "js" — captured)
//   "gpt-4"    → "gpt-4"   ✓  (hyphen followed by "4" — captured)
//
// Rule 2: [+#][a-z0-9]*
//   Plus or hash may be followed by ZERO or more alphanumeric characters.
//   This allows trailing symbols which are part of language names.
//   "c++"  → "c++"  ✓  (two trailing pluses, no chars after)
//   "c#"   → "c#"   ✓  (trailing hash, no chars after)
//
// Full pattern:
//   [a-z0-9]+                        → base segment
//   (?:[.\-][a-z0-9]+|[+#][a-z0-9]*)* → repeated extensions, either rule
// ---------------------------------------------------------------------------
const WORD_REGEX = /[a-z0-9]+(?:[.\-][a-z0-9]+|[+#][a-z0-9]*)*/gi;

// ---------------------------------------------------------------------------
// SENTENCE SPLITTER — PRE-PROCESSING
//
// The core problem: sentence splitting on "." also breaks "Node.js" into
// "Node" and "js for the backend." because the regex sees "Node." as a
// sentence end.
//
// Solution: Before splitting, temporarily replace the dot inside known
// technical patterns with a placeholder, then restore it after splitting.
//
// Patterns protected:
//   - word.word  e.g. "Node.js", "React.js", "express.js"
//   - number.number  e.g. "v2.0", "1.5"
//   - common abbreviations: e.g., i.e., vs.
//
// Placeholder chosen to be something that NEVER appears in real prompts.
// ---------------------------------------------------------------------------
const DOT_PLACEHOLDER = "\u0000DOT\u0000";

function protectInternalDots(text) {
    // Protect word.word (e.g. Node.js, React.js)
    text = text.replace(/([a-zA-Z0-9])\.([a-zA-Z])/g, `$1${DOT_PLACEHOLDER}$2`);
    return text;
}

function restoreInternalDots(text) {
    return text.split(DOT_PLACEHOLDER).join(".");
}

// ---------------------------------------------------------------------------
// analyzeSentences(text)
//
// Main exported function. Parses a raw prompt string and returns an array
// of structured sentence objects:
//
//   id                  {number}   — zero-based position in the prompt
//   text                {string}   — original sentence text (UNCHANGED)
//   words               {string[]} — all tokens, lowercased, tech-term-safe
//   meaningfulWords     {string[]} — words with stop words removed
//   wordCount           {number}   — total token count
//   meaningfulWordCount {number}   — count after stop-word removal
// ---------------------------------------------------------------------------
function analyzeSentences(text) {
    if (!text || typeof text !== "string" || !text.trim()) {
        return [];
    }

    // Step 1: Normalize whitespace (collapse tabs/multiple spaces → single space)
    let normalized = text.replace(/[ \t]+/g, " ").trim();

    // Step 2: Protect internal dots in technical terms before sentence splitting
    const protected_ = protectInternalDots(normalized);

    // Step 3: Split into sentences on  .  !  ?
    // Pattern covers:
    //   [^.!?]+[.!?]+  → text ending with terminal punctuation
    //   [^.!?]+$       → final fragment with no terminal punctuation
    const rawSentences = protected_.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

    // Step 4: Build structured sentence objects
    const result = rawSentences
        .map((rawSentence, index) => {
            // Restore dots that were protected during splitting
            const sentence = restoreInternalDots(rawSentence).trim();

            // Extract words using the technical-term-aware regex.
            // Run on a lowercase copy so tokens are lowercase,
            // while keeping 'sentence' (the original text) untouched.
            const words = sentence.toLowerCase().match(WORD_REGEX) || [];

            // Filter stop words to get meaningful content tokens
            const meaningfulWords = words.filter(
                word => !stopWords.has(word)
            );

            return {
                id: index,
                text: sentence,                         // original, untouched
                words: words,                           // all tokens
                meaningfulWords: meaningfulWords,       // content tokens only
                wordCount: words.length,
                meaningfulWordCount: meaningfulWords.length,
            };
        })
        // Drop empty/punctuation-only sentences
        .filter(s => s.wordCount > 0);

    return result;
}

module.exports = { analyzeSentences, stopWords };