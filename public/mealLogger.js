// Define seeLoggedMeals at the top level so it's available globally
function seeLoggedMeals() {
    fetch('/api/logged-meals')
    .then(response => response.json())
    .then(meals => {
        const mealContainer = document.getElementById('loggedMeals');
        mealContainer.innerHTML = '';
        meals.forEach(meal => {
            const mealDiv = document.createElement('div');
            mealDiv.classList.add('loggedMeal');
            mealDiv.innerHTML = `
                <h3>${meal.mealName}</h3>
                <p>Original Weight: ${meal.weight} grams</p>
                <p>Time: ${new Date(meal.dateTime).toLocaleString()}</p>
                <p>Location: ${meal.location || 'Not available'}</p>
                <input type="number" id="newWeight${meal.mealEatenId}" placeholder="Enter new weight" />
                <button onclick="updateMealWeight(${meal.mealEatenId})">Update Weight</button>
            `;
            mealContainer.appendChild(mealDiv);
        });
    })
    .catch(error => {
        console.error('Error fetching logged meals:', error);
    });
}

function updateMealWeight(mealEatenId) {
    const newWeight = document.getElementById(`newWeight${mealEatenId}`).value;
    if (!newWeight || newWeight <= 0) {
        alert('Please enter a valid weight.');
        return;
    }

    fetch(`/api/update-meal-eaten/${mealEatenId}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ newWeight: newWeight })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to update meal weight');
        }
    })
    .then(data => {
        alert('Meal weight updated successfully');
        seeLoggedMeals(); // Refresh the list to show the updated weight
    })
    .catch(error => {
        console.error('Error updating meal weight:', error);
        alert('Error updating meal weight. Please try again.');
    });
}






// This function will fetch meals from the backend and populate the dropdown
function fetchMeals() {
    fetch('/api/meals')
    .then(response => response.json())
    .then(meals => {
        const dropdown = document.getElementById('mealDropdown');
        dropdown.innerHTML = ''; // Clear previous entries
        if (meals.length === 0) {
            let option = document.createElement('option');
            option.textContent = "No meals available";
            dropdown.appendChild(option);
        } else {
            meals.forEach(meal => {
                let option = document.createElement('option');
                option.value = meal.MealID;
                option.textContent = meal.MealName; // Ensure correct property name
                dropdown.appendChild(option);
            });
        }
    })
    .catch(error => {
        console.error('Error loading meals:', error);
        alert('Failed to load meals. Please refresh the page.');
    });
}


// Function to handle logging of the meal with geolocation
function logMeal() {
    const mealId = document.getElementById('mealDropdown').value;
    const weight = document.getElementById('mealWeight').value;

    if (!weight || weight <= 0) {
        alert('Please enter a valid weight.');
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        const mealData = {
            mealId: mealId,
            weight: weight,
            dateTime: new Date().toISOString(), // ISO string of the current date and time
            location: `${latitude}, ${longitude}` // Storing location as a string
        };

        fetch('/api/log-meal', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(mealData)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(data => {
            console.log('Meal logged:', data);
            seeLoggedMeals(); // Refresh the list of logged meals
        })
        .catch(error => {
            console.error('Error logging meal:', error);
            alert('Failed to log meal. Please try again.');
        });
    }, () => {
        alert('Geolocation is not supported or permission denied.');
    });
}

// Function to delete a logged meal
function deleteMeal(mealEatenId) {
    fetch(`/api/delete-meal-eaten/${mealEatenId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to delete logged meal');
        }
    })
    .then(data => {
        alert('Logged meal deleted successfully');
        seeLoggedMeals(); // Refresh the list of logged meals
    })
    .catch(error => {
        console.error('Error deleting logged meal:', error);
        alert('Error deleting logged meal. Please try again.');
    });
}




// Attach the logMeal function to the window object so it can be called from HTML
window.logMeal = logMeal;

// When DOM is fully loaded, fetch meals and set up the event listeners
document.addEventListener("DOMContentLoaded", function () {
    fetchMeals();
    seeLoggedMeals();
});


// VISER SPECIFIK ADDRESSE, HVOR MÅLTID ER LAVET I STEDET FOR LAT/LONG KOORDINATER

// // Function to handle logging of the meal with geolocation and reverse geocoding
// function logMeal() {
//     const mealId = document.getElementById('mealDropdown').value;
//     const weight = document.getElementById('mealWeight').value;

//     if (!weight || weight <= 0) {
//         alert('Please enter a valid weight.');
//         return;
//     }

//     navigator.geolocation.getCurrentPosition(position => {
//         const { latitude, longitude } = position.coords;

//         // Fetch the street address using reverse geocoding
//         fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
//             headers: {
//                 'User-Agent': 'NutriTrackerWebApp' // Change this to your application's name and email/contact
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             const location = data.address.road || `${latitude}, ${longitude}`; // Use road name if available, else use coordinates

//             const mealData = {
//                 mealId: mealId,
//                 weight: weight,
//                 dateTime: new Date().toISOString(),
//                 location: location
//             };

//             return fetch('/api/log-meal', {
//                 method: 'POST',
//                 headers: {'Content-Type': 'application/json'},
//                 body: JSON.stringify(mealData)
//             });
//         })
//         .then(response => {
//             if (response.ok) {
//                 return response.json();
//             } else {
//                 throw new Error('Network response was not ok.');
//             }
//         })
//         .then(data => {
//             console.log('Meal logged:', data);
//             seeLoggedMeals(); // Refresh the list of logged meals
//         })
//         .catch(error => {
//             console.error('Error logging meal or fetching location:', error);
//             alert('Failed to log meal or fetch location. Please try again.');
//         });
//     }, () => {
//         alert('Geolocation is not supported or permission denied.');
//     });
// }
