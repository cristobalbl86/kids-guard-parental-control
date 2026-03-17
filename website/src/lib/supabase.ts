import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactMessage(data: ContactMessage) {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  const { error } = await supabase.from('contact_messages').insert([
    {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    },
  ]);

  if (error) throw error;
}
