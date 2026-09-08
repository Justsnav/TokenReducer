// Text Optimizing Engine (Upgraded to sweep up trailing punctuation cleanly and preserve code blocks)
function cleanPrompt(rawText) {
    if (!rawText) return "";
    let text = rawText;

    // STEP 0: Protect code blocks (```...```) and inline code (`...`)
    // Content inside code blocks MUST NEVER be modified by prompt cleaners.
    const codeBlocks = [];
    text = text.replace(/```[\s\S]*?```|`[^`\n]+`/g, (match) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(match);
        return placeholder;
    });

    const filterPhrases = [
        // 1. CHATTY GREETINGS & ATTENTION GRABBERS
        // Note: avoid words like 'listen' without exclamation/comma that might appear in prose/code
        /\b(hello there|hello|hi there|hi|hey there|hey|hei|yo|dear ai|good morning|good afternoon|good evening|greetings|hallo|sup|check this out)\b[!.,\s]*/gi,
        /\blisten[!,\s]+/gi,

        // 2. CONVERSATIONAL FILLER & COLD INTROS
        /\bi would really appreciate it if you could\b/gi,
        /\bi would like you to\b/gi,
        /\bi hope you are having a (great|good|wonderful|nice) day[.!\s]*/gi,
        /\bi hope you are doing well[.!\s]*/gi,
        /\bi hope you're doing well[.!\s]*/gi,
        /\bhope you are doing well[.!\s]*/gi,
        /\bhow are you doing today[.?\s]*/gi,
        /\bhow are you[.?\s]*/gi,
        /\bi hope this finds you well[.!\s]*/gi,
        /\bit is nice to meet you[.!\s]*/gi,
        /\bi need your help with\b/gi,

        // 3. SUBMISSIVE / EXTRA POLITE REQUEST WRAPPERS
        /\bcould you please\b/gi,
        /\bcan you please\b/gi,
        /\bwould you please\b/gi,
        /\bplease make sure to\b/gi,
        /\bplease make sure that\b/gi,
        /\bmake sure that\b/gi,
        /\bkindly\b/gi,
        /\bplease\b/gi,

        // 4. ROBOTIC INTENT EXPLANATIONS
        /\bmy question is\b/gi,
        /\bmy request is\b/gi,
        /\bi am looking for\b/gi,
        /\bcan you help me with\b/gi,
        /\bcould you help me to\b/gi,
        /\bi want you to\b/gi,
        /\bi need you to\b/gi,
        /\bwhat i want is\b/gi,
        /\byour task is to\b/gi,
        /\byour job is to\b/gi,

        // 5. REDUNDANT QUALITY ENHANCERS (LLMs naturally aim to do these)
        /\b(accurately|perfectly|correctly|without errors|flawlessly|masterfully|in high quality|completely error-free)\b/gi,
        /\b(make sure it is good|do your best|give me a perfect answer)[.!\s]*/gi,

        // 6. CLOSING VALEDICTIONS & GRATITUDE SIGN-OFFS
        /\b(thank you so much in advance for your assistance|thank you so much in advance|thank you in advance for your assistance|thank you in advance|thanks in advance|thank you so much|thank you|thanks)[!.,\s]*/gi,
        /\b(kind regards|best regards|regards|sincerely|cheers|yours truly|have a great day|have a wonderful day)[!.,\s]*/gi,

        // 7. REPEATED TAIL-END INSTRUCTION WRAPPERS
        /\b(create me this project|build me this project|make this project for me|can you write this code)[.!\s]*/gi,
        /\blet me know what you think[.!\s]*/gi
    ];

    // 1. Remove all the filler conversational phrases cleanly
    filterPhrases.forEach(phrase => {
        text = text.replace(phrase, ''); 
    });

    // 2. CLEANUP STEP: Normalize duplicate commas, dangling conjunctions, and leftover symbols
    text = text.replace(/,(\s*,)+/g, ',');             // collapse multiple commas like ",," or ", ," into ","
    text = text.replace(/,\s*\./g, '.');              // turn ",." into "."
    text = text.replace(/\b(and|or|also)\s*[.!?]/gi, '.'); // clean dangling "and." or "or." at end of sentences
    text = text.replace(/^[ \t]*[,.;:!?\-]+/gm, '');    // trim leading punctuation on lines

    // 3. CLEANUP STEP: If the prompt starts with leftover punctuation/spaces, trim them out
    text = text.replace(/^[^a-zA-Z0-9`#*_\-]+/, '');

    // 4. Collapse multiple spaces and tabs
    text = text.replace(/[ \t]+/g, ' ');

    // 5. Remove stray spaces before punctuation
    text = text.replace(/\s+([.!?,;:])/g, '$1');

    // 6. Collapse excessive newlines
    text = text.replace(/\n{3,}/g, '\n\n');

    // 7. Restore protected code blocks
    codeBlocks.forEach((block, index) => {
        const placeholder = `__CODE_BLOCK_${index}__`;
        text = text.replace(placeholder, block);
    });

    return text.trim();
}

module.exports = { cleanPrompt };