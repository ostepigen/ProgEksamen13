document.getElementById('updateForm').addEventListener('submit', function (event) {
    event.preventDefault();  

    // Indsamler data fra inputfelterne i formularen
    const weight = document.getElementById('updateWeight').value;
    const age = document.getElementById('updateAge').value;
    const sex = document.getElementById('updateSex').value;

    // Sender en POST-anmodning til serveren med den indtastede data
    fetch('/update-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Fortæller serveren, at data er i JSON-format
        },
        body: JSON.stringify({ weight: weight, age: age, sex: sex })  // Omdanner data til en JSON-streng
    })
        .then(response => response.json())  // Parser serverens respons til JSON
        .then(data => {
            if (data.success) {
                // Opdaterer og viser den opdaterede brugerinfo
                fetchAndDisplayUserInfo();
            } else {
                alert('Error: ' + data.message);  
            }
        })
        .catch(error => console.error('Error:', error));  
});

// Funktion til at hente og vise brugerinformation
function fetchAndDisplayUserInfo() {
    fetch('/get-user-info', {
        credentials: 'include'  
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Opdaterer formularfelterne med den hentede brugerdata
                document.getElementById('currentUsername').textContent = data.data.Username;
                document.getElementById('currentWeight').textContent = data.data.Weight;
                document.getElementById('currentAge').textContent = data.data.Age;
                document.getElementById('currentSex').textContent = data.data.Sex;

                document.getElementById('updateWeight').value = data.data.Weight;
                document.getElementById('updateAge').value = data.data.Age;

                // Markerer den korrekte kønsoption som valgt
                document.querySelector(`#updateSex option[value="${data.data.Sex}"]`).selected = true;
            } else {
                console.error('Failed to retrieve user data:', data.message);  
            }
        })
        .catch(error => console.error('Error fetching user info:', error)); 
}

// Kalder funktionen til at hente brugerinfo, når siden indlæses
document.addEventListener('DOMContentLoaded', fetchAndDisplayUserInfo);

// Tilføjer en lytter til 'submit'-hændelsen for sletteformularen
document.getElementById('deleteForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Bekræfter om brugeren virkelig ønsker at slette sin profil
    if (confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
        fetch('/delete-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Profile has been deleted!');  
                window.location.href = '/profile.html';  
            } else {
                alert('Error: ' + data.message); 
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error: Could not delete profile');  
        });
    }
});
