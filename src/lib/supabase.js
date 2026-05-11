import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project details
export const supabaseUrl = 'https://outuvoubeptwqwumjzxc.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dHV2b3ViZXB0d3F3dW1qenhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NjIwMzAsImV4cCI6MjA5NDAzODAzMH0.3eShEBQrfGhg7kevNAu-2VOgvyW-49TraqTTl5mdnrg';

export const isSupabaseConfigured = 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
