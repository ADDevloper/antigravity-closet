
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
require('dotenv').config({ path: '.env.local' });

async function uploadAllKnowledge() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No API Key found in .env.local");
        return;
    }

    const fileManager = new GoogleAIFileManager(apiKey);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const filesToUpload = [
        {
            name: "Global Fashion Knowledge",
            path: path.join(__dirname, "../lib/fashionKnowledge.ts"),
            mimeType: "text/plain",
            isTS: true
        },
        {
            name: "Indian Fashion Knowledge",
            path: path.join(__dirname, "../../Closet_AI_Indian_Fashion_Knowledge_Base.pdf"),
            mimeType: "application/pdf"
        }
    ];

    const results = [];

    for (const fileInfo of filesToUpload) {
        console.log(`📤 Uploading ${fileInfo.name}...`);

        let uploadPath = fileInfo.path;
        let cleanup = false;

        // Special handling for the TS file to make it plain text
        if (fileInfo.isTS) {
            let content = fs.readFileSync(fileInfo.path, "utf8");
            content = content.replace("export const FASHION_KNOWLEDGE = `", "").replace("`;", "");
            uploadPath = "temp_knowledge.txt";
            fs.writeFileSync(uploadPath, content);
            cleanup = true;
        }

        try {
            const uploadResult = await fileManager.uploadFile(uploadPath, {
                mimeType: fileInfo.mimeType,
                displayName: fileInfo.name,
            });

            console.log(`✅ ${fileInfo.name} Uploaded! URI: ${uploadResult.file.uri}`);
            results.push({
                name: fileInfo.name,
                uri: uploadResult.file.uri,
                mimeType: fileInfo.mimeType
            });
        } catch (err) {
            console.error(`❌ Failed to upload ${fileInfo.name}:`, err);
        }

        if (cleanup) fs.unlinkSync(uploadPath);
    }

    console.log("\n🚀 FINAL URIS FOR lib/gemini.ts:");
    results.forEach(r => {
        console.log(`${r.name}: '${r.uri}'`);
    });

    // Verify Indian Knowledge
    if (results.find(r => r.name === "Indian Fashion Knowledge")) {
        const indianPdf = results.find(r => r.name === "Indian Fashion Knowledge");
        console.log("\n🧪 Verifying Indian Fashion Knowledge...");
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: indianPdf.mimeType,
                    fileUri: indianPdf.uri
                }
            },
            { text: "What are some key Indian ethnic wear mentioned in this document? List 3 traditional items." }
        ]);
        console.log("\n🤖 Indian Knowledge Test:", result.response.text());
    }
}

uploadAllKnowledge().catch(console.error);
