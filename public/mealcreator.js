//Orginale kode
// Object to store the current meal data
let mealData = {
    name: "",
    ingredients: []
};

function addIngredientEntry() {
    const container = document.getElementById('ingredientEntryContainer');
    const newEntryDiv = document.createElement('div');
    newEntryDiv.className = 'ingredientEntry';
    newEntryDiv.innerHTML = `
        <input type="text" placeholder="Type to search ingredients..." class="ingredientInput">
        <button onclick="searchIngredients(this.parentElement)">Search Ingredients</button>
        <select class="ingredientSelect">
            <option>Select an ingredient</option>
        </select>
        <input type="number" placeholder="Enter quantity (grams)" class="ingredientQuantity">
        <button onclick="addIngredientToMeal(this.parentElement)">Add Ingredient</button>
    `;
    container.appendChild(newEntryDiv);
}

function searchIngredients(parentDiv) {
    const ingredient = parentDiv.querySelector('.ingredientInput').value;
    if (!ingredient) {
        alert("Please enter an ingredient to search.");
        return;
    }

    const foods = fetch("localhost:3001/" + ingredient)
    .then(response => response.json())
    
    fetch(`/api/FoodItems/BySearch/${encodeURIComponent(ingredient)}`)
        .then(response => response.json())
        .then(results => {
            const select = parentDiv.querySelector('.ingredientSelect');
            select.innerHTML = '';
            results.forEach(item => {
                const option = document.createElement('option');
                option.value = item.FoodID;
                option.textContent = item.FoodName;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error retrieving ingredients:", error);
            alert("Failed to fetch ingredients.");
        });
}

// // når man trykker create meal, sender den request til serveren, som så opretter måltidet i databasen

function createMeal() {
    mealData.name = document.getElementById('mealName').value.trim();

    if (!mealData.name || mealData.ingredients.length === 0) {
        alert("Please provide a meal name and add at least one ingredient.");
        return;
    }

    let totalCalories = 0, totalProtein = 0, totalFat = 0, totalFiber = 0;
    mealData.ingredients.forEach(ingredient => {
        totalCalories += ingredient.nutrition.calories;
        totalProtein += ingredient.nutrition.protein;
        totalFat += ingredient.nutrition.fat;
        totalFiber += ingredient.nutrition.fiber;
    });

    fetch('/create-meal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            mealName: mealData.name,
            ingredients: mealData.ingredients.map(ing => ({
                FoodID: ing.foodID,
                Quantity: ing.quantity
            })),
            totalCalories,
            totalProtein,
            totalFat,
            totalFiber
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            mealData = { name: "", ingredients: [] };
            document.getElementById('mealName').value = '';
            updateIngredientList();
        }
    })
    .catch(error => {
        console.error('Error creating meal:', error);
        alert('Failed to create meal.');
    });
}

// Function to add the ingredient to a visual list and mealData object
function addIngredientToMeal(parentDiv) {
    const select = parentDiv.querySelector('.ingredientSelect');
    const foodID = select.value;
    const foodName = select.options[select.selectedIndex].text;
    const quantity = parentDiv.querySelector('.ingredientQuantity').value;

    if (!foodID || !quantity) {
        alert("Please select an ingredient and specify the quantity.");
        return;
    }

    mealData.ingredients.push({
        foodID: parseInt(foodID),  // Make sure to parse IDs as integers
        foodName,
        quantity: parseFloat(quantity)  // Ensure quantities are handled as numbers
    });

    updateIngredientList();  // Call this function to update the visible list
    alert("Ingredient added successfully!");
}

// Function to display the list of added ingredients
function updateIngredientList() {
    const ingredientListElement = document.getElementById("dynamicMealCreator");
    ingredientListElement.innerHTML = "";  // Clear the current list

    // Add each ingredient as a list item
    mealData.ingredients.forEach((ing, index) => {
        const detail = document.createElement('div');
        detail.textContent = `${ing.foodName} - ${ing.quantity} grams`;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = function() {
            mealData.ingredients.splice(index, 1);  // Remove the ingredient from mealData
            updateIngredientList();  // Update the list again to reflect the removal
        };
        detail.appendChild(removeBtn);
        ingredientListElement.appendChild(detail);
    });
}

// ... (The rest of your mealcreator.js functions)

// Function to handle meal creation
function createMeal() {
    const mealName = document.getElementById('mealName').value.trim();
    if (!mealName) {
        alert("Please provide a meal name.");
        return;
    }
    if (mealData.ingredients.length === 0) {
        alert("Please add at least one ingredient.");
        return;
    }

    // POST the meal data to the server
    fetch('/create-meal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            mealName: mealName,
            ingredients: mealData.ingredients
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Show success or error message from server
        if (data.success) {
            mealData = { name: "", ingredients: [] }; // Reset mealData for a new meal
            document.getElementById('mealName').value = ''; // Clear the meal name input
            updateIngredientList(); // Update the list to clear it
        }
    })
    .catch(error => {
        console.error('Error creating meal:', error);
        alert('Failed to create meal.');
    });
}

// Ensure to call this function on window load or after the DOM is fully built
window.onload = function() {
    addIngredientEntry();  // Add the first ingredient input on load
    // ... any other onload functionalities
};

// Function to handle searching ingredients
function searchIngredients() {
    let searchTerm = document.getElementById('searchTerm').value;
    fetch(`/${searchTerm}`)
    .then(response => response.json())
    .then(data => {
        let select = document.getElementById('searchResults');
        if (!select) {
            select = document.createElement('select');
            select.id = 'searchResults';
            select.style.width = "300px";
            select.style.maxHeight = "150px";
            select.style.overflowY = "auto";
            document.body.appendChild(select);
        }
        console.log(data);

        select.innerHTML = '';
        data.slice(0, 50).forEach(food => {
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

function addIngredient() {
    const select = document.getElementById('submit');
    const quantityInput = document.getElementById('quantity');
    if (!select.selectedOptions.length || !quantityInput.value) {
        alert('Please select an ingredient and enter the quantity.');
        return;
    }

    const ingredient = select.value;
    const quantity = quantityInput.value;

    // Use fetch to submit ingredient and quantity to the server and handle the response
    fetch(`/submit?ingredient=${encodeURIComponent(ingredient)}`)
        .then(response => response.json())  // Convert the response to JSON
        .then(data => {
            // Assume data contains an array of objects with macro names and values
            const nutrientsArray = data.map(item => ({
                name: item.macroName,
                value: item.value
            }));
            console.log('Nutrients:', nutrientsArray);
            console.log('Submitting:', { ingredient, quantity });
        })
        .catch(error => console.error('Fetch error:', error));
}

    // Optionally, send the data to a server or another function
    // fetch('/submitIngredient', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ ingredient, quantity }),
    // })
    // .then(response => response.json())
    // .then(result => console.log('Submission successful:', result))
    // .catch(error => console.error('Error submitting ingredient:', error));






// function addIngredientToMeal(parentDiv) {
    //     const select = parentDiv.querySelector('.ingredientSelect');
    //     const foodID = select.value;
    //     const foodName = select.options[select.selectedIndex].text;
    //     const quantity = parentDiv.querySelector('.ingredientQuantity').value;
    
    //     if (!foodID || !quantity) {
    //         alert("Please select an ingredient and specify the quantity.");
    //         return;
    //     }
    
    //     nutritionValuesFromAPI(foodID, quantity).then(nutritionValues => {
    //         mealData.ingredients.push({
    //             foodID,
    //             foodName,
    //             quantity,
    //             nutrition: nutritionValues
    //         });
    //         updateIngredientList();
    //         alert("Ingredient added successfully!");
    //     }).catch(error => {
    //         console.error("Error adding ingredient:", error);
    //     });
    // }
    
    // function updateIngredientList() {
    //     const container = document.getElementById("dynamicMealCreator");
    //     container.innerHTML = "";
    //     mealData.ingredients.forEach(ing => {
    //         const detail = document.createElement('div');
    //         detail.textContent = `${ing.foodName} - ${ing.quantity} grams (Calories: ${ing.nutrition.calories.toFixed(2)}, Protein: ${ing.nutrition.protein.toFixed(2)}, Fat: ${ing.nutrition.fat.toFixed(2)}, Fiber: ${ing.nutrition.fiber.toFixed(2)})`;
    //         container.appendChild(detail);
    //     });
    // }
    
    // window.onload = function() {
    //     addIngredientEntry();  // Add the first ingredient input on load
    // };