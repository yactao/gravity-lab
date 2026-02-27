import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AppService } from '../app.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    tool_calls?: any[];
    tool_call_id?: string;
    name?: string;
}

@Injectable()
export class CopilotService {
    private readonly logger = new Logger(CopilotService.name);
    // Use DeepSeek API as the backend for the AI if not using local Llama/Qwen.
    // It fully supports OpenAI function calling format.
    private readonly apiUrl = 'https://api.deepseek.com/chat/completions';
    private apiKey: string;

    constructor(private readonly appService: AppService) {
        this.apiKey = process.env.DEEPSEEK_API_KEY || '';
        if (!this.apiKey) {
            this.logger.warn('DEEPSEEK_API_KEY is not defined in .env! Copilot will not work.');
        }
    }

    // Define the tools that the LLM is allowed to call
    private getAvailableTools() {
        return [
            {
                type: 'function',
                function: {
                    name: 'get_sensor_history',
                    description: 'Get historical data for a specific sensor over a given time period.',
                    parameters: {
                        type: 'object',
                        properties: {
                            deviceId: { type: 'string', description: 'The unique ID of the device/sensor.' },
                            startTime: { type: 'string', description: 'Start time in ISO format (e.g. 2026-02-20T00:00:00Z).' },
                            endTime: { type: 'string', description: 'End time in ISO format.' }
                        },
                        required: ['deviceId', 'startTime', 'endTime']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'set_device_state',
                    description: 'Change the state (ON/OFF, setpoint, brightness, etc) of a device or equipment. REQUIRES HUMAN CONFIRMATION for critical actions.',
                    parameters: {
                        type: 'object',
                        properties: {
                            deviceId: { type: 'string', description: 'The unique ID of the device to control.' },
                            action: { type: 'string', description: 'The type of action: power, temp_setpoint, brightness.' },
                            value: { type: 'string', description: 'The new value, e.g. "ON", "OFF", "22", "80%".' }
                        },
                        required: ['deviceId', 'action', 'value']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'list_my_available_devices',
                    description: 'Get a list of devices available to the user, optionally filtered by room or type.',
                    parameters: {
                        type: 'object',
                        properties: {
                            room: { type: 'string', description: 'Optional room name to filter (e.g. "Open Space", "Réunion").' },
                            deviceType: { type: 'string', description: 'Optional device type (e.g. "hvac", "light", "sensor").' }
                        }
                    }
                }
            }
        ];
    }

    async processChat(userMessage: string, tenantId: string, userRole: string): Promise<any> {
        // 1. Initial Context injection
        const systemPrompt = `Tu es le Copilote UBBEE, un assistant IA expert en GTB (Gestion Technique du Bâtiment) et Energy Management.
Tu gères le bâtiment de manière intelligente. 
IMPORTANT: L'utilisateur actuel a le rôle "${userRole}" sur le tenant "${tenantId}".
NE SOUMETS PAS de commandes de contrôle pour des appareils qui ne lui appartiennent pas.
L'heure actuelle locale est ${new Date().toISOString()}.
Utilise le Function Calling (les outils) pour trouver l'ID des équipements, obtenir leur état, et générer des commandes.
Ne réponds jamais avec un JSON direct à l'utilisateur, appelle la fonction. 
Si la sécurité ou la permission n'est pas claire, dis à l'utilisateur que tu ne peux pas.`;

        let messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ];

        // 2. Call the LLM
        return await this.callLLM(messages, tenantId, userRole);
    }

    private async callLLM(messages: ChatMessage[], tenantId: string, userRole: string): Promise<any> {
        this.logger.log(`Calling LLM API with ${messages.length} messages`);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: messages,
                    tools: this.getAvailableTools(),
                    tool_choice: 'auto',
                    temperature: 0.1
                })
            });

            if (!response.ok) {
                const err = await response.text();
                this.logger.error(`API Error: ${response.status} - ${err}`);
                return { role: 'assistant', content: 'Désolé, une erreur technique est survenue lors de la communication avec le cerveau de l\'IA.' };
            }

            const data = await response.json();
            const message = data.choices[0].message;

            // 3. Did the LLM want to call a tool?
            if (message.tool_calls && message.tool_calls.length > 0) {
                return await this.handleToolCalls(message, messages, tenantId, userRole);
            }

            // If no tool was called, return the final natural text
            return {
                role: 'assistant',
                content: message.content
            };

        } catch (e: any) {
            this.logger.error(`LLM execution failed: ${e.message}`);
            return { role: 'assistant', content: 'Erreur interne de l\'Agent.' };
        }
    }

    private async handleToolCalls(assistantMessage: any, history: ChatMessage[], tenantId: string, userRole: string): Promise<any> {
        this.logger.log(`LLM requested tool execution: ${assistantMessage.tool_calls.length} tools`);
        history.push(assistantMessage);

        const toolResponses: any[] = [];
        let requiresConfirmation = false;
        let pendingAction = null;

        for (const toolCall of assistantMessage.tool_calls) {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments);

            this.logger.log(`Executing Tool: ${toolName} with args: ${JSON.stringify(toolArgs)}`);
            let toolResultObj: any = {};

            try {
                // Execute logic based on the tool
                if (toolName === 'list_my_available_devices') {
                    // For the POC, we fetch all tenant devices from AppService
                    const devices = await this.appService.getSensors(tenantId);

                    // Basic filtering
                    let filtered = devices;
                    if (toolArgs.room) {
                        filtered = devices.filter((d: any) =>
                            d.name.toLowerCase().includes(toolArgs.room.toLowerCase()) ||
                            (d.zone && d.zone.name.toLowerCase().includes(toolArgs.room.toLowerCase()))
                        );
                    }
                    if (toolArgs.deviceType) {
                        filtered = filtered.filter((d: any) => d.type.toLowerCase().includes(toolArgs.deviceType.toLowerCase()));
                    }

                    // Mask sensitive data for LLM
                    toolResultObj = {
                        status: 'success',
                        devices: filtered.map((d: any) => ({
                            id: d.id,
                            name: d.name,
                            type: d.type
                        }))
                    };
                }
                else if (toolName === 'get_sensor_history') {
                    // Mock data or actual data query
                    toolResultObj = {
                        status: 'success',
                        data: [
                            { timestamp: '2026-02-27T10:00:00Z', value: 21.5 },
                            { timestamp: '2026-02-27T11:00:00Z', value: 22.1 },
                            { timestamp: '2026-02-27T12:00:00Z', value: 23.5 },
                        ]
                    };
                }
                else if (toolName === 'set_device_state') {
                    // RBAC check: Does user have rights to modify?
                    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ENERGY_MANAGER') {
                        toolResultObj = { status: 'error', reason: 'Permission Denied: Only Energy Managers or Admins can modify equipment state.' };
                    }
                    else {
                        // Crucial: Human-in-the-loop
                        // We do NOT execute it immediately, we prepare it for confirmation
                        requiresConfirmation = true;
                        pendingAction = {
                            toolCallId: toolCall.id,
                            deviceId: toolArgs.deviceId,
                            action: toolArgs.action,
                            value: toolArgs.value
                        };
                        toolResultObj = {
                            status: 'pending_human_confirmation',
                            message: 'This action has been halted waiting for the user to click Confirm on the Front-end.'
                        };
                    }
                }
                else {
                    toolResultObj = { status: 'error', reason: 'Unknown tool' };
                }

            } catch (err: any) {
                toolResultObj = { status: 'error', reason: err.message || 'Execution exception' };
            }

            // Append Tool Result to history so LLM can read it
            history.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                name: toolName,
                content: JSON.stringify(toolResultObj)
            });
        }

        // 4. Let LLM formulate final answer with the new tool context
        const finalResponse = await this.callLLM(history, tenantId, userRole);

        // Let's inject our "requiresConfirmation" flag into the final payload sent to the frontend React
        if (requiresConfirmation && pendingAction) {
            finalResponse.requires_human_confirmation = true;
            finalResponse.pending_action = pendingAction;
        }

        return finalResponse;
    }
}
