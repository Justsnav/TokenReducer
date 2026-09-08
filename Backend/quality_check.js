// ============================================================
// quality_check.js
// Verifies that:
//  1. No words are being corrupted (e.g. "you" → "u")
//  2. Technical terms are preserved
//  3. Core task/intent words survive cleaning
//  4. The optimized prompt still contains the essential request
//
// Run with: node quality_check.js
// ============================================================

const { cleanPrompt } = require("./services/promptCleaner");
const { analyzeSentences } = require("./services/sentenceAnalyzer");

let passed = 0;
let failed = 0;

function check(label, condition, detail = "") {
    if (condition) {
        console.log(`  ✅ PASS — ${label}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL — ${label}${detail ? " | " + detail : ""}`);
        failed++;
    }
}

function section(title) {
    console.log("\n" + "=".repeat(65));
    console.log("  " + title);
    console.log("=".repeat(65));
}

// ================================================================
// TEST GROUP 1 — No word corruption
// The cleaner must NEVER produce garbled words like "u", "ur",
// "ur", "pls", etc. from valid English input.
// ================================================================
section("GROUP 1 — Word corruption checks");

const corruptionCases = [
    {
        input: "I hope you are doing well. Can you explain binary search?",
        // "you" must survive as "you", not be garbled into a standalone "u"
        // We check that the word "you" still appears in the output (not consumed)
        // AND that a lone " u " (space-u-space) does not appear.
        test: (out) => out.includes("you") && !/ u /i.test(out),
        label: "you → u corruption (you must remain as 'you')"
    },
    {
        input: "Hello! Your task is to write a function.",
        test: (out) => !out.toLowerCase().includes("ur task") && !out.toLowerCase().includes("ur job"),
        label: "your → ur corruption"
    },
    {
        input: "Hey! Please help me with this.",
        test: (out) => !/ u[. ]/.test(out.toLowerCase()),
        label: "no stray 'u' after Hey removal"
    },
    {
        input: "Could you please explain recursion?",
        test: (out) => out.includes("explain") && !/ u /i.test(out),
        label: "could you please → explain preserved, no corruption"
    },
];

corruptionCases.forEach(tc => {
    const out = cleanPrompt(tc.input);
    check(tc.label, tc.test(out), `output: "${out}"`);
});

// ================================================================
// TEST GROUP 2 — Core intent words must be preserved
// These are the ACTION words that define what the user wants.
// They must NEVER be removed.
// ================================================================
section("GROUP 2 — Core intent word preservation");

const intentCases = [
    {
        input: "Please explain binary search in detail.",
        mustContain: ["explain", "binary", "search"],
        label: "explain/binary/search preserved"
    },
    {
        input: "I want you to write a sorting algorithm in C++.",
        mustContain: ["sorting", "algorithm", "c++"],
        label: "sorting/algorithm/C++ preserved"
    },
    {
        input: "Could you please implement quicksort using Python?",
        mustContain: ["implement", "quicksort", "python"],
        label: "implement/quicksort/python preserved"
    },
    {
        input: "Your task is to build a REST API with Node.js and MongoDB.",
        mustContain: ["rest", "api", "node.js", "mongodb"],
        label: "REST/API/Node.js/MongoDB preserved"
    },
    {
        input: "Hello! I need you to compare bubble sort and merge sort.",
        mustContain: ["compare", "bubble", "sort", "merge"],
        label: "compare/bubble/merge sort preserved"
    },
    {
        input: "Please summarize the difference between TCP and UDP.",
        mustContain: ["summarize", "difference", "tcp", "udp"],
        label: "summarize/TCP/UDP preserved"
    },
];

intentCases.forEach(tc => {
    const out = cleanPrompt(tc.input).toLowerCase();
    tc.mustContain.forEach(word => {
        check(`"${word}" preserved in: "${tc.input.substring(0, 45)}..."`,
            out.includes(word.toLowerCase()),
            `output: "${out}"`
        );
    });
});

// ================================================================
// TEST GROUP 3 — Technical terms must survive
// ================================================================
section("GROUP 3 — Technical term preservation");

