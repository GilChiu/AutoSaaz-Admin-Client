// Supabase configuration for Admin Client
export const SUPABASE_URL = 'https://woerqhgdmwhggmwhyieh.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZXJxaGdkbXdoZ2dtd2h5aWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMzExNzIsImV4cCI6MjA4MDkwNzE3Mn0.uqHlBulaku6iewisnQjoF_80R7gqlL9jXj3_Te3-wEE';
export const FUNCTIONS_URL = 'https://woerqhgdmwhggmwhyieh.functions.supabase.co';

// API Base URL - Admin uses Supabase Functions
export const API_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || FUNCTIONS_URL;
