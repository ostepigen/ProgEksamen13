document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById('searchButton');
    const logButton = document.getElementById('logButton');
    const ingredientInput = document.getElementById('ingredient');
    const searchResults = document.getElementById('searchResults');
    const quantityInput = document.getElementById('quantity');

    searchButton.addEventListener('click', function () {
        searchIngredients();
    });

    logButton.addEventListener('click', function () {
        logIngredient();
    });

    function searchIngredients() {
        const ingredientName = ingredientInput.value.trim();
        if (!ingredientName) {
            alert('Please enter an ingredient name to search.');
            return;
        }

        fetch(`/search-ingredient-info/${ingredientName}`)
            .then(response => response.json())
            .then(data => {
                searchResults.innerHTML = '';
                if (data.length > 0) {
                    data.forEach(item => {
                        let option = document.createElement('option');
                        option.value = item.FoodID;
                        option.textContent = item.FoodName;
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

    function logIngredient() {
        const foodID = searchResults.value;
        const weight = quantityInput.value;
        const ingredientName = searchResults.options[searchResults.selectedIndex].text;

        if (!foodID || weight <= 0) {
            alert('Please select an ingredient and enter a valid weight.');
            return;
        }

        const postData = {
            FoodID: parseInt(foodID, 10),
            quantity: parseInt(weight, 10),
            nameOfIngredient: ingredientName
        };

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
                addIngredientToList(result.ingredientId, ingredientName, weight);  // Ensure 'result.ingredientId' is correct
            } else {
                throw new Error(result.message);
            }
        });
    }

    function addIngredientToList(ingredientId, ingredientName, weight) {
        const ingredientsList = document.getElementById('ingredientsList');
        const newIngredient = document.createElement('li');
        newIngredient.textContent = `${ingredientName} - ${weight} grams `;
        newIngredient.dataset.ingredientId = ingredientId;  // Ensure this attribute is correctly set

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() { deleteIngredient(ingredientId); };

        newIngredient.appendChild(deleteButton);
        ingredientsList.appendChild(newIngredient);
    }

    function deleteIngredient(ingredientId) {
        console.log("Deleting Ingredient with ID:", ingredientId);  // Log to ensure the ID is correct
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

    function displayIngredients(ingredients) {
        ingredientsListAlreadyAdded.innerHTML = ''; // Clear the list first
        ingredients.forEach(ingredient => {
            const ingredientItem = document.createElement('li');
            ingredientItem.textContent = `${ingredient.NameOfIngredient} - ${ingredient.Quantity} grams logged on ${new Date(ingredient.LoggedDate).toLocaleString()}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function() { deleteIngredient(ingredient.IngredientID); };
            deleteButton.classList.add('delete-button'); // Add class for optional styling

            ingredientItem.appendChild(deleteButton);
            ingredientsListAlreadyAdded.appendChild(ingredientItem);
        });
    }

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
