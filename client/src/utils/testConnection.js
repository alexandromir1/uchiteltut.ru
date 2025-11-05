import { supabase } from '../supabaseClient';

export const testConnection = async () => {
  console.log('🔗 Testing Supabase Connection...');
  
  // Проверяем переменные окружения
  console.log('📝 Environment variables:');
  console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
  console.log('REACT_APP_SUPABASE_ANON_KEY exists:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
  
  try {
    // Тест 1: Базовая проверка клиента
    console.log('\n🧪 Test 1: Client initialization');
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    console.log('✅ Supabase client initialized');

    // Тест 2: Проверка аутентификации
    console.log('\n🧪 Test 2: Authentication test');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', session);
    console.log('Session error:', sessionError);
    
    if (sessionError) {
      console.log('❌ Auth test failed:', sessionError.message);
    } else {
      console.log('✅ Auth test passed');
    }

    // Тест 3: Простая регистрация
    console.log('\n🧪 Test 3: Registration test');
    const testEmail = `test${Date.now()}@test.com`;
    const testPassword = 'test123456';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    console.log('Sign up data:', signUpData);
    console.log('Sign up error:', signUpError);

    if (signUpError) {
      console.log('❌ Registration failed:', signUpError.message);
      
      // Проверяем конкретные ошибки
      if (signUpError.message.includes('failed to fetch')) {
        console.log('🚨 Network error - check CORS settings');
      } else if (signUpError.message.includes('invalid')) {
        console.log('🚨 Invalid credentials or configuration');
      }
    } else {
      console.log('✅ Registration successful!');
      console.log('User:', signUpData.user);
      console.log('Session:', signUpData.session);
    }

    return {
      client: true,
      auth: !sessionError,
      registration: !signUpError,
      details: {
        session,
        signUpData,
        errors: {
          sessionError,
          signUpError
        }
      }
    };

  } catch (error) {
    console.error('❌ Connection test failed completely:', error);
    return {
      client: false,
      auth: false,
      registration: false,
      error: error.message
    };
  }
};