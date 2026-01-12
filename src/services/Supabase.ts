import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import 'react-native-url-polyfill/auto';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: {
            getItem: (_key) => Promise.resolve(null), // TODO: Implement AsyncStorage
            setItem: (_key, _value) => Promise.resolve(),
            removeItem: (_key) => Promise.resolve(),
        },
        detectSessionInUrl: false,
    },
});
