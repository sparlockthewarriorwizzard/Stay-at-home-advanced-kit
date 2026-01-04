import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import 'react-native-url-polyfill/auto';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: {
            getItem: (key) => Promise.resolve(null), // TODO: Implement AsyncStorage
            setItem: (key, value) => Promise.resolve(),
            removeItem: (key) => Promise.resolve(),
        },
        detectSessionInUrl: false,
    },
});