const techCases = [
    { input: "Write code in C++.",          term: "c++",     label: "C++ preserved" },
    { input: "Use C# for this task.",       term: "c#",      label: "C# preserved" },
    { input: "Build a Node.js server.",     term: "node.js", label: "Node.js preserved" },
    { input: "Use the GPT-4 model.",        term: "gpt-4",   label: "GPT-4 preserved" },
    { input: "Explain O(log n) complexity.",term: "o",       label: "O(log n) content preserved" },
    { input: "Return JSON output.",         term: "json",    label: "JSON preserved" },
    { input: "Use React.js for the UI.",    term: "react.js",label: "React.js preserved" },
    { input: "Please use Python 3.11.",     term: "3.11",    label: "version number preserved" },
];

techCases.forEach(tc => {
    const out = cleanPrompt(tc.input).toLowerCase();
    check(tc.label, out.includes(tc.term.toLowerCase()), `output: "${out}"`);
});

// ================================================================
// TEST GROUP 4 — Constraint words must survive
// ================================================================
section("GROUP 4 — Constraint preservation");

const constraintCases = [
    {
        input: "Please explain recursion. Keep the answer under 200 words.",
        mustContain: ["200", "words"],
        label: "word limit constraint preserved"
    },
    {
        input: "I need you to build this without using any external libraries.",
        mustContain: ["without", "external", "libraries"],
        label: "no-library constraint preserved"
    },
    {
        input: "Please write unit tests for each function.",
        mustContain: ["unit", "tests"],
        label: "testing requirement preserved"
    },
    {
        input: "Return only the final code, no explanations.",
        mustContain: ["code"],
        label: "output format constraint preserved"
    },
    {
        input: "The time complexity must be O(n log n).",
        mustContain: ["time", "complexity"],
        label: "complexity requirement preserved"
    },
];

constraintCases.forEach(tc => {
    const out = cleanPrompt(tc.input).toLowerCase();
    tc.mustContain.forEach(word => {
        check(`"${word}" in constraint test`,
            out.includes(word.toLowerCase()),
            `output: "${out}"`
        );
    });
});

// ================================================================
// TEST GROUP 5 — Already clean prompts must not be changed
// ================================================================
section("GROUP 5 — Clean prompts must be untouched");

const cleanCases = [
    "Implement quicksort in C++. Handle duplicates and empty arrays.",
    "Explain the difference between TCP and UDP.",
    "Write a Python function that checks if a number is prime.",
    "List five sorting algorithms and their time complexities.",
    "Compare REST and GraphQL APIs.",
];

cleanCases.forEach(input => {
    const out = cleanPrompt(input);
    check(`untouched: "${input.substring(0, 50)}..."`, out === input, `output: "${out}"`);
});

// ================================================================
// TEST GROUP 6 — Side-by-side meaning comparison
// ================================================================
section("GROUP 6 — Side-by-side before/after review");

const reviewCases = [
    "Hello! I hope you are doing well. I want you to please explain binary search in detail. Thank you!",
    "Hey! Could you please help me write a REST API in Node.js? I need you to include JWT auth. Thanks in advance!",
    "Good morning! Your task is to implement a linked list in C++. Please make sure it handles edge cases correctly. Kind regards.",
    "Hi, I need your help with understanding recursion. Could you please explain it with an example in Python? Let me know what you think.",
];

reviewCases.forEach((input, i) => {
    const out = cleanPrompt(input);
    console.log(`\n  [${i + 1}] ORIGINAL : ${input}`);
    console.log(`      OPTIMIZED: ${out}`);
    console.log(`      Reduction: ${Math.round(((input.length - out.length) / input.length) * 100)}% chars`);
});

// ================================================================
// FINAL SCORE
// ================================================================
const total = passed + failed;
section(`FINAL SCORE: ${passed}/${total} checks passed`);
if (failed === 0) {
    console.log("  🎉 All checks passed. No corruption. Meaning preserved.");
} else {
    console.log(`  ⚠️  ${failed} check(s) failed. Review output above.`);
}
console.log("=".repeat(65) + "\n");
