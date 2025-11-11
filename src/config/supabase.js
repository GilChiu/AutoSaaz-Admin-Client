// Supabase configuration for Admin Client
export const SUPABASE_URL = 'https://lblcjyeiwgyanadssqac.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxibGNqeWVpd2d5YW5hZHNzcWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzNjMzMDQsImV4cCI6MjA0NTkzOTMwNH0.Dxe6u7ukJB_4djQurriZm5dIlffCu-yPl_oRNpUNypo';
export const FUNCTIONS_URL = 'https://lblcjyeiwgyanadssqac.functions.supabase.co';

// API Base URL - Admin uses Supabase Functions
export const API_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || FUNCTIONS_URL;
