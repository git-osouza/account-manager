import supabase from '@/utils/supabase';
import router from '@/router/router';
import { useToast } from "vue-toastification";

const toast = useToast();

export const validateAutentication = async () => {
  try {
    const authenticated = localStorage.getItem('authenticated');
    if(authenticated === 'true') {
      return true;
    }
  } catch (error) {
    console.error('Erro na validação de autenticação:', error);
  }
};

export const logoff = async () => {
  try {
    await supabase.auth.signOut();
    localStorage.setItem('authenticated', false);
    router.push({ name: 'Login' });
  } catch (error) {
    console.error('Erro no logoff:', error);
  }
}

export const signInWithPassword = async (email, password) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) {
      console.error('Erro ao fazer login com email e senha', error);
      toast.error('Erro ao fazer login com e-mail e senha');
    } else {
      localStorage.setItem('authenticated', true);
      router.push({ name: 'Cadastrar' });
    }
  } catch (err) {
    console.error('Erro ao fazer login', err);
    toast.error('Erro ao fazer login com e-mail e senha');
  }
};

export const signInWithOAuth = async (provider) => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider
    });

    if (error) {
      console.error(`Erro ao fazer login com ${provider}`, error);
      toast.error(`Erro ao fazer login com ${provider}`);
    } else {
      localStorage.setItem('authenticated', true);
      router.push({ name: 'Cadastrar' });
    }
  } catch (err) {
    console.error('Erro ao fazer login', err);
    toast.error(`Erro ao fazer login com ${provider}`);
  }
};
