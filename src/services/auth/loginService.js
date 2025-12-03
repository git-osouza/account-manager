import supabase from '@/utils/supabase';
import { useToast } from "vue-toastification";

const toast = useToast();

export const validateAutentication = async () => {
  try {
    const {data: { user }} = await supabase.auth.getUser();
    if(!user) {
      return null;
    }
    return user.role === 'authenticated' ? true : false;
  } catch (error) {
    console.error('Erro na validação de autenticação:', error);
  }
};

export const logoff = async () => {
  try {
    await supabase.auth.signOut();
    return true;
  } catch (error) {
    console.error('Erro no logoff:', error);
    return false;
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
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.error('Erro ao fazer login', err);
    toast.error('Erro ao fazer login com e-mail e senha');
    return false;
  }
};

export const signInWithOAuth = async (provider) => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: 'https://git-osouza.github.io/account-manager/'
      }

    });

    if (error) {
      console.error(`Erro ao fazer login com ${provider}`, error);
      toast.error(`Erro ao fazer login com ${provider}`);
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.error('Erro ao fazer login', err);
    toast.error(`Erro ao fazer login com ${provider}`);
    return false;
  }
};
