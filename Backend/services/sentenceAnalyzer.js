const stopWords = new Set([
    "i",
    "you",
    "he",
    "she",
    "we",
    "they",

    "the",
    "a",
    "an",

    "to",
    "in",
    "on",
    "at",
    "of",
    "for",
    "with",
    "by",
    "from",

    "and",
    "or",
    "but",

    "is",
    "are",
    "was",
    "were",
    "be",
    "been",

    "this",
    "that",
    "these",
    "those",

    "it",
    "its",

    "how",
    "what",
    "when",
    "where",
    "why"
]);
function analyzeSentences(text) {
    if (!text || !text.trim()) {
        return [];
    }

    // Normalize spaces
    text = text.replace(/[ \t]+/g, " ").trim();

    // Split into sentences
    const sentences =
        text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

    return sentences
        .map((sentence, index) => {

            // Remove punctuation for word analysis
            const words = sentence
                .toLowerCase()
                .match(/[a-z0-9]+(?:[+#.-][a-z0-9]*)*/gi) || [];

            const meaningfulWords = words.filter(
                word => !stopWords.has(word)
            );

            return {
                id: index,
                text: sentence.trim(),
                words: words,
                meaningfulWords : meaningfulWords,
                wordCount: words.length
            };
        })
        .filter(sentence => sentence.wordCount > 0);
}

module.exports = { analyzeSentences };