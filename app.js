const github = new Github();
const ui = new UI();

const userInput = document.querySelector('#searchUser');

userInput.addEventListener('keyup', (e) => {
    const input_text = e.target.value;

    if (input_text != '') {
        github.getUser(input_text).then(data => {
            if (data.profile.message === 'Not Found') {
                ui.showMessage('UserName not found', 'alert alert-danger');
            } else {
                ui.showProfile(data.profile);
                ui.showRepo(data.repo);
            }
        }).catch(error => console.log(error))

    } else {
        ui.clearProfile();
    }
})