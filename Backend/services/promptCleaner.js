//Text Optimizing
function cleanPrompt(rawText){
    let text = rawText;
    text = text.replace(/[ \t]+/g,' ');//remove multiple space and tabs into a single space
    text = text.replace(/\n{3,}/g,'\n\n');//remove 3 or more newlines into 2 line
    const filterPhrases = [
        /\bhello\b/gi,
        /\bhi\b/gi,
        /\bhey\b/gi,
        /\bhei\b/gi,
        /\bgood morning\b/gi,
        /\bgood afternoon\b/gi,
        /\bgood evening\b/gi,

        /\bi hope you are doing well\b/gi,
        /\bi hope you're doing well\b/gi,
        /\bhope you are doing well\b/gi,

        /\bcould you please\b/gi,
        /\bcan you please\b/gi,
        /\bwould you please\b/gi,
        /\bplease\b/gi,

        /\bplease write a\b/gi,
        /\bplease create\b/gi,
        /\bplease generate\b/gi,

        /\bthank you\b/gi,
        /\bthanks\b/gi,
        /\bthank you in advance\b/gi,
        /\bthanks in advance\b/gi,

        /\bkind regards\b/gi,
        /\bbest regards\b/gi,
        /\bregards\b/gi,
        /\bsincerely\b/gi
    ];


    filterPhrases.forEach(phrase =>{
        text = text.replace(phrase,' ');
    });
    return text.trim();
}
module.exports = clearPrompt;