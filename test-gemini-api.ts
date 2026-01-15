import { AffirmationService } from './src/modules/affirmation-flow/AffirmationService';
import dotenv from 'dotenv';

dotenv.config();

// Mock console.warn to avoid clutter
const originalWarn = console.warn;
console.warn = (...args) => {
    if (args[0].includes('No valid API key')) return;
    originalWarn(...args);
};

async function testGemini() {
    console.log('Testing Gemini API integration...');
    
    // Instantiate service
    const service = new AffirmationService('http://localhost:3000');
    
    try {
        const result = await service.generateAffirmation("I want to become a better programmer");
        console.log('API Result:', JSON.stringify(result, null, 2));
        
        if (result.goalId.startsWith('gemini-')) {
            console.log('SUCCESS: Real Gemini API response received.');
        } else {
            console.log('WARNING: Received mock response. Check API Key.');
        }
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testGemini();
