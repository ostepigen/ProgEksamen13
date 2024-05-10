
// Handle the update profile form submission
document.getElementById('updateForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const weight = document.getElementById('updateWeight').value;
    const age = document.getElementById('updateAge').value;
    const sex = document.getElementById('updateSex').value;

    fetch('/update-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weight: weight, age: age, sex: sex })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            // Instead of alerting, we re-fetch and display the updated info
            fetchAndDisplayUserInfo();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});

// Function to fetch and display user profile information
function fetchAndDisplayUserInfo() {
    fetch('/get-user-info', {
        credentials: 'include' // Required for cookies to be sent
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            // Assuming your user data includes these fields
            const { Username, Weight, Age, Sex } = data.data;
            document.getElementById('updateUsername').value = Username; // If you have an element to show username
            document.getElementById('updateWeight').value = Weight;
            document.getElementById('updateAge').value = Age;
            document.getElementById('updateSex').value = Sex; // Make sure this ID is correct for your select element
        } else {
            console.error('Failed to retrieve user data:', data.message);
        }
    })
    .catch(error => console.error('Error fetching user info:', error));
}

// Call the function to fetch user info when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayUserInfo);

function fetchAndDisplayUserInfo() {
    fetch('/get-user-info', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update current profile details
            document.getElementById('currentUsername').textContent = data.data.Username;
            document.getElementById('currentWeight').textContent = data.data.Weight;
            document.getElementById('currentAge').textContent = data.data.Age;
            document.getElementById('currentSex').textContent = data.data.Sex;

            // Also update the form fields if needed
            document.getElementById('updateWeight').value = data.data.Weight;
            document.getElementById('updateAge').value = data.data.Age;
            // Make sure you select the right option based on the data
            document.querySelector(`#updateSex option[value="${data.data.Sex}"]`).selected = true;
        } else {
            console.error('Failed to retrieve user data:', data.message);
        }
    })
    .catch(error => console.error('Error fetching user info:', error));
}

// Call the function to fetch user info when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayUserInfo);

// Add this event listener for the deleteForm submission
document.getElementById('deleteForm').addEventListener('submit', function(event) {
    event.preventDefault();

    if (confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
        fetch('/delete-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
            // No need to send the username, it's stored in the session
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Profile has been deleted!');
                // Redirect to the login page or any other appropriate action
                window.location.href = '/login.html';
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    }
});