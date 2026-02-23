import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.from('day_places').select('*').limit(1);
    console.log('day_places schema:', error ? error : (data && data[0] ? Object.keys(data[0]) : 'empty table'));
}
check();
