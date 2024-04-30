document.addEventListener("DOMContentLoaded", function() {
    const searchButton = document.getElementById('searchButton');
    const logButton = document.getElementById('logButton');
    const ingredientInput = document.getElementById('ingredient');
    const searchResults = document.getElementById('searchResults');
    const quantityInput = document.getElementById('quantity');

    console.log("Debug: Elements on page:", {
        searchButton,
        logButton,
        ingredientInput,
        searchResults,
        quantityInput
    });

    searchButton.addEventListener('click', function() {
        searchIngredients();
    });

    logButton.addEventListener('click', function() {
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
            } else {
                throw new Error(result.message);
            }
        })
        .catch(error => {
            console.error('Error logging ingredient:', error);
            alert('Failed to log ingredient. Please try again.');
        });
    }
});
