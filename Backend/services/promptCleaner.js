// Text Optimizing Engine (Upgraded to sweep up trailing punctuation cleanly)
function cleanPrompt(rawText) {
    if (!rawText) return "";
    let text = rawText;

    const filterPhrases = [
    // 1. CHATTY GREETINGS & ATTENTION GRABBERS
    /\b(hello|hi|hey|hei|yo|dear ai|good morning|good afternoon|good evening|greetings|hallo|sup|listen|check this out)[!.,\s]*/gi,

    // 2. CONVERSATIONAL FILLER & COLD INTROS
    /\bi hope you are doing well[.!\s]*/gi,
    /\bi hope you're doing well[.!\s]*/gi,
    /\bhope you are doing well[.!\s]*/gi,
    /\bhow are you doing today[.?\s]*/gi,
    /\bhow are you[.?\s]*/gi,
    /\bi hope this finds you well[.!\s]*/gi,
    /\bit is nice to meet you[.!\s]*/gi,

    // 3. SUBMISSIVE / EXTRA POLITE REQUEST WRAPPERS
    /\bcould you please\b/gi,
    /\bcan you please\b/gi,
    /\bwould you please\b/gi,
    /\bplease write a\b/gi,
    /\bplease create\b/gi,
    /\bplease generate\b/gi,
    /\bplease explain\b/gi,
    /\bplease make sure to\b/gi,
    /\bkindly\b/gi,
    /\bplease\b/gi,

    // 4. ROBOTIC INTENT EXPLANATIONS
    /\bmy question is\b/gi,
    /\bmy request is\b/gi,
    /\bi need your help with\b/gi,
    /\bi am looking for\b/gi,
    /\bcan you help me with\b/gi,
    /\bcould you help me to\b/gi,
    /\bi want you to\b/gi,
    /\bi need you to\b/gi,
    /\bwhat i want is\b/gi,
    /\byour task is to\b/gi,
    /\byour job is to\b/gi,

    // 5. REDUNDANT QUALITY ENHANCERS (LLMs naturally aim to do these)
    /\b(accurately|perfectly|correctly|without errors|flawlessly|masterfully|in high quality)\b/gi,
    /\b(make sure it is good|do your best|give me a perfect answer)[.!\s]*/gi,

    // 6. CLOSING VALEDICTIONS & GRATITUDE SIGN-OFFS
    /\b(thank you so much in advance|thank you in advance|thanks in advance|thank you|thanks)[!.,\s]*/gi,
    /\b(kind regards|best regards|regards|sincerely|cheers|yours truly|have a great day)[!.,\s]*/gi,

    // 7. REPEATED TAIL-END INSTRUCTION WRAPPERS
    /\b(create me this project|build me this project|make this project for me|can you write this code)[.!\s]*/gi,
    /\blet me know what you think[.!\s]*/gi
];

    // 1. Remove all the filler conversational phrases cleanly
    filterPhrases.forEach(phrase => {
        text = text.replace(phrase, ''); 
    });

    // 2. CLEANUP STEP: If the prompt now starts with left-over punctuation or random symbols, trim them out
    text = text.replace(/^[^a-zA-Z0-9]+/, '');

    // 3. Collapse multiple spaces and tabs created during phrase stripping
    text = text.replace(/[ \t]+/g, ' ');

    // 4. Collapse 3 or more newlines into 2 lines
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
}

module.exports = { cleanPrompt };