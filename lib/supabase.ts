import { createClient } from '@supabase/supabase-js'

// ✅ 環境変数から取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ クライアント生成
export const supabase = createClient(supabaseUrl, supabaseKey)
