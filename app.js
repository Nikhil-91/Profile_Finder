const http = new Http_Client;

document.querySelector('#input-text').addEventListener('keyup', (e) => {
    const user = document.querySelector('#input-text').value;
    if (e.target.value !== '') {
        http.get(user).then(res => {
            const response = res.profiledata;
            const repo = res.repodata;
            if (response['message'] == 'Not Found') {
                alertMessage('No Profile Found with given UserName', 'danger');
            }
            else {
                let output = `
                <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <div class="row">
                                <div class="col-md-4">
                                    <img src=${response['avatar_url']} alt="Image" class="img-fluid">
                                    <button class="btn btn-primary btn-block my-2 "><a href=${response['html_url']} class="text-white">View Profile</a></button>
                                </div>
                                <div class="col-md-6">
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item"><strong>Name:</strong>  ${response['name']}</li>
                                        <li class="list-group-item"><strong>Public Repos:</strong>  ${response['public_repos']}</li>
                                        <li class="list-group-item"><strong>Public Gists:</strong>  ${response['public_gists']}</li>
                                        <li class="list-group-item"><strong>Followers:</strong>  ${response['followers']}</li>
                                        <li class="list-group-item"><strong>Following:</strong>  ${response['following']}</li>
                                        <li class="list-group-item"><strong>Location:</strong> ${response['location']}</li>
                                        <li class="list-group-item"><strong>Email:</strong> ${response['email']}</li>
                                        <li class="list-group-item"><strong>Create_Date:</strong>  ${response['created_at']}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
           
             <div class="repo_output"></div>
         
                `
                document.querySelector('.output').innerHTML = output;
                let repo_output = ''
                repo.forEach(repo => {
                    repo_output += `
                    <div class="card">
                    <div class="card-body" id="repo">
                    <div class="col-md-12 mb-2">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><a href=${repo['html_url']}>${repo['full_name']}</a>
                            &nbsp&nbsp&nbsp &nbsp<span><strong>Stars:</strong>  ${repo['stargazers_count']}</span>
                            &nbsp&nbsp&nbsp &nbsp<span><strong>Forks:</strong>  ${repo['forks_count']}</span></li>
                        </ul>
                    </div>
                    </div>
                    </div>`
                });
                document.querySelector('.repo_output').innerHTML = repo_output;
            }
        })
    }
    else {
        document.querySelector('.output').innerHTML = '';
    }

})

const alertMessage = function (msg, className) {

    if (document.querySelector('.alert')) {
        document.querySelector('.alert').remove();
    }
    const div = document.createElement('div');
    div.className = `alert alert-${className}`;
    div.textContent = msg;
    const header = document.querySelector('#header');
    document.querySelector('#main-id').insertBefore(div, header);
    clearMessage();
}

const clearMessage = function () {
    setTimeout(() => {
        document.querySelector('.alert').remove();
    }, 2000);
}