import axios from 'axios';
import md5 from 'crypto-js/md5';
import { ENTRYPOINT } from '../config/entrypoint';

export async function checkPassword(password) {
    try {
        // Encoder le mot de passe en MD5 avant l'appel.
        const hashedPassword = md5(password).toString();
        // Attendre la réponse du endpoint avant de continuer.
        const response = await axios.post(`${ENTRYPOINT}/settings/auth`, { password: hashedPassword });
        // Enregistrer la réponse dans local storage sous la clé "logged".
        localStorage.setItem("logged", response.data);
        return response.data; // retourne un booléen issu de la réponse du endpoint.
    } catch (error) {
        console.error('Erreur lors de la vérification du mot de passe:', error);
        return false;
    }
}

export function isLogged() {
    // Récupérer la valeur de "logged" dans le local storage et la convertir en booléen.
    return localStorage.getItem("logged") === "true";
}