import { ENTRYPOINT } from '../config/entrypoint';
import axios from 'axios';

const Settings = {
    async loadSettings() {
        try {
            const response = await axios.get(`${ENTRYPOINT}/settings`);
            // Save settings as a JSON string in localStorage
            localStorage.setItem("settings", JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la lecture des settings:', error);
            return null;
        }
    },

    getSettings(param) {
        const settingsStr = localStorage.getItem("settings");
        if (!settingsStr) {
            console.error("Settings not loaded");
            return null;
        }
        const settings = JSON.parse(settingsStr);
        return settings[param];
    }
};

export default Settings;