//Eventlistner til login
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    //Henter brugernavn og kodeord fra input felterne
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    //POST-anmodning til serverens login endpoint
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        //Bruger og kodeord navnet bliver sendt til serveren
        body: JSON.stringify({ username: username, password: password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                //Sender brugeren til profilsiden 
                window.location.href = 'profile.html';
            } else {
                alert('An error occured when logging in: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
});


//// OPRET BRUGER DER VIRKER /////
document.getElementById('userForm').addEventListener('submit', function (event) {
    event.preventDefault();
    //Henter brugernavn og kodeord fra input felterne
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    //POST-anmodning til serverens create-user endpoint
    fetch('/create-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                //Viser succesmeddelelse
                alert('User created! Please log in.');
                //Nustiller felterne
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
});