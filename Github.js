class Github {
    constructor() {
        this.client_id = '';
        this.client_secret_id = '';
        this.per_page = 5;
        this.sort = 'created : asc';
    }

    async getUser(username) {
        const profileResponse = await fetch(`https://api.github.com/users/${username}?client_id=${this.client_id}&client_secret=${this.client_secret_id}`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
        });
        const repoResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=${this.per_page}&sort=${this.sort}&client_id=${this.client_id}&client_secret=${this.client_secret_id}`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
        });

        const profile = await profileResponse.json();
        const repo = await repoResponse.json();

        return {
            profile,
            repo
        }
    }
}

