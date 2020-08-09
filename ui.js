class UI {
    constructor() {
        this.profile = document.querySelector('.profile-result');
    }

    showProfile(profile) {
        this.profile.innerHTML = `
        <div class="container my-2"> 
        <div class="card card-body mb-3">
        <div class="row">
            <div class="col-md-3">
                <img src="${profile.avatar_url}" alt="" class="img-fluid mb-2">
                <a href="${profile.html_url}" class="btn btn-primary btn-block mb-2" target="_blank">View Profile</a>
            </div>
            <div class="col-md-9">
                <span class="badge badge-primary">Public Repos: ${profile.public_repos}</span>
                <span class="badge badge-secondary">Public Gists: ${profile.public_gists}</span>
                <span class="badge badge-success">Followers: ${profile.followers}</span>
                <span class="badge badge-info">Following: ${profile.following}</span>
                <br><br>
                <ul class="list-group">
                    <li class="list-group-item">Company: ${profile.company}</li>
                    <li class="list-group-item">Website/Blog: ${profile.blog}</li>
                    <li class="list-group-item">Location: ${profile.location}</li>
                    <li class="list-group-item">Member Since: ${profile.created_at}</li>
                </ul>
            </div>
        </div>
    </div> 
    <h3 class="page-heading mb-3">Latest Repos</h3>
    <div id="repos"></div>
    </div> 

        `;
    }

    showRepo(repos) {
        let repo = document.querySelector('#repos');
        let output = '';
        repos.forEach(repo => {
            output += `
            <div class="card card-body mb-2">
        <div class="row">
            <div class="col-md-6">
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
            </div>
            <div class="col-md-6">
            <span class="badge badge-primary">Watchers: ${repo.watchers_count}</span>
            <span class="badge badge-secondary">Stars: ${repo.stargazers_count}</span>
            <span class="badge badge-success">Forks: ${repo.forks_count}</span>
            </div>
        </div>
    </div>
            `
        });
        repo.innerHTML = output;
    }

    clearProfile() {
        this.profile.innerHTML = '';
    }

    showMessage(msg, className) {
        this.clearMessage();
        const div = document.createElement('div');
        div.className = className;
        div.appendChild(document.createTextNode(msg));
        document.querySelector('.SearchContainer').insertBefore(div, document.querySelector('.search'));
        setTimeout(function () {
            document.querySelector('.alert').remove();
        }, 2000)
    }

    clearMessage() {
        if (document.querySelector('.alert')) {
            document.querySelector('.alert').remove();
        }
    }
}