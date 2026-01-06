
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function getPdfHeadings() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const fileUri = 'https://generativelanguage.googleapis.com/v1beta/files/xzld3llnjcmk';

    // Use the model name found in list_models: gemini-2.5-flash
    const modelName = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        file_data: {
                            mime_type: 'application/pdf',
                            file_uri: fileUri
                        }
                    },
                    { text: "List the main headings or labels from this document. I want to see the chapters or sections. Just a list." }
                ]
            }
        ]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0].content) {
        console.log(data.candidates[0].content.parts[0].text);
    } else {
        console.log("Could not read PDF content:", JSON.stringify(data.error || data, null, 2));
    }
}

getPdfHeadings().catch(console.error);
