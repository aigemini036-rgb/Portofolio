import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mhxwvsrxrbouohwahmsv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oeHd2c3J4cmJvdW9od2FobXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MDk1OTAsImV4cCI6MjEwMjE4NTU5MH0.3F87tyBlPiHbJls8o0SwTJtCYdNjk2loTe7adcRSkqU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
