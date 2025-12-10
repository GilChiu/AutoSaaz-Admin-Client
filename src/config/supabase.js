// Supabase configuration for Admin Client
export const SUPABASE_URL = 'https://acqdzxnfpnwrhvatfzov.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjcWR6eG5mcG53cmh2YXRmem92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMzM4NzUsImV4cCI6MjA3NTkwOTg3NX0.Swfpu8xLlw6LemgANJb3RAmgxkJICM9Lr4npicHneyg';
export const FUNCTIONS_URL = 'https://acqdzxnfpnwrhvatfzov.functions.supabase.co';

// API Base URL - Admin uses Supabase Functions
export const API_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || FUNCTIONS_URL;
