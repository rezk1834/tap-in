import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Vercel + Supabase integration names its public variables NEXT_PUBLIC_*,
// so Vite exposes those too. Secret variables (service role, JWT secret, passwords) are NOT exposed.
export default defineConfig({ plugins: [react()], envPrefix: ['VITE_', 'NEXT_PUBLIC_'] })
