document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById('searchButton');
    const logButton = document.getElementById('logButton');
    const ingredientInput = document.getElementById('ingredient');
    const searchResults = document.getElementById('searchResults');
    const quantityInput = document.getElementById('quantity');

    //Event listener til søgeknappen for at aktivere ingredienssøgning
    searchButton.addEventListener('click', function () {
        searchIngredients();
    });

    //Event listener på log-knappen for at aktivere logning af ingrediens
    logButton.addEventListener('click', function () {
        logIngredient();
    });

    //Funktion hvor man kan søge 
    function searchIngredients() {
        const ingredientName = ingredientInput.value.trim();
        if (!ingredientName) {
            alert('Please enter an ingredient name to search.');
            return;
        }

        //Henter fra serveren
        fetch(`/search-ingredient-info/${ingredientName}`)
            .then(response => response.json())
            .then(data => {
                searchResults.innerHTML = '';
                if (data.length > 0) {
                    //Loop igennem hver match, så det kan vises i dropdown
                    data.forEach(item => {
                        let option = document.createElement('option');
                        option.value = item.FoodID;
                        option.textContent = item.FoodName;
                        kalorierData = item.Kcal;
                        searchResults.appendChild(option);

                    });
                    searchResults.disabled = false;
                } else {
                    alert('No ingredients found.');
                    searchResults.disabled = true;
                }
            })
            .catch(error => {
                console.error('Error fetching ingredients:', error);
                alert('Failed to fetch ingredients. Please try again.');
            });
    }

    //Funktion til at logge en ingrediens med den indtastede vægt
    function logIngredient() {
        const foodID = searchResults.value;
        const weight = quantityInput.value;
        const ingredientName = searchResults.options[searchResults.selectedIndex].text;
        //??
        const kalorier = kalorierData


        if (!foodID || weight <= 0) {
            alert('Please select an ingredient and enter a valid weight.');
            return;
        }

        const postData = {
            FoodID: parseInt(foodID, 10),
            quantity: parseInt(weight, 10),
            nameOfIngredient: ingredientName,
            //Ændrer her??
            kalorierGem: (kalorier * weight) / 100
        };
        console.log(postData)


        //Sender POST anmodning til serveren for at logge ingrediensen
        fetch('/api/log-ingredient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Ingredient logged successfully.');
                    addIngredientToList(result.ingredientId, ingredientName, weight, kalorier);
                } else {
                    throw new Error(result.message);
                }
            });
    }


    //Ingrediens vises
    function addIngredientToList(ingredientId, ingredientName, weight) {
        const ingredientsList = document.getElementById('ingredientsList');
        const newIngredient = document.createElement('li');
        newIngredient.textContent = `${ingredientName} - ${weight} grams `;
        newIngredient.dataset.ingredientId = ingredientId;

        //SLet knap
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function () { deleteIngredient(ingredientId); };

        newIngredient.appendChild(deleteButton);
        ingredientsList.appendChild(newIngredient);
    }

    //Funktion til at slette den gemte ingrediens
    function deleteIngredient(ingredientId) {
        console.log("Deleting Ingredient with ID:", ingredientId);
        fetch(`/api/delete-ingredient/${ingredientId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Ingredient deleted successfully');
                    document.querySelector(`[data-ingredient-id="${ingredientId}"]`).remove();
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

    function fetchAndDisplayIngredients() {
        fetch('/api/logged-ingredients')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayIngredients(data.ingredients);
                } else {
                    console.error('No ingredients found or failed to fetch ingredients');
                }
            })
            .catch(error => {
                console.error('Error fetching logged ingredients:', error);
            });
    }

    //Funktion til at få vist gamle loggede ingredienser
    function displayIngredients(ingredients) {
        ingredientsListAlreadyAdded.innerHTML = '';
        ingredients.forEach(ingredient => {
            const ingredientItem = document.createElement('li');
            ingredientItem.textContent = `${ingredient.NameOfIngredient} - ${ingredient.Quantity} grams logged on ${new Date(ingredient.LoggedDate).toLocaleString()}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function () { deleteIngredient(ingredient.IngredientID); };
            deleteButton.classList.add('delete-button');
            ingredientItem.appendChild(deleteButton);
            ingredientsListAlreadyAdded.appendChild(ingredientItem);
        });
    }
    //Funktion til at slette gamle loggede ingredienser
    function deleteIngredient(ingredientId) {
        fetch(`/api/delete-ingredient/${ingredientId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Ingredient deleted successfully');
                    fetchAndDisplayIngredients(); // Refresh the list after deleting
                } else {
                    throw new Error(result.message);
                }
            })
            .catch(error => {
                console.error('Error deleting ingredient:', error);
                alert('Failed to delete ingredient. Please try again.');
            });
    }

    // Fetch and display ingredients when page loads
    fetchAndDisplayIngredients();
});



// Go back to mealtracker.html
function goBack() {
    window.location.href = "mealtracker.html";
}
