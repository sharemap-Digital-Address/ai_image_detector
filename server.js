const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Paganahin ang CORS para makakonekta ang iyong Kiosk frontend
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Para kayang tanggapin ang image payload

// Endpoint para sa AI Detection Proxy
app.post('/api/detect-ai', async (req, res) => {
    try {
        // Kunin ang token mula sa Environment Variables ng Render (Huwag i-hardcode dito!)
        const API_KEY = process.env.HUGGINGFACE_KEY;
        // Palitan ang lumang URL ng ganito:
        const model_url = "https://router.huggingface.co/hf-inference/models/umm-maybe/AI-image-detector";

        //const model_url = "https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector";

        if (!API_KEY) {
            return res.status(500).json({ error: "Nawawala ang Hugging Face API Key sa server environment variables." });
        }

        // Tanggapin ang base64 o binary data mula sa iyong frontend
        const imageData = req.body.image; // Halimbawa ay base64 string
        if (!imageData) {
            return res.status(400).json({ error: "Walang imaheng natanggap." });
        }

        // I-convert ang base64 pabalik sa buffer para maipasa sa Hugging Face
        const buffer = Buffer.from(imageData.split(',')[1], 'base64');

        // Tumawag sa Hugging Face API
        const response = await fetch(model_url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "image/jpeg"
            },
            body: buffer
        });

        const result = await response.json();
        res.status(response.status).json(result);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Nabigo ang server sa pagproseso ng kahilingan.", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server ay tumatakbo sa port ${PORT}`);
});
