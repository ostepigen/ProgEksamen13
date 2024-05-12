// Funktion, der viser de logget måltider på hjemmesiden
function seeLoggedMeals() {
    // Sender en GET-forespørgsel til serveren for at hente de logget måltider
    fetch('/api/logged-meals')
        .then(response => response.json())
        .then(meals => {
            // Finder HTML-elementet, hvor måltider skal vises
            const mealContainer = document.getElementById('loggedMeals');
            mealContainer.innerHTML = '';  // Fjerner tidligere indhold

            // Laver et nyt HTML-element for hvert måltid og tilføjer det til siden
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
                mealContainer.appendChild(mealDiv);  // Tilføjer det nye element til containeren
            });
        })
        .catch(error => {
            console.error('Error fetching logged meals:', error); 
        });
}

// Funktion der tillader opdatering af vægt for et logget måltid
function updateMealWeight(mealEatenId) {
    const newWeight = document.getElementById(`newWeight${mealEatenId}`).value;  // Henter den nye vægt fra inputfeltet
    if (!newWeight || newWeight <= 0) {
        alert('Please enter a valid weight.');  
        return;
    }
    // Sender en PATCH-forespørgsel for at opdatere vægten på serveren
    fetch(`/api/update-meal-eaten/${mealEatenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newWeight: newWeight })  // Sender den nye vægt som JSON
    })
        .then(response => {
            if (response.ok) {
                return response.json();  // Håndterer svaret fra serveren
            } else {
                throw new Error('Failed to update meal weight'); 
            }
        })
        .then(data => {
            alert('Meal weight updated successfully');  
            seeLoggedMeals();  // Opdaterer visningen af logget måltider
        })
        .catch(error => {
            console.error('Error updating meal weight:', error); 
            alert('Error updating meal weight. Please try again.'); 
        });
}

// Funktion, der henter måltider fra serveren og viser dem i en dropdown menu
function fetchMeals() {
    fetch('/api/meals')
        .then(response => response.json())  // Konverterer serverens svar til JSON-format
        .then(meals => {
            const dropdown = document.getElementById('mealDropdown');
            dropdown.innerHTML = '';  // Fjerner tidligere måltider fra dropdown-menuen
            if (meals.length === 0) {
                let option = document.createElement('option');
                option.textContent = "No meals available";  
                dropdown.appendChild(option);
            } else {
                meals.forEach(meal => {
                    let option = document.createElement('option');
                    option.value = meal.MealID;
                    option.textContent = meal.MealName;
                    dropdown.appendChild(option);  // Tilføjer hvert måltid til dropdown-menuen
                });
            }
        })
        .catch(error => {
            console.error('Error loading meals:', error); 
            alert('Failed to load meals. Please refresh the page.'); 
        });
}

// Funktion, der logger et måltid med geolocation-data
function logMeal() {
    const mealId = document.getElementById('mealDropdown').value;  // Henter valgt måltid-id fra dropdown-menuen
    const weight = document.getElementById('mealWeight').value;  // Henter indtastet vægt

    if (!weight || weight <= 0) {
        alert('Please enter a valid weight.'); 
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;  // Henter geolocation-data
        const mealData = {
            mealId: mealId,
            weight: weight,
            dateTime: new Date().toISOString(),
            location: `${latitude}, ${longitude}`
        };

        fetch('/api/log-meal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mealData)  // Sender måltidsdata til serveren
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
                seeLoggedMeals();  // Opdaterer listen over logget måltider
            })
            .catch(error => {
                console.error('Error logging meal:', error); 
                alert('Failed to log meal. Please try again.');  // Viser en fejlmeddelelse
            });
    }, () => {
        alert('Geolocation is not supported or permission denied.'); 
    });
}

// Funktion, der sletter et logget måltid
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
            seeLoggedMeals();  // Opdaterer listen over logget måltider
        })
        .catch(error => {
            console.error('Error deleting logged meal:', error); 
            alert('Error deleting logged meal. Please try again.'); 
        });
}

window.logMeal = logMeal;  // Gør funktionen 'logMeal' globalt tilgængelig

// Udfører funktionerne 'fetchMeals' og 'seeLoggedMeals' når dokumentet er indlæst
document.addEventListener("DOMContentLoaded", function () {
    fetchMeals();
    seeLoggedMeals();
});

function goBack() {
    window.location.href = "mealtracker.html"; 
}
