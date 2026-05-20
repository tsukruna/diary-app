import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "あなたのURL"
const supabaseKey = "あなたのKEY"

export const supabase = createClient(supabaseUrl, supabaseKey)
