const { getEncoding } = require("js-tiktoken");
const { cleanPrompt } = require("./services/promptCleaner");
const { analyzeSentences } = require("./services/sentenceAnalyzer");
const { detectRedundancy } = require("./services/redundancyDetector");

const encoder = getEncoding("cl100k_base");

const prompt = `Hey, hello! I hope you are doing well. I would really appreciate it if you could please help me with the following task. I want you to carefully and thoroughly explain how I can build a production-ready authentication system for a full-stack web application. Please make sure that the explanation is very detailed, accurate, correct, perfect, and completely error-free. I would like you to explain the authentication system in detail and provide a detailed explanation of how the authentication process works from beginning to end.

The application should use Node.js and Express.js for the backend and React.js for the frontend. I want you to explain how to implement user registration and user login. Please explain the registration process and also explain how a user can register an account and create their account securely. The login process should also be explained in detail, including how users log in and how the server verifies their credentials.

Use MongoDB as the database. Store the user's email, username, and password in the database. The password must never be stored as plain text. Passwords should be hashed using bcrypt before being stored. Please make sure that bcrypt is used correctly and securely for password hashing. Explain why password hashing is necessary and explain how bcrypt protects passwords.

After successful login, generate a JWT token for the authenticated user. The JWT should contain the user's ID. Explain how JWT authentication works and explain how the JWT is generated, returned to the client, stored by the client, and sent back to the server on subsequent requests. The server should verify the JWT before allowing access to protected routes. Please explain how protected routes work and how authentication middleware verifies the token.

Use the following requirements:

* Use Node.js.
* Use Express.js.
* Use MongoDB.
* Use Mongoose.
* Use bcrypt.
* Use JWT.
* Use React.js.
* Use REST APIs.
* Use JSON for API requests and responses.
* The backend should run on port 3000.
* The frontend should run separately.
* The API must use POST /signup for registration.
* The API must use POST /signin for login.
* The API must use GET /profile as an authenticated protected route.
* Return HTTP 400 when required input is missing.
* Return HTTP 401 when authentication fails.
* Return HTTP 409 when a user already exists.
* Do not expose the user's password in API responses.
* Use environment variables for secrets.
* Do not hardcode the JWT secret in production.

For registration, validate that email, username, and password are provided. Validate that the email has a valid format. Validate that the password has at least 8 characters. Check whether the username or email already exists before creating a new user. Hash the password using bcrypt with an appropriate salt factor and then store the hashed password in MongoDB.

For login, accept username and password. Find the user by username. Compare the supplied password with the stored bcrypt hash. If the credentials are valid, generate a JWT containing the user's database ID. The JWT should expire after 24 hours. Return the token to the client. If the username does not exist or the password is incorrect, return an authentication error without revealing which credential was incorrect.

For the protected profile endpoint, the client should send the JWT in the Authorization header using the Bearer token format. The authentication middleware should extract the token, verify it using the JWT secret, obtain the user ID from the token payload, and attach the authenticated user ID to the request object. The protected route should then use this ID to retrieve the user from MongoDB.

I also want the system to handle errors properly. Do not expose internal database errors, stack traces, passwords, JWT secrets, or other sensitive information to the client. Use appropriate HTTP status codes and meaningful but safe error messages.

Here is an example of the kind of code structure I am currently using:

\`\`\`js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
    // registration logic
});

app.post("/signin", async (req, res) => {
    // login logic
});

function authMiddleware(req, res, next) {
    // JWT verification
}

app.get("/profile", authMiddleware, async (req, res) => {
    // protected route
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
\`\`\`

The final implementation should be clean, modular, maintainable, and suitable for a real-world application. Separate authentication logic, middleware, models, controllers, routes, and configuration where appropriate. Explain the folder structure and explain why each component belongs in its particular location.

Also explain common security mistakes that developers make when implementing JWT authentication, bcrypt password hashing, MongoDB authentication, and protected REST APIs. Explain how to prevent these mistakes.

Do not skip any requirement. Do not repeat the same explanation multiple times. Give me a structured implementation with clear explanations and production-oriented recommendations.
Thank you so much in advance, and please make the answer comprehensive and detailed.`;

const originalTokens = encoder.encode(prompt).length;
const optimized = cleanPrompt(prompt);
const optimizedTokens = encoder.encode(optimized).length;
const tokensSaved = originalTokens - optimizedTokens;
const pctSaved = ((tokensSaved / originalTokens) * 100).toFixed(2);

console.log("=================================================");
console.log("TOKEN METRICS (cl100k_base encoder)");
console.log("=================================================");
console.log(`Original Tokens:   ${originalTokens}`);
console.log(`Optimized Tokens:  ${optimizedTokens}`);
console.log(`Tokens Saved:      ${tokensSaved} (${pctSaved}%)`);
console.log("=================================================");

console.log("\n================ OPTIMIZED PROMPT OUTPUT ================\n");
console.log(optimized);
console.log("\n=========================================================");
