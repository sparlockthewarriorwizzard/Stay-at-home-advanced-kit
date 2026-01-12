import axios, { AxiosInstance } from 'axios';
import * as FileSystem from 'expo-file-system';

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

    constructor(baseURL: string, getToken?: () => Promise<string | null>) {
        this.api = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

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
        const response = await this.api.post<{ success: boolean; data: AIResponse }>('/api/generate-prompt', { goalText });
        return response.data.data;
    }

    async uploadAudioRecording(fileUri: string): Promise<string> {
        try {
            // 1. Get Upload URL
            const uploadUrlResponse = await this.api.post<{ uploadURL: string }>('/api/objects/upload');
            const { uploadURL } = uploadUrlResponse.data;

            // 2. Upload File to signed URL
            const uploadResult = await FileSystem.uploadAsync(uploadURL, fileUri, {
                httpMethod: 'PUT',
                uploadType: FileSystem.UploadType.BINARY_CONTENT,
                headers: {
                    'Content-Type': 'audio/m4a',
                }
            });

            if (uploadResult.status < 200 || uploadResult.status >= 300) {
                throw new Error(`Upload failed with status ${uploadResult.status}`);
            }

            // 3. Register upload with backend
            const aclResponse = await this.api.put<{ objectPath: string }>('/api/audio-recordings', {
                audioURL: uploadURL
            });

            return aclResponse.data.objectPath;
        } catch (error) {
            console.error('Audio upload error:', error);
            throw error;
        }
    }

    async saveAudioToGoal(goalId: string, audioUrl: string): Promise<DailyGoal> {
        const endpoint = `/api/goals/${goalId}/audio`;
        const response = await this.api.post<{ data: DailyGoal }>(endpoint, { audioUrl });
        return response.data.data;
    }
}
