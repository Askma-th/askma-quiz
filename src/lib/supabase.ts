import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase] Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: { persistSession: false },
  }
);

export interface QuizStats {
  total: number;
  distribution: Array<{
    result_key: string;
    count: number;
    percentage: number;
  }>;
}

export async function logCompletion(
  quizSlug: string,
  resultKey: string,
  fingerprint: string,
  referrer: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('quiz_completions')
      .insert({
        quiz_slug: quizSlug,
        result_key: resultKey,
        fingerprint,
        referrer: referrer || null,
      });

    if (error) {
      if (error.code === '23505') {
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function getQuizStats(quizSlug: string): Promise<QuizStats | null> {
  try {
    const { data, error } = await supabase.rpc('get_quiz_stats', {
      p_quiz_slug: quizSlug,
    });
    if (error || !data) return null;
    return data as QuizStats;
  } catch {
    return null;
  }
}

export async function getTrendingQuiz(): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('get_trending_quiz');
    if (error || !data) return null;
    return data as string;
  } catch {
    return null;
  }
}
