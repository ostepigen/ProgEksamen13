
document.getElementById('updateForm').addEventListener('submit', function (event) {
    event.preventDefault();

    //Indsamler brugerdata fra formularfelterne
    const weight = document.getElementById('updateWeight').value;
    const age = document.getElementById('updateAge').value;
    const sex = document.getElementById('updateSex').value;

    //Sender en POST anmodning til serveren med den indtastede data
    fetch('/update-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weight: weight, age: age, sex: sex })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                //Genindlæser og viser opdateret brugerinfo, hvis opdateringen lykkedes
                fetchAndDisplayUserInfo();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
});

//Funktion til at hente og vise brugerinformation hvor brugren kan ændre
function fetchAndDisplayUserInfo() {
    fetch('/get-user-info', {
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                //Opdaterer formularfelterne med den hentede brugerdata
                const { Username, Weight, Age, Sex } = data.data;
                document.getElementById('updateUsername').value = Username;
                document.getElementById('updateWeight').value = Weight;
                document.getElementById('updateAge').value = Age;
                document.getElementById('updateSex').value = Sex;
            } else {
                console.error('Failed to retrieve user data:', data.message);
            }
        })
        .catch(error => console.error('Error fetching user info:', error));
}

//Kalder funktionen til at hente brugerinfo, når siden indlæses
document.addEventListener('DOMContentLoaded', fetchAndDisplayUserInfo);

//Viser brugrens info 
function fetchAndDisplayUserInfo() {
    fetch('/get-user-info', {
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {

                document.getElementById('currentUsername').textContent = data.data.Username;
                document.getElementById('currentWeight').textContent = data.data.Weight;
                document.getElementById('currentAge').textContent = data.data.Age;
                document.getElementById('currentSex').textContent = data.data.Sex;


                document.getElementById('updateWeight').value = data.data.Weight;
                document.getElementById('updateAge').value = data.data.Age;

                document.querySelector(`#updateSex option[value="${data.data.Sex}"]`).selected = true;
            } else {
                console.error('Failed to retrieve user data:', data.message);
            }
        })
        .catch(error => console.error('Error fetching user info:', error));
}


document.addEventListener('DOMContentLoaded', fetchAndDisplayUserInfo);

//Gør det muligt for brugren at slette sin profil
document.getElementById('deleteForm').addEventListener('submit', function (event) {
    event.preventDefault();

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
                window.location.href = '/profile.html'; // Ensure correct redirection
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
