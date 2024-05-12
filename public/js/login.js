// Eventlistener til 'submit' hændelsen på loginformularen
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();  // Stopper standardformularafsending for at håndtere det via JavaScript

    // Henter brugernavn og kodeord fra de tilsvarende inputfelter i formularen
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Sender en POST-anmodning til serveren for at logge ind
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Fortæller serveren at dataene er i JSON-format
        },
        body: JSON.stringify({ username: username, password: password })  // Konverterer brugernavn og kodeord til en streng i JSON-format
    })
        .then(response => response.json())  // Konverterer svaret fra serveren til JSON
        .then(data => {
            if (data.success) {
                // Hvis login er succesfuldt, omdiriger brugeren til profilsiden
                window.location.href = 'profile.html';
            } else {
                // Hvis der opstår en fejl ved login, vis en fejlmeddelelse
                alert('An error occured when logging in: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));  // Logger eventuelle fejl i konsollen
});

// Eventlistener til 'submit' hændelsen på opret bruger-formularen
document.getElementById('userForm').addEventListener('submit', function (event) {
    event.preventDefault();  // Stopper standardformularafsending

    // Henter brugernavn og kodeord fra de tilsvarende inputfelter
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Sender en POST-anmodning til serveren for at oprette en ny bruger
    fetch('/create-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Angiver at data er i JSON-format
        },
        body: JSON.stringify({ username: username, password: password })  // Sender brugernavn og kodeord som JSON
    })
        .then(response => response.json())  // Konverterer serverens svar til JSON
        .then(data => {
            if (data.success) {
                // Viser en besked om at brugeren er oprettet og beder om at logge ind
                alert('User created! Please log in.');
                // Nulstiller inputfelterne
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';
            } else {
                // Viser en fejlmeddelelse hvis der er problemer med brugeroprettelsen
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));  // Logger eventuelle fejl i konsollen
});
