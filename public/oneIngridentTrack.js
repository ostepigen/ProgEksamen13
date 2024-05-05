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
            quantity: parseInt(weight, 10)
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
                    const ingredientsList = document.getElementById('ingredientsList');
                    const newIngredient = document.createElement('li');
                    newIngredient.textContent = `${ingredientName} - ${weight} grams`;
                    newIngredient.dataset.ingredientId = result.ingredientId; // Assuming the server returns the ID of the newly inserted ingredient
            
                    // Create the delete button
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.onclick = function() {
                        const ingredientId = newIngredient.dataset.ingredientId;
                        fetch(`/api/delete-ingredient/${ingredientId}`, { method: 'DELETE' })
                        .then(response => response.json())
                        .then(delResult => {
                            if (delResult.success) {
                                // Remove the list item from the DOM
                                ingredientsList.removeChild(newIngredient);
                                alert('Ingredient deleted successfully.');
                            } else {
                                throw new Error(delResult.message);
                            }
                        })
                        .catch(error => {
                            console.error('Error deleting ingredient:', error);
                            alert('Failed to delete ingredient. Please try again.');
                        });
                    };
                    
                         // Append the button to the new ingredient element
                    newIngredient.appendChild(deleteBtn);
                    ingredientsList.appendChild(newIngredient);
                } else {
                    throw new Error(result.message);
                }
            });
    }

    // Additional functions unchanged, include them as they are
});





function seeLoggedIngredients() {
    fetch('/api/logged-ingredients')
    .then(response => response.json())
    .then(ingredients => {
        const ingredientsList = document.getElementById('ingredientsList');
        ingredientsList.innerHTML = ''; // Clear existing entries
        ingredients.forEach(ingredient => {
            const ingredientItem = document.createElement('li');
            ingredientItem.textContent = `${ingredient.FoodName || 'Unknown ingredient'} - ${ingredient.Quantity} grams logged on ${new Date(ingredient.LoggedDate).toLocaleString()}`;

            // Add delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = function() {
                fetch(`/api/delete-ingredient/${ingredient.IngredientID}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(delResult => {
                    if (delResult.success) {
                        ingredientsList.removeChild(ingredientItem);
                        alert('Ingredient deleted successfully.');
                    } else {
                        throw new Error(delResult.message);
                    }
                })
                .catch(error => {
                    console.error('Error deleting ingredient:', error);
                    alert('Failed to delete ingredient. Please try again.');
                });
            };

            // Append the delete button to the list item
            ingredientItem.appendChild(deleteBtn);
            ingredientsList.appendChild(ingredientItem);
        });
    })
    .catch(error => {
        console.error('Error fetching logged ingredients:', error);
        alert('Error fetching logged ingredients. Please try again.');
    });
}






// Go back to mealtracker.html
function goBack() {
    window.location.href = "mealtracker.html";
}
