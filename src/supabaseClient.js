import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://faixqfttqqfzfozxzpwv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaXhxZnR0cXFmemZvenh6cHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNTUyOTAsImV4cCI6MjA3MTYzMTI5MH0.Qn0TeyBrzt9mDbJJhRTq-XmiSCpCCOCtfgECvcDpeiw'; // replace with your anon key or from environment variables
export const supabase = createClient(supabaseUrl, supabaseKey);
