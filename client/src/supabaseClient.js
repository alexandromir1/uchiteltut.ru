// Временное решение - можно удалить после замены всех использований
export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null })
      })
    }),
    insert: () => ({
      select: async () => ({ data: [], error: null })
    }),
    delete: () => ({
      eq: async () => ({ error: null })
    })
  }),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null })
  }
};