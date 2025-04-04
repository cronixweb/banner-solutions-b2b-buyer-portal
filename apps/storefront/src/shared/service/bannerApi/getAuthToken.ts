export class ApiService {
    public static async getApiToken(): Promise<string> {
        const cacheKey = 'apiToken';
        const cachedToken = sessionStorage.getItem(cacheKey);

        if (cachedToken) {
            return cachedToken;
        }

        const data = await this.requestForToken();
        if (data && data.token && data.expires) {
            sessionStorage.setItem(cacheKey, data.token);
            return data.token;
        } else {
            throw new Error('Response does not contain token or expires key.');
        }
    }

    private static async requestForToken(): Promise<{ token: string; expires: string } | null> {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            const body = JSON.stringify({
                userName: import.meta.env.VITE_BANNER_API_USER,
                password: import.meta.env.VITE_BANNER_API_PASSWORD,
            });

            console.log('Requesting API token with body:', body);
            
            const response = await fetch('https://testapi2.bannersolutions.com/Authentication/authenticate', {
                method: 'PUT',
                headers,
                body,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to retrieve API token. Status: ${error}`);
        }
    }
}