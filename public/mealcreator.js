// Object to store the current meal data
let mealData = {
    name: "",
    ingredients: []
};
 
// Function to handle searching ingredients
function searchIngredients() {
    let searchTerm = document.getElementById('searchTerm').value;
    fetch(`/${searchTerm}`)
    .then(response => response.json())
    .then(data => {
        let select = document.getElementById('searchResults');
        select.innerHTML = '';
        data.forEach(food => {
            let option = document.createElement('option');
            option.textContent = food.FoodName;
            option.value = food.FoodName;
            select.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching ingredients:', error);
    });
}
 
// Function to submit an ingredient and its quantity
function submitIngredient() {
    let selectedIngredient = document.getElementById('searchResults').value;
    let quantity = document.getElementById('quantity').value;
    mealData.ingredients.push({name: selectedIngredient, quantity: quantity});
    updateAddedIngredientsDisplay();
}
 
// Update the display of added ingredients
function updateAddedIngredientsDisplay() {
    let container = document.getElementById('addedIngredients');
    container.innerHTML = '<h3>Added Ingredients:</h3>';
    mealData.ingredients.forEach(ing => {
        let div = document.createElement('div');
        div.textContent = `${ing.quantity} grams of ${ing.name}`;
        container.appendChild(div);
    });
}
 
function createMeal() {
    // Get user input for meal name
    let mealNameInput = document.getElementById('mealName');
    let mealName = mealNameInput.value.trim();
 
    // Validate meal name
    if (!mealName) {
        alert('Please provide a meal name.');
        return;
    }
 
    // Validate ingredients list
    if (mealData.ingredients.length === 0) {
        alert('Please add at least one ingredient.');
        return;
    }
 
    // Prepare the request body with meal name and ingredients
    let requestBody = {
        mealName: mealName,
        ingredients: mealData.ingredients
    };
 
    // Send the POST request to create the meal
    fetch('/create-meal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Meal created successfully!');
            addMealToDisplay(mealName, mealData.ingredients);
 
            // Clear the inputs for next meal entry
            document.getElementById('mealName').value = '';
            document.getElementById('searchTerm').value = '';
            document.getElementById('quantity').value = '';
            document.getElementById('searchResults').innerHTML = '';
            mealData.name = '';
            mealData.ingredients = []; // Reset the meal data
            updateAddedIngredientsDisplay(); // Update the display of added ingredients
        } else {
            alert('Failed to create meal: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error creating meal:', error);
    });
}
 
function addMealToDisplay(mealName, ingredients) {
    let container = document.getElementById('mealDisplayContainer'); // Ensure this container exists in your HTML
 
    // Create a box to display the meal
    let mealBox = document.createElement('div');
    mealBox.classList.add('meal-box');
 
    // Add meal name
    let mealNameElement = document.createElement('h3');
    mealNameElement.textContent = mealName;
    mealBox.appendChild(mealNameElement);
 
    // List ingredients
    let ul = document.createElement('ul');
    ingredients.forEach(ing => {
        let li = document.createElement('li');
        li.textContent = `${ing.quantity} grams of ${ing.name}`;
        ul.appendChild(li);
    });
    mealBox.appendChild(ul);
 
    // Append the meal box to the container
    container.appendChild(mealBox);
}
// Function to handle searching ingredients for information
function searchForInformation() {
    let searchTerm = document.getElementById('infoSearchTerm').value;
    fetch(`/search-ingredient-info/${searchTerm}`)
    .then(response => response.json())
    .then(data => {
        let select = document.getElementById('infoSearchResults');
        select.innerHTML = ''; // Clear previous entries
        data.forEach(food => {
            let option = document.createElement('option');
            option.textContent = food.FoodName;
            option.value = food.FoodID; // Storing FoodID as value for later retrieval
            select.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching ingredients:', error);
    });
}
 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 
// Function to get information of the selected ingredient from the dropdown
function getIngredientInformation() {
    let selectedFoodID = document.getElementById('infoSearchResults').value;
    fetch(`/get-ingredient-info/${selectedFoodID}`)
    .then(response => response.json())
    .then(data => {
        let container = document.getElementById('ingredientInformation');
        container.innerHTML = ''; // Clear previous information
        if(data && data.length > 0) {
            const info = data[0]; // Assuming the first record is what we want
            container.innerHTML = `
                <p><strong>Name:</strong> ${info.FoodName}</p>
                <p><strong>Food ID:</strong> ${info.FoodID}</p>
                <p><strong>Taxonomic Name:</strong> ${info.TaxonomicName}</p>
                <p><strong>Food Group:</strong> ${info.FoodGroup}</p>
                <p><strong>Kcal:</strong> ${info.KCal} kcal</p>
                <p><strong>Protein:</strong> ${info.Protein}g</p>
                <p><strong>Fat:</strong> ${info.Fat}g</p>
                <p><strong>Fiber:</strong> ${info.Fiber}g</p>
            `;
        } else {
            container.innerHTML = '<p>No information found for selected ingredient.</p>';
        }
    })
    .catch(error => {
        console.error('Error getting ingredient information:', error);
    });
}