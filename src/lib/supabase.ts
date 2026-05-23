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

// ===== Admin Dashboard Functions =====

export interface AdminOverview {
  totalCompletions: number;
  uniqueQuizzes: number;
  last24h: number;
  last7d: number;
}

export interface QuizBreakdown {
  quizSlug: string;
  total: number;
  results: { resultKey: string; count: number; percentage: number }[];
}

export interface RecentCompletion {
  quizSlug: string;
  resultKey: string;
  fingerprint: string;
  referrer: string | null;
  createdAt: string;
}

export async function getAdminOverview(): Promise<AdminOverview | null> {
  try {
    const now = new Date();
    const day = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { count: total } = await supabase
      .from('quiz_completions')
      .select('*', { count: 'exact', head: true });

    const { count: c24 } = await supabase
      .from('quiz_completions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', day);

    const { count: c7 } = await supabase
      .from('quiz_completions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', week);

    const { data: slugs } = await supabase
      .from('quiz_completions')
      .select('quiz_slug');
    const uniqueQuizzes = new Set((slugs ?? []).map(r => r.quiz_slug)).size;

    return {
      totalCompletions: total ?? 0,
      uniqueQuizzes,
      last24h: c24 ?? 0,
      last7d: c7 ?? 0,
    };
  } catch (e) {
    console.error('[admin] getAdminOverview error', e);
    return null;
  }
}

export async function getAllQuizBreakdowns(): Promise<QuizBreakdown[]> {
  try {
    const { data, error } = await supabase
      .from('quiz_completions')
      .select('quiz_slug, result_key');
    if (error || !data) return [];

    const map = new Map<string, Map<string, number>>();
    for (const row of data) {
      if (!map.has(row.quiz_slug)) map.set(row.quiz_slug, new Map());
      const inner = map.get(row.quiz_slug)!;
      inner.set(row.result_key, (inner.get(row.result_key) ?? 0) + 1);
    }

    const result: QuizBreakdown[] = [];
    for (const [quizSlug, inner] of map.entries()) {
      const total = Array.from(inner.values()).reduce((a, b) => a + b, 0);
      const results = Array.from(inner.entries())
        .map(([resultKey, count]) => ({
          resultKey,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
      result.push({ quizSlug, total, results });
    }
    return result.sort((a, b) => b.total - a.total);
  } catch (e) {
    console.error('[admin] getAllQuizBreakdowns error', e);
    return [];
  }
}

export async function getRecentCompletions(limit = 30): Promise<RecentCompletion[]> {
  try {
    const { data, error } = await supabase
      .from('quiz_completions')
      .select('quiz_slug, result_key, fingerprint, referrer, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map(r => ({
      quizSlug: r.quiz_slug,
      resultKey: r.result_key,
      fingerprint: r.fingerprint,
      referrer: r.referrer,
      createdAt: r.created_at,
    }));
  } catch (e) {
    console.error('[admin] getRecentCompletions error', e);
    return [];
  }
}
