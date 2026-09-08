const { cleanPrompt } = require("./services/promptCleaner");
const { analyzeSentences } = require("./services/sentenceAnalyzer");
const { detectRedundancy } = require("./services/redundancyDetector");

// A realistic, large technical prompt (~220 words) containing:
// 1. Polite greetings and conversational fluff
// 2. Clear technical requirements & architecture (Node.js, Express, MongoDB, JWT)
// 3. Constraints (bcrypt salt rounds 10, rate limiting, no external auth services)
// 4. Paraphrased/redundant instruction sentences
// 5. Code examples / specifics (C++, O(log n), JSON schema)
// 6. Polite sign-off and closures
const bigPrompt = `
Hello there! I hope you are having a wonderful day. I need your help with designing a backend system.
Please create a production-ready authentication and authorization microservice using Node.js and Express.js with MongoDB as the database.
Your task is to build a complete user management system that handles user signup, login, and profile retrieval.
I want you to make sure that passwords are encrypted using bcrypt with at least 10 salt rounds before saving them to the database.
Could you please make sure to implement JSON Web Tokens (JWT) for session management with a 24-hour expiration time?
For security, please make sure to add rate limiting on the /login endpoint to prevent brute force attacks.
Do not use third-party auth services like Firebase or Auth0; everything must be built with native Express middleware.
Also, we need a separate utility function written in C++ or Node.js to calculate token consumption with O(1) space complexity and O(n) time complexity.
The API responses must strictly follow a structured JSON format containing success, message, and data fields.
I want you to write a complete user management system that handles signup and authentication cleanly.
Please make sure it is accurate, without errors, and in high quality.
Thank you so much in advance for your assistance! Have a great day and let me know what you think. Kind regards.
`.trim();

console.log("==================================================================");
console.log("TESTING 200+ WORD PROMPT CLEANING & MEANING PRESERVATION");
console.log("==================================================================");

const origWords = bigPrompt.split(/\s+/).filter(Boolean);
console.log(`Original Word Count: ${origWords.length} words`);

const cleanedPrompt = cleanPrompt(bigPrompt);
const cleanedWords = cleanedPrompt.split(/\s+/).filter(Boolean);
console.log(`Cleaned Word Count: ${cleanedWords.length} words`);

const wordsSaved = origWords.length - cleanedWords.length;
const reductionPct = ((wordsSaved / origWords.length) * 100).toFixed(2);
console.log(`Words Saved: ${wordsSaved} (${reductionPct}%)`);

console.log("\n------------------ CLEANED PROMPT OUTPUT ------------------");
console.log(cleanedPrompt);
console.log("-----------------------------------------------------------\n");

// Critical elements that MUST be preserved for meaning to remain 100% intact:
const essentialChecks = [
    { label: "Backend frameworks (Node.js & Express.js)", pass: /Node\.js/i.test(cleanedPrompt) && /Express\.js/i.test(cleanedPrompt) },
    { label: "Database (MongoDB)", pass: /MongoDB/i.test(cleanedPrompt) },
    { label: "Core functionality (authentication & authorization)", pass: /authentication/i.test(cleanedPrompt) && /authorization/i.test(cleanedPrompt) },
    { label: "Endpoints / user actions (signup, login, profile)", pass: /signup/i.test(cleanedPrompt) && /login/i.test(cleanedPrompt) && /profile/i.test(cleanedPrompt) },
    { label: "Security constraint (bcrypt with 10 salt rounds)", pass: /bcrypt/i.test(cleanedPrompt) && /10 salt rounds/i.test(cleanedPrompt) },
    { label: "Token spec (JWT with 24-hour expiration)", pass: /JWT/i.test(cleanedPrompt) && /24-hour/i.test(cleanedPrompt) },
    { label: "Endpoint rate limiting (/login endpoint)", pass: /rate limiting/i.test(cleanedPrompt) && /\/login/i.test(cleanedPrompt) },
    { label: "Negative constraint (no third-party auth / Firebase / Auth0)", pass: /Firebase/i.test(cleanedPrompt) && /Auth0/i.test(cleanedPrompt) && /middleware/i.test(cleanedPrompt) },
    { label: "Technical terms (C++, O(1) space, O(n) time)", pass: /C\+\+/i.test(cleanedPrompt) && /O\(1\)/i.test(cleanedPrompt) && /O\(n\)/i.test(cleanedPrompt) },
    { label: "Output format (structured JSON: success, message, data)", pass: /JSON/i.test(cleanedPrompt) && /success/i.test(cleanedPrompt) && /data/i.test(cleanedPrompt) },
];

console.log("Verification of Meaning & Constraint Preservation:");
let allPassed = true;
essentialChecks.forEach(item => {
    if (item.pass) {
        console.log(`  ✅ PASS: ${item.label}`);
    } else {
        console.log(`  ❌ FAIL: ${item.label}`);
        allPassed = false;
    }
});

// Also run through Sentence Analyzer and Redundancy Detector to see if it catches the repeated instruction
console.log("\n------------------ REDUNDANCY DETECTION ON PROMPT ------------------");
const analyzed = analyzeSentences(cleanedPrompt);
console.log(`Detected ${analyzed.length} distinct sentences in cleaned prompt.`);
const redundancies = detectRedundancy(analyzed);

console.log(`Redundant sentence pairs identified (similarity >= 0.60): ${redundancies.filter(r => r.redundant).length}`);
redundancies.filter(r => r.redundant).forEach(r => {
    console.log(`\n  [Sentence #${r.sentenceA}] "${analyzed[r.sentenceA].text}"`);
    console.log(`  [Sentence #${r.sentenceB}] "${analyzed[r.sentenceB].text}"`);
    console.log(`  Common Words: ${JSON.stringify(r.commonWords)}`);
    console.log(`  Overlap Similarity: ${r.similarity}`);
});

console.log("\n==================================================================");
if (allPassed) {
    console.log("🎉 ALL CRITICAL MEANINGS, CONSTRAINTS & TECHNICAL SPECS PRESERVED!");
} else {
    console.log("⚠️ Some critical items were lost. Review details above.");
}
console.log("==================================================================");
