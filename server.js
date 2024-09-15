const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');  // Add this line to import cors
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Add cors middleware
app.use(cors({
    origin: '*',  // Allow all origins
    methods: ['POST'],  // Allow only POST method
    allowedHeaders: ['Content-Type', 'Authorization']  // Allow these headers
}));

app.use(express.json());
app.use(express.static('public'));

const HF_API_KEY = process.env.HF_API_KEY;

if (!HF_API_KEY) {
    console.error('HF_API_KEY is not set. Please set it in your environment or .env file.');
    process.exit(1);
}

app.post('/generate-image', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
            {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: prompt }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to generate image');
        }

        const result = await response.buffer();
        
        // Convert buffer to base64
        const base64Image = result.toString('base64');
        
        // Send back the base64 encoded image
        res.json({ image: `data:image/png;base64,${base64Image}` });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate image' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
