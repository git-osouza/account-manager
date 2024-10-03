import axios from "axios";

const apiAuth = 'https://account-mobile.tenhafibra.com.br/auth.php';


const loginService = {

    async authenticate(username, senha) {
        if (username && senha) {
            try {
                const res = await axios.post(apiAuth, {
                    username: username,
                    senha: senha
                });
                return { sucess: res.data.authenticate };
            } catch (error) {
                console.error('Erro ao autenticar', error);
                return { sucess: false };
            }
        }
        return { sucess: false };
    }

}


export default loginService;