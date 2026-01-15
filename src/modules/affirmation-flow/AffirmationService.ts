import axios, { AxiosInstance } from 'axios';
import * as FileSystem from 'expo-file-system';
import { GEMINI_API_KEY } from '@env';

export interface AIResponse {
    affirmation: string;
    steps: string[];
    goalId: string;
}

export interface DailyGoal {
    id: string;
    goalText: string;
    isCompleted: boolean;
    isRecorded: string; // "true" | "false"
    createdAt: string;
}

export class AffirmationService {
    private api: AxiosInstance;
    private isDemoMode: boolean;

    constructor(baseURL: string, getToken?: () => Promise<string | null>) {
        this.isDemoMode = baseURL.includes('your-api-url.com') || baseURL.includes('localhost');
        this.api = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (this.isDemoMode) {
            console.log('AffirmationService initialized in DEMO MODE. Backend calls will be simulated.');
        }

        if (getToken) {
            this.api.interceptors.request.use(async (config) => {
                const token = await getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            });
        }
    }

    async generateAffirmation(goalText: string): Promise<AIResponse> {
        const key = GEMINI_API_KEY;
        console.log(`DEBUG: Generating affirmation. Key Type: ${typeof key}, Length: ${key?.length || 0}`);

        // If we have a Gemini API Key, call it directly
        if (key && key !== 'your_gemini_key') {
            try {
                const response = await fetch(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-goog-api-key': key
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: `You are an expert life coach. The user's goal is: "${goalText}". 
                                    Generate a powerful, one-sentence "I am" affirmation and exactly 3 clear action steps.`
                                }]
                            }],
                            generationConfig: {
                                responseMimeType: "application/json",
                                responseJsonSchema: {
                                    type: "object",
                                    properties: {
                                        affirmation: { type: "string" },
                                        steps: { 
                                            type: "array",
                                            items: { type: "string" }
                                        }
                                    },
                                    required: ["affirmation", "steps"]
                                }
                            }
                        })
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Gemini API Failed: ${response.status} ${errorText}`);
                }

                const responseData = await response.json();
                const text = responseData.candidates[0].content.parts[0].text;
                const parsed = JSON.parse(text);

                return {
                    affirmation: parsed.affirmation,
                    steps: parsed.steps,
                    goalId: 'gemini-' + Date.now(),
                };
            } catch (error: any) {
                console.error('Gemini API Error:', error);
                console.log('Falling back to mock data due to API error.');
                return this.getMockData(goalText);
            }
        }

        console.warn('No valid API key found. Using mock data.');
        return this.getMockData(goalText);
    }

    private getMockData(goalText: string): AIResponse {
        return {
            affirmation: `I am capable of achieving "${goalText}". My potential is limitless.`,
            steps: [
                "Take the first small step today.",
                "Visualize your success clearly.",
                "Trust the process and stay consistent."
            ],
            goalId: 'mock-goal-id-' + Date.now(),
        };
    }

    async uploadAudioRecording(fileUri: string): Promise<string> {
        if (this.isDemoMode) {
            console.log('DEMO MODE: Simulating audio upload...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            return fileUri; // Just return the local URI
        }

        try {
            // 1. Get Upload URL
            const uploadUrlResponse = await this.api.post<{ uploadURL: string }>('/api/objects/upload');
            const { uploadURL } = uploadUrlResponse.data;

            // 2. Upload File to signed URL
            const uploadResult = await FileSystem.uploadAsync(uploadURL, fileUri, {
                httpMethod: 'PUT',
                uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
                headers: {
                    'Content-Type': 'audio/m4a',
                },
            });

            if (uploadResult.status < 200 || uploadResult.status >= 300) {
                throw new Error(`Upload failed with status ${uploadResult.status}`);
            }

            // 3. Register upload with backend
            const aclResponse = await this.api.put<{ objectPath: string }>('/api/audio-recordings', {
                audioURL: uploadURL,
            });

            return aclResponse.data.objectPath;
        } catch (error) {
            console.warn('Audio upload failed, returning local URI for demo.', error);
            // Return the local URI so the app can continue
            return fileUri;
        }
    }

    async saveAudioToGoal(goalId: string, audioUrl: string): Promise<DailyGoal> {
        if (this.isDemoMode) {
             console.log('DEMO MODE: Simulating goal save...');
             await new Promise(resolve => setTimeout(resolve, 500));
             return {
                id: goalId,
                goalText: 'Demo Goal',
                isCompleted: true,
                isRecorded: 'true',
                createdAt: new Date().toISOString(),
            };
        }

        try {
            const endpoint = `/api/goals/${goalId}/audio`;
            const response = await this.api.post<{ data: DailyGoal }>(endpoint, { audioUrl });
            return response.data.data;
        } catch (error) {
            console.warn('Save goal failed, returning mock goal.', error);
            return {
                id: goalId,
                goalText: 'Mock Goal Text',
                isCompleted: true,
                isRecorded: 'true',
                createdAt: new Date().toISOString(),
            };
        }
    }
}
