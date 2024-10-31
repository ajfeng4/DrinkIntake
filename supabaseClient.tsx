import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qkxvipkfzmcokynnvzwg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreHZpcGtmem1jb2t5bm52endnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyMjE2ODUsImV4cCI6MjA0NTc5NzY4NX0.M_OV9Jz0wY7cvQPC64TJtNdhbzLlHZ3hLaB6lamu1t4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
