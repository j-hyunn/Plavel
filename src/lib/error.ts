import { PostgrestError } from '@supabase/supabase-js';

/**
 * Standardizes Supabase error handling across services.
 * Logs the error and throws a cleaned-up error message.
 */
export function handleSupabaseError(error: PostgrestError | Error, context: string): never {
    if ('message' in error && 'code' in error) {
        // Supabase error
        const pgError = error as PostgrestError;
        console.error(`[Supabase Error][${context}]:`, {
            message: pgError.message,
            details: pgError.details,
            hint: pgError.hint,
            code: pgError.code
        });
        throw new Error(`${context} failed: ${pgError.message}`);
    } else {
        // Generic error
        console.error(`[Error][${context}]:`, error.message);
        throw error;
    }
}
