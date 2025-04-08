import { createClient } from '@supabase/supabase-js';

// 環境変数から取得（.env.localファイルに設定）
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://zgmkrbmtbfcvrefrvtfo.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnbWtyYm10YmZjdnJlZnJ2dGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwODc2MjAsImV4cCI6MjA1OTY2MzYyMH0.Wmnbp5F0wMFjqNc-VszB7PQNSnzS0VXI3cYt2Jlp5rk';

export const supabase = createClient(supabaseUrl, supabaseKey);
