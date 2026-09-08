// ============================================================
// benchmark.js
// Measures average token/character reduction from the current
// cleanPrompt() implementation across different prompt types.
//
// Run with: node benchmark.js
// ============================================================

const { cleanPrompt } = require("./services/promptCleaner");

// Sample prompts ranging from very chatty to already clean
const testCases = [
    {
        label: "Very chatty — full of filler",
        prompt: `Hello! I hope you are doing well. I want you to please explain binary search to me in detail. Could you please make sure it is good and accurate? I need your help with understanding how it works step by step. Thank you so much in advance!`
    },
    {
        label: "Moderately chatty — some filler",
        prompt: `Hi, I need you to write a function in JavaScript that reverses a string. Please make sure it handles edge cases. Can you also explain how it works? Thanks!`
    },
    {
        label: "Lightly polite — minimal filler",
        prompt: `Please write a Python function that checks if a number is prime. Include comments in the code.`
    },
    {
        label: "Already clean — no filler",
        prompt: `Write a Python function that checks if a number is prime. Include comments in the code.`
    },
    {
        label: "Technical prompt — code request with greetings",
        prompt: `Hey! I hope this finds you well. I want you to kindly help me build a REST API in Node.js using Express. I need you to include JWT authentication, bcrypt password hashing, and MongoDB as the database. Could you please make sure to include error handling and follow best practices? Let me know what you think. Thanks in advance!`
    },
    {
        label: "Long essay-style prompt — heavy filler",
        prompt: `Good morning! I hope you are doing well today. My question is about machine learning. I want you to please explain the difference between supervised and unsupervised learning. I need your help with understanding when to use each approach. Could you please give me examples for both? Please make sure it is accurate and perfectly explained. Also, kindly tell me about reinforcement learning as well. Can you help me with that? Thank you so much in advance. Kind regards.`
    },
    {
        label: "Instruction-heavy — repeated wrappers",
        prompt: `Your task is to create a sorting algorithm in C++. Your job is to implement quicksort. I want you to make sure it handles duplicate values. I need you to also handle an empty array edge case. Can you please create me this project?`
    },
    {
        label: "Already optimized — pure task",
        prompt: `Implement quicksort in C++. Handle duplicate values and empty arrays.`
    },
];

// ---------------------------------------------------------------------------
// Count characters (simple measure without tiktoken)
// ---------------------------------------------------------------------------
function charReduction(original, optimized) {
    const saved = original.length - optimized.length;
    const pct = original.length > 0 ? (saved / original.length) * 100 : 0;
    return { saved, pct: parseFloat(pct.toFixed(1)) };
}

// ---------------------------------------------------------------------------
// Count word tokens (split on whitespace — rough approximation)
// ---------------------------------------------------------------------------
function wordCount(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function wordReduction(original, optimized) {
    const origWords = wordCount(original);
    const optWords  = wordCount(optimized);
    const saved = origWords - optWords;
    const pct = origWords > 0 ? (saved / origWords) * 100 : 0;
    return { origWords, optWords, saved, pct: parseFloat(pct.toFixed(1)) };
}

// ---------------------------------------------------------------------------
// Run benchmark
// ---------------------------------------------------------------------------
console.log("\n" + "=".repeat(70));
console.log("  PROMPT OPTIMIZER — REDUCTION BENCHMARK");
console.log("  (Current stage: regex-based cleanPrompt only)");
console.log("=".repeat(70));

const results = [];

testCases.forEach((tc, i) => {
    const optimized = cleanPrompt(tc.prompt);
    const chars     = charReduction(tc.prompt, optimized);
    const words     = wordReduction(tc.prompt, optimized);

    results.push({ label: tc.label, chars, words });

    console.log(`\n[${i + 1}] ${tc.label}`);
    console.log(`  ORIGINAL : "${tc.prompt.substring(0, 80)}..."`);
    console.log(`  OPTIMIZED: "${optimized.substring(0, 80)}${optimized.length > 80 ? "..." : ""}"`);
    console.log(`  Words   : ${words.origWords} → ${words.optWords}  (saved ${words.saved}, ${words.pct}%)`);
    console.log(`  Chars   : ${tc.prompt.length} → ${optimized.length}  (saved ${chars.saved}, ${chars.pct}%)`);
});

// ---------------------------------------------------------------------------
// Summary statistics
// ---------------------------------------------------------------------------
const avgWordPct = results.reduce((sum, r) => sum + r.words.pct, 0) / results.length;
const avgCharPct = results.reduce((sum, r) => sum + r.chars.pct, 0) / results.length;

const maxWordPct = Math.max(...results.map(r => r.words.pct));
const minWordPct = Math.min(...results.map(r => r.words.pct));

console.log("\n" + "=".repeat(70));
console.log("  SUMMARY");
console.log("=".repeat(70));
console.log(`  Word reduction   — avg: ${avgWordPct.toFixed(1)}%   min: ${minWordPct}%   max: ${maxWordPct}%`);
console.log(`  Char reduction   — avg: ${avgCharPct.toFixed(1)}%`);
console.log(`\n  Note: These numbers reflect ONLY the regex cleaner (Step 1).`);
console.log(`  Redundancy removal (Steps 2–4) not yet wired in.`);
console.log(`  Expected improvement after full pipeline: +10–20% additional reduction`);
console.log(`  on prompts with repeated or paraphrased instructions.`);
console.log("=".repeat(70) + "\n");
