document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById('searchButton');
    const logButton = document.getElementById('logButton');
    const ingredientInput = document.getElementById('ingredient');
    const searchResults = document.getElementById('searchResults');
    const quantityInput = document.getElementById('quantity');

    // Tilføjer en event listener til søgeknappen for at aktivere søgning efter ingredienser
    searchButton.addEventListener('click', function () {
        searchIngredients();
    });

    // Tilføjer en event listener til log-knappen for at aktivere logning af en ingrediens
    logButton.addEventListener('click', function () {
        logIngredient();
    });

    // Funktion til at søge efter ingredienser i en database
    function searchIngredients() {
        const ingredientName = ingredientInput.value.trim(); 
        if (!ingredientName) {
            alert('Please enter an ingredient name to search.');
            return;
        }

        // Udfører en HTTP GET-anmodning for at søge efter ingredienser
        fetch(`/search-ingredient-info/${ingredientName}`)
            .then(response => response.json()) // Konverterer svaret til JSON
            .then(data => {
                searchResults.innerHTML = ''; // Nulstiller søgeresultater
                if (data.length > 0) {
                    data.forEach(item => {
                        let option = document.createElement('option'); 
                        option.value = item.FoodID;
                        option.textContent = item.FoodName;
                        kalorierData = item.Kcal;
                        searchResults.appendChild(option); 
                    });
                    searchResults.disabled = false; // Aktiver dropdown
                } else {
                    alert('No ingredients found.'); 
                    searchResults.disabled = true; // Deaktiver dropdown
                }
            })
            .catch(error => {
                console.error('Error fetching ingredients:', error); 
                alert('Failed to fetch ingredients. Please try again.'); 
            });
    }

    // Funktion til at logge en valgt ingrediens med angivet vægt
    function logIngredient() {
        const foodID = searchResults.value;
        const weight = quantityInput.value;
        const ingredientName = searchResults.options[searchResults.selectedIndex].text;
        const calories = kalorierData; 

        if (!foodID || weight <= 0) {
            alert('Please select an ingredient and enter a valid weight.'); 
            return;
        }

        const postData = { // Opretter dataobjekt
            FoodID: parseInt(foodID, 10),
            quantity: parseInt(weight, 10),
            nameOfIngredient: ingredientName,
            kalorierGem: (calories * weight) / 100 // Beregner kalorier baseret på vægt
        };
        console.log(postData);

        // Sender en POST-anmodning for at logge ingrediensen
        fetch('/api/log-ingredient', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Ingredient logged successfully.'); 
                    addIngredientToList(result.ingredientId, ingredientName, weight, calories); // Tilføjer ingrediensen til listen
                } else {
                    throw new Error(result.message);
                }
            });
    }

    // Viser den nyligt loggede ingrediens i en liste på siden
    function addIngredientToList(ingredientId, ingredientName, weight) {
        const ingredientsList = document.getElementById('ingredientsList');
        const newIngredient = document.createElement('li');
        newIngredient.textContent = `${ingredientName} - ${weight} grams`; // Sætter tekst for ingrediens
        newIngredient.dataset.ingredientId = ingredientId; 

        const deleteButton = document.createElement('button'); 
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function () { deleteIngredient(ingredientId); }; // Tilføjer slet-funktionalitet

        newIngredient.appendChild(deleteButton); 
        ingredientsList.appendChild(newIngredient);
    }

    // Funktion til at slette en ingrediens
    function deleteIngredient(ingredientId) {
        fetch(`/api/delete-ingredient/${ingredientId}`, { method: 'DELETE' }) 
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Ingredient deleted successfully'); 
                    document.querySelector(`[data-ingredient-id="${ingredientId}"]`).remove(); // Fjerner element fra siden
                } else {
                    throw new Error(result.message);
                }
            })
            .catch(error => {
                console.error('Error deleting ingredient:', error); 
                alert('Failed to delete ingredient. Please try again.'); 
            });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const ingredientsListAlreadyAdded = document.getElementById('ingredientsListAlreadyAdded');

    // Henter og viser allerede loggede ingredienser
    function fetchAndDisplayIngredients() {
        fetch('/api/logged-ingredients')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayIngredients(data.ingredients); // Viser ingredienser
                } else {
                    console.error('No ingredients found or failed to fetch ingredients'); 
                }
            })
            .catch(error => {
                console.error('Error fetching logged ingredients:', error); 
            });
    }

    // Funktion til at vise gamle loggede ingredienser
    function displayIngredients(ingredients) {
        ingredientsListAlreadyAdded.innerHTML = ''; 
        ingredients.forEach(ingredient => {
            const ingredientItem = document.createElement('li');
            ingredientItem.textContent = `${ingredient.NameOfIngredient} - ${ingredient.Quantity} grams logged on ${new Date(ingredient.LoggedDate).toLocaleString()}`;

            const deleteButton = document.createElement('button'); 
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function () { deleteIngredient(ingredient.IngredientID); }; // Tilføjer slet-funktionalitet
            deleteButton.classList.add('delete-button'); 
            ingredientItem.appendChild(deleteButton); 
            ingredientsListAlreadyAdded.appendChild(ingredientItem); 
        });
    }

    // Funktion til at slette gamle loggede ingredienser
    function deleteIngredient(ingredientId) {
        fetch(`/api/delete-ingredient/${ingredientId}`, { method: 'DELETE' }) 
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Ingredient deleted successfully');
                    fetchAndDisplayIngredients(); // Opdaterer listen efter sletning
                } else {
                    throw new Error(result.message); 
                }
            })
            .catch(error => {
                console.error('Error deleting ingredient:', error); 
                alert('Failed to delete ingredient. Please try again.'); 
            });
    }

    fetchAndDisplayIngredients(); // Udfører funktionen ved indlæsning af siden
});

function goBack() {
    window.location.href = "mealtracker.html"; 
}
