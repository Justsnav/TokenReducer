const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {getEncoding} = require("js-tiktoken");

const { userModel } = require("./model");
const { authMiddleware } = require("./middleware");
const {modelPricing} = require("./config/modelPricing");
const {promptCleaner} = require("./services/promptCleaner");

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

app.listen(3000, () => {
    console.log("Server running on port 3000");
});