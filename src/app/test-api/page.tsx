"use client";

import { useState } from "react";
import AppWrapper from "@/components/layout/AppWrapper";

export default function TestAPIPage() {
    const [result, setResult] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

    const testListModels = async () => {
        setLoading(true);
        setResult("Testing...");

        try {
            const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                setResult(`ERROR ${response.status}: ${errorText}`);
                return;
            }

            const data = await response.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (error: any) {
            setResult(`FETCH ERROR: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testGenerateContent = async (modelName: string) => {
        setLoading(true);
        setResult(`Testing ${modelName}...`);

        try {
            const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: "Say hello in one word" }]
                    }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                setResult(`ERROR ${response.status}: ${errorText}`);
                return;
            }

            const data = await response.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (error: any) {
            setResult(`FETCH ERROR: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppWrapper>
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="font-poppins font-bold text-3xl">API Diagnostics</h1>

                <div className="bg-white rounded-2xl p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">API Key:</label>
                        <input
                            type="text"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl font-mono text-xs"
                            placeholder="Enter your Gemini API key"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={testListModels}
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50"
                        >
                            List Available Models
                        </button>

                        <button
                            onClick={() => testGenerateContent('gemini-1.5-flash')}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                            Test gemini-1.5-flash
                        </button>

                        <button
                            onClick={() => testGenerateContent('gemini-pro')}
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50"
                        >
                            Test gemini-pro
                        </button>

                        <button
                            onClick={() => testGenerateContent('gemini-1.5-pro')}
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Test gemini-1.5-pro
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6">
                    <h2 className="text-white font-semibold mb-3">Response:</h2>
                    <pre className="text-green-400 text-xs overflow-auto max-h-96 font-mono whitespace-pre-wrap">
                        {result || "Click a button to test the API"}
                    </pre>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h3 className="font-bold text-amber-900 mb-2">⚠️ Important Notes:</h3>
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                        <li>If you get a 403 error, your API key doesn't have access to the Generative Language API</li>
                        <li>If you get a 404 error, the model name is not available for your API key</li>
                        <li>Vertex AI requires OAuth/service account authentication and cannot be used directly from the browser</li>
                        <li>You need to generate a new API key from <a href="https://aistudio.google.com/apikey" target="_blank" className="underline font-semibold">Google AI Studio</a></li>
                    </ul>
                </div>
            </div>
        </AppWrapper>
    );
}
