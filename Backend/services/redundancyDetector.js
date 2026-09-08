// ============================================================
// redundancyDetector.js
// Detects redundant sentence pairs using word-overlap similarity
// (Jaccard index over meaningful words).
//
// This is Step 2 of the optimization pipeline. It does NOT
// delete sentences — it only flags them with a similarity score
// and a redundant boolean. The optimizer (Step 7) decides what
// to do with the results.
// ============================================================

// ---------------------------------------------------------------------------
// REDUNDANCY_THRESHOLD
//
// Two sentences are considered redundant when their Jaccard similarity
// meets or exceeds this value.
//
// 0.00 → everything is redundant (useless)
// 1.00 → only exact duplicates are flagged (too strict)
// 0.50 → good baseline for word-overlap (lenient)
// 0.60 → recommended starting point
//
// This will be raised later in Step 3 when TF-IDF + cosine similarity
// replaces raw word overlap.
// ---------------------------------------------------------------------------
const REDUNDANCY_THRESHOLD = 0.60;

// ---------------------------------------------------------------------------
// jaccardSimilarity(setA, setB)
//
// Computes the Jaccard index between two Sets of strings.
//
// Formula:
//   J(A, B) = |A ∩ B| / |A ∪ B|
//
// Returns a number between 0.0 (no overlap) and 1.0 (identical sets).
// Returns 0 when both sets are empty to avoid division by zero.
// ---------------------------------------------------------------------------
function jaccardSimilarity(setA, setB) {
    if (setA.size === 0 && setB.size === 0) return 0;

    // Build intersection: words that appear in both sets
    const intersection = new Set(
        [...setA].filter(word => setB.has(word))
    );

    // Build union: all unique words across both sets
    const union = new Set([...setA, ...setB]);

    return intersection.size / union.size;
}

// ---------------------------------------------------------------------------
// compareSentences(sentenceA, sentenceB)
//
// Compares two sentence objects (as produced by analyzeSentences) and
// returns a detailed redundancy result object.
//
// Parameters:
//   sentenceA  — sentence object { id, text, meaningfulWords, ... }
//   sentenceB  — sentence object { id, text, meaningfulWords, ... }
//
// Returns:
//   {
//     sentenceA:   number   — id of sentence A
//     sentenceB:   number   — id of sentence B
//     commonWords: string[] — words found in both sentences
//     similarity:  number   — Jaccard score, rounded to 4 decimal places
//     redundant:   boolean  — true if similarity >= REDUNDANCY_THRESHOLD
//   }
// ---------------------------------------------------------------------------
function compareSentences(sentenceA, sentenceB) {
    const setA = new Set(sentenceA.meaningfulWords);
    const setB = new Set(sentenceB.meaningfulWords);

    const commonWords = [...new Set(
        [...setA].filter(word => setB.has(word))
    )];

    const similarity = jaccardSimilarity(setA, setB);

    return {
        sentenceA: sentenceA.id,
        sentenceB: sentenceB.id,
        commonWords,
        similarity: parseFloat(similarity.toFixed(4)),
        redundant: similarity >= REDUNDANCY_THRESHOLD,
    };
}

// ---------------------------------------------------------------------------
// detectRedundancy(sentences)
//
// Takes the full array of analyzed sentences (from analyzeSentences) and
// compares every unique pair (i, j) where i < j.
//
// This is an O(n²) comparison — fine for typical prompts which have
// fewer than 30 sentences. For very long documents this would need
// optimization, but that is out of scope for now.
//
// Parameters:
//   sentences — array of sentence objects from sentenceAnalyzer
//
// Returns:
//   Array of redundancy result objects (only pairs where redundant === true
//   OR where similarity > 0 so we have useful data).
//   Pairs with zero overlap are excluded to keep output clean.
// ---------------------------------------------------------------------------
function detectRedundancy(sentences) {
    if (!sentences || sentences.length < 2) return [];

    const results = [];

    for (let i = 0; i < sentences.length; i++) {
        for (let j = i + 1; j < sentences.length; j++) {
            const result = compareSentences(sentences[i], sentences[j]);

            // Only include pairs that have at least some overlap
            // (zero overlap pairs carry no useful information)
            if (result.commonWords.length > 0) {
                results.push(result);
            }
        }
    }

    // Sort by similarity descending — most redundant pairs appear first
    results.sort((a, b) => b.similarity - a.similarity);

    return results;
}

// ---------------------------------------------------------------------------
// getRedundantPairs(sentences)
//
// Convenience wrapper that returns ONLY the pairs flagged as redundant.
// Use this when you just need to know "which pairs should be collapsed".
// ---------------------------------------------------------------------------
function getRedundantPairs(sentences) {
    return detectRedundancy(sentences).filter(r => r.redundant);
}

module.exports = {
    detectRedundancy,
    getRedundantPairs,
    compareSentences,
    REDUNDANCY_THRESHOLD,
};
