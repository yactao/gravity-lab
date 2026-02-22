import OpenAI from 'openai';
import config, { validateConfig } from './config.js';

/**
 * Unified LLM client — uses OpenAI SDK to talk to any compatible provider
 */
class LLMClient {
    constructor() {
        this.clients = new Map();
    }

    /**
     * Get or create an OpenAI client for a provider
     */
    getClient(providerName) {
        if (this.clients.has(providerName)) {
            return this.clients.get(providerName);
        }

        validateConfig(providerName);
        const provider = config.providers[providerName];

        const client = new OpenAI({
            baseURL: provider.baseURL,
            apiKey: provider.apiKey,
        });

        this.clients.set(providerName, client);
        return client;
    }

    /**
     * Send a chat completion request to any provider
     */
    async chat(providerName, model, messages, options = {}) {
        const client = this.getClient(providerName);
        const startTime = Date.now();

        // Kimi K2.5 models require temperature=1
        const isK25 = model.startsWith('kimi-k2');
        const temperature = isK25 ? 1 : (options.temperature ?? config.defaults.temperature);

        const params = {
            model,
            messages,
            temperature,
            max_tokens: options.maxTokens ?? config.defaults.maxTokens,
            stream: false,
        };

        let lastError;
        const maxRetries = options.retries ?? config.defaults.retries;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await client.chat.completions.create(params);
                const elapsed = Date.now() - startTime;

                return {
                    content: response.choices[0]?.message?.content || '',
                    model: response.model,
                    provider: providerName,
                    usage: response.usage || {},
                    elapsed,
                    finishReason: response.choices[0]?.finish_reason,
                };
            } catch (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    // Exponential backoff: 1s, 2s, 4s...
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(r => setTimeout(r, delay));
                }
            }
        }

        throw new Error(
            `[${providerName}/${model}] API call failed after ${maxRetries + 1} attempts: ${lastError.message}`
        );
    }

    /**
     * Send a chat completion with an image (vision/OCR)
     * @param {string} providerName
     * @param {string} model
     * @param {string} systemPrompt
     * @param {string} textPrompt - Text instruction
     * @param {string} imageBase64 - Base64-encoded image data
     * @param {string} mimeType - Image MIME type (image/jpeg, image/png, etc.)
     * @param {object} options
     */
    async chatWithImage(providerName, model, systemPrompt, textPrompt, imageBase64, mimeType = 'image/jpeg', options = {}) {
        const messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: [
                    { type: 'text', text: textPrompt },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:${mimeType};base64,${imageBase64}`,
                        },
                    },
                ],
            },
        ];

        return this.chat(providerName, model, messages, {
            maxTokens: options.maxTokens ?? 8192, // OCR needs more tokens
            temperature: options.temperature ?? 0.1, // Low temp for accuracy
            ...options,
        });
    }

    /**
     * Quick connectivity test for a provider
     */
    async testConnection(providerName) {
        const provider = config.providers[providerName];
        const model = provider.defaultModel;

        try {
            const result = await this.chat(providerName, model, [
                { role: 'user', content: 'Say "OK" and nothing else.' },
            ], { maxTokens: 10, retries: 0 });

            return {
                status: 'ok',
                provider: providerName,
                model: result.model,
                response: result.content.trim(),
                elapsed: result.elapsed,
            };
        } catch (error) {
            return {
                status: 'error',
                provider: providerName,
                model,
                error: error.message,
            };
        }
    }
}

// Singleton
const llmClient = new LLMClient();
export default llmClient;
