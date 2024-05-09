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


//// OPRET BRUGER DER VIRKER /////

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

////  /////////  /////////  /////////  /////////  /////////  /////////  /////////  /////////  /////


// function handleSubmit() {
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;

//     fetch('/create-user', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ username: username, password: password })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if(data.success) {
//             alert('Bruger oprettet! Log venligst ind.');
//             // Optionally clear the form fields
//             document.getElementById('username').value = '';
//             document.getElementById('password').value = '';
//         } else {
//             alert('Error: ' + data.message);
//         }
//     })
//     .catch(error => console.error('Error:', error));
// }

// document.getElementById('userForm').addEventListener('submit', function(event) {
//     event.preventDefault();
//     handleSubmit();
// });

// // Convert to ESM export
// export { handleSubmit };



// function validateUser(username, password) {
//     const usernameIsValid = username.includes('@');
//     const passwordIsLongEnough = password.length >= 10;
//     const passwordHasUpperCase = /[A-Z]/.test(password);

//     return usernameIsValid && passwordIsLongEnough && passwordHasUpperCase;
// }

// module.exports = { createUser, validateUser };


//////////////


// // Define createUser as an exportable function
// export function createUser(username, password, fetchFn = fetch) {
//     return fetchFn('/create-user', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ username, password })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if(data.success) {
//             alert('Bruger oprettet! Log venligst ind.');
//             document.getElementById('username').value = '';
//             document.getElementById('password').value = '';
//         } else {
//             alert('Error: ' + data.message);
//         }
//         return data.success; // This should ideally return a boolean based on the success of the operation
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         return false; // Return false in case of an error
//     });
// }

// // Attach event listener to form submission
// document.getElementById('userForm').addEventListener('submit', function(event) {
//     event.preventDefault();
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;

//     createUser(username, password).then(success => {
//         console.log('Creation success:', success);
//     }).catch(error => {
//         console.error('Creation failed:', error);
//     });
// });














// // Assuming this is in a module like `userValidation.js` that you can import.
// export function validateUserCredentials(username, password) {
//     const usernameValid = username.includes('@');
//     const passwordValid = password.length >= 10 && /[A-Z]/.test(password);
//     return usernameValid && passwordValid;
// }

// // lav bruger
// function userCreationFunction(username, password) {
//     if(!username.includes('@')) {
//         return false;
//     }
//     if(password.length < 10) {
//         return false;
//     }
//     if(password === password.toLowerCase()) {
//         return false;
//     }
//     if(password === password.toUpperCase()) {
//         return false;
//     }
//     if(!/\d/.test(password)) {
//         return false;
//     }
//     return true;
// }


// login.js

// Refactored to be more modular and testable
// function createUser(event, elements, fetchFn) {
//     event.preventDefault();
//     const { usernameInput, passwordInput } = elements;
//     const username = usernameInput.value;
//     const password = passwordInput.value;

//     return fetchFn('/create-user', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username: username, password: password })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             alert('Bruger oprettet! Log venligst ind.');
//             usernameInput.value = '';
//             passwordInput.value = '';
//         } else {
//             alert('Error: ' + data.message);
//         }
//         return data;
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         return error;
//     });
// }

// // Setup function to be called to attach the handler to the form
// function validateUser(formSelector, usernameSelector, passwordSelector, fetchFn = fetch) {
//     const form = document.getElementById(formSelector);
//     const usernameInput = document.getElementById(usernameSelector);
//     const passwordInput = document.getElementById(passwordSelector);
    
//     form.addEventListener('submit', (event) => {
//         createUser(event, { usernameInput, passwordInput }, fetchFn);
//     });
// }

// // This function can be called on page load or when the app initializes
// validateUser('userForm', 'username', 'password');
// module.exports = { createUser, validateUser };
