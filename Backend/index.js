const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {getEncoding} = require("js-tiktoken");

const { userModel, userDataModel } = require("./model");
const { authMiddleware } = require("./middleware");
const {pricingModels} = require("./config/modelPricing");
const {promptCleaner, cleanPrompt} = require("./services/promptCleaner");

const app = express();
app.use(express.json());

//Initialize the tokenizer used by GPT-3.5 and GPT-4 models
const encoder = getEncoding("cl100k_base");

app.post("/signup", async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const userExists = await userModel.findOne({
            $or: [
                { username },
                { email: email.toLowerCase() }
            ]
        });

        if (userExists) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            email: email.toLowerCase(),
            username,
            password: hashedPassword
        });
        console.log(newUser)
        res.status(201).json({
            message: "User created successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.post("/signin", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const user = await userModel.findOne({ username });

        if (!user) {
            return res.status(403).json({
                message: "Incorrect credentials"
            });
        }

        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(403).json({
                message: "Incorrect credentials"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id
            },
            "supersecretPassword123",
            {
                expiresIn: "24h"
            }
        );

        res.json({
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.post("/minimize", authMiddleware, async(req,res)=>{
    try{
        const prompt = req.body.prompt;
        const model = req.body.model;
        const selectmodel = model || "gpt-4o";

        if(!prompt){
            return res.status(400).json({
                message:"Prompt text is required."
            })
        }
        //count original prompt tokens
        const originalToken = encoder.encode(prompt).length;
        //compress prompt text
        const optimizedPrompt = cleanPrompt(prompt);

        //count optimized prompt token
        const optimizedTokens = encoder.encode(optimizedPrompt).length;
        const tokenSaved = originalToken - optimizedTokens;

        //Token Price Calculator Logic 
        const pricePerMillion = pricingModels[selectmodel] || 2.50;
        const originalCost = (originalToken / 1000000) * pricePerMillion;
        const optimizedCost = (optimizedTokens / 1000000) * pricePerMillion;
        const estimatedCostSaved = originalCost - optimizedCost;

        //save entry log to database tracking user history
        await userDataModel.create({
            userId: req.userId,
            description: `Model: ${selectmodel} | Token Saved: ${tokenSaved} | Saved: $${estimatedCostSaved.toFixed(6)}`
        })
        return res.json({
            enhancedOrReducedPrompt: optimizedPrompt, // Direct link to your image layout!
            tokensUsed: originalToken,               // Top-right box
            newRefinedPromptToken: optimizedTokens,   // Bottom-right box
            metrics: {
                modelUsed: selectmodel,
                tokensSaved: tokenSaved,
                savingsPercentage: originalToken > 0 ? `${Math.round((tokenSaved / originalToken) * 100)}%` : "0%",
                moneySavedUSD: estimatedCostSaved.toFixed(6) 
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error processing prompt rules" });
    }
    
})

app.listen(3000, () => {
    console.log("Server running on port 3000");
});