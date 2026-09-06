const { analyzeSentences } =
    require("./services/sentenceAnalyzer");

const prompt = `
Please explain binary search in detail.
I want you to explain how binary search works!
Also explain its time complexity.
Return the answer in C++.
`;

const result = analyzeSentences(prompt);

console.log(JSON.stringify(result, null, 2));