class Http_Client {
    constructor() {
        this.client_id = '';
        this.client_secret_id = '';
        this.per_page = 5;
        this.sort = 'created : asc';
    }

    async get(user) {
        const profileResponse = await fetch(`https://api.github.com/users/${user}?client_id=${this.client_id}&client_secret=${this.client_secret_id}`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
        });
        const profiledata = await profileResponse.json();

        const repoResponse = await fetch(`https://api.github.com/users/${user}/repos?per_page=${this.per_page}&sort=${this.sort}&client_id=${this.client_id}&client_secret=${this.client_secret_id}`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
        });
        const repodata = await repoResponse.json();
        console.log(repodata);

        return {
            profiledata,
            repodata
        };
    }
}