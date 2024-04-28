// Define seeLoggedMeals at the top level so it's available globally
function seeLoggedMeals() {
    fetch('/api/logged-meals')
    .then(response => response.json())
    .then(meals => {
        const mealContainer = document.getElementById('loggedMeals');
        mealContainer.innerHTML = ''; // Clear previous entries
        meals.forEach(meal => {
            const mealDiv = document.createElement('div');
            mealDiv.classList.add('loggedMeal');
            mealDiv.innerHTML = `
                <h3>${meal.mealName}</h3>
                <p>Weight: ${meal.weight} grams</p>
                <p>Time: ${new Date(meal.dateTime).toLocaleString()}</p>
            `;
            mealContainer.appendChild(mealDiv);
        });
    })
    .catch(error => {
        console.error('Error fetching logged meals:', error);
    });
}

// This function will fetch meals from the backend and populate the dropdown
function fetchMeals() {
    fetch('/api/meals')
    .then(response => response.json())
    .then(meals => {
        const dropdown = document.getElementById('mealDropdown');
        meals.forEach(meal => {
            const option = document.createElement('option');
            option.value = meal.MealID;
            option.textContent = meal.mealName; // Adjust if your property names differ
            dropdown.appendChild(option);
        });
    });
}

// Function to handle logging of the meal
function logMeal() {
    const mealId = document.getElementById('mealDropdown').value;
    const weight = document.getElementById('mealWeight').value;
    const mealData = {
        mealId: mealId,
        weight: weight,
        dateTime: new Date().toISOString() // ISO string of the current date and time
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
    });
}

// Attach the logMeal function to the window object so it can be called from HTML
window.logMeal = logMeal;

// When DOM is fully loaded, fetch meals and set up the event listeners
document.addEventListener("DOMContentLoaded", function () {
    fetchMeals();
    seeLoggedMeals();
});
