document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            window.location.href = 'profile.html'; // Redirect to the profile page
        } else {
            alert('Fejl ved login: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});


// lav bruger
document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/create-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            alert('Bruger oprettet! Log venligst ind.');
            // Optionally clear the form fields
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});
