//Funktion er viser de loggede måltider på siden
function seeLoggedMeals() {
    //Get andmodning til serveren der henter de loggede måltider 
    fetch('/api/logged-meals')
        .then(response => response.json())
        .then(meals => {
            //Containeren hvor måltiderne skal vises
            const mealContainer = document.getElementById('loggedMeals');
            mealContainer.innerHTML = '';

            //Loop for hvert måltid og laver html til det
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
                <button onclick="deleteMeal(${meal.mealEatenId})">Delete</button>
            `;
                mealContainer.appendChild(mealDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching logged meals:', error);
        });
}

//Funktion der gør det muligt at opdatere vægt 
function updateMealWeight(mealEatenId) {
    //Henter den nye vægt fra inputfeltet
    const newWeight = document.getElementById(`newWeight${mealEatenId}`).value;
    //Validerer at den indtastede vægt er gyldig
    if (!newWeight || newWeight <= 0) {
        alert('Please enter a valid weight.');
        return;
    }
    //Sender en PATCH-anmodning til serveren for at opdatere vægten af det spiste måltid
    fetch(`/api/update-meal-eaten/${mealEatenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
            // Opdaterer listen for at vise den opdaterede vægt
            seeLoggedMeals();
        })
        .catch(error => {
            console.error('Error updating meal weight:', error);
            alert('Error updating meal weight. Please try again.');
        });
}

//Henter måltider fra serveren og laver en dropdown menu
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
                    option.textContent = meal.MealName;
                    dropdown.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error loading meals:', error);
            alert('Failed to load meals. Please refresh the page.');
        });
}


// Funktion der gemmer med geoloaction
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
            dateTime: new Date().toISOString(),
            location: `${latitude}, ${longitude}`
        };

        fetch('/api/log-meal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
                seeLoggedMeals();
            })
            .catch(error => {
                console.error('Error logging meal:', error);
                alert('Failed to log meal. Please try again.');
            });
    }, () => {
        alert('Geolocation is not supported or permission denied.');
    });
}

//Funktion der sletter et logget måltid
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
            seeLoggedMeals();
        })
        .catch(error => {
            console.error('Error deleting logged meal:', error);
            alert('Error deleting logged meal. Please try again.');
        });
}


window.logMeal = logMeal;

//Når siden er indlæst hentes måltiderne
document.addEventListener("DOMContentLoaded", function () {
    fetchMeals();
    seeLoggedMeals();
});

//Funktion til at vende tilbage til mealtracker.html
function goBack() {
    window.location.href = "mealtracker.html";
}