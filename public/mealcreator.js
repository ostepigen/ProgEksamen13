// // Function to fetch food ID from your own server, based on ingredient
// async function fetchFoodIdFromAPI(ingredient) {
//     try {
//         const response = await fetch(`/api/FoodItems/BySearch/${encodeURIComponent(ingredient)}`);
//         const result = await response.json();

//         if (result.length > 0) {
//             currentFood = {
//                 foodID: result[0].FoodID,
//                 foodName: result[0].FoodName
//             };
//             return currentFood.foodID;
//         } else {
//             throw new Error("Your desired ingredient was not found");
//         }
//     } catch (error) {
//         throw new Error("Error retrieving food ID.");
//     }
// }

// // Function to fetch nutritional values from your server, based on food ID and quantity
// async function nutritionValuesFromAPI(foodID, quantity) {
//     const sortKeys = [1030, 1110, 1310, 1240]; // Update these keys based on your actual data
//     let nutritionValues = { calories: 0, protein: 0, fat: 0, fiber: 0 };

//     for (const sortKey of sortKeys) {
//         try {
//             const response = await fetch(`/api/FoodCompSpecs/ByItem/${foodID}/BySortKey/${sortKey}`);
//             const result = await response.json();

//             if (result.length > 0) {
//                 const valuePer100g = parseFloat(result[0].NutritionValue);
//                 const value = valuePer100g * (quantity / 100);
//                 switch (sortKey) {
//                     case 1030: nutritionValues.calories += value; break;
//                     case 1110: nutritionValues.protein += value; break;
//                     case 1310: nutritionValues.fat += value; break;
//                     case 1240: nutritionValues.fiber += value; break;
//                 }
//             }
//         } catch (error) {
//             console.error(`Error fetching nutrition values for sortKey ${sortKey}:`, error);
//             throw new Error(`Error fetching nutrition values.`);
//         }
//     }
//     return nutritionValues;
// }

// // Function to create a new ingredient and add it to the meal
// function newIngredientAddedToMeal() {
//     const mealName = document.getElementById("mealName").value;
//     const ingredient = document.getElementById("ingredient").value;
//     const quantity = document.getElementById("quantity").value;

//     if (!mealName || !ingredient || !quantity) {
//         alert("You must fill out all fields.");
//         return;
//     }

//     mealData.name = mealName;

//     fetchFoodIdFromAPI(ingredient)
//         .then(foodID => nutritionValuesFromAPI(foodID, quantity))
//         .then(nutritionValues => {
//             mealData.ingredients.push({
//                 foodID: currentFood.foodID,
//                 foodName: currentFood.foodName,
//                 quantity,
//                 nutrition: nutritionValues
//             });
//             ingredientListForMeals();
//         })
//         .catch(error => {
//             alert(error.message);
//         });

//     document.getElementById("ingredient").value = "";
//     document.getElementById("quantity").value = "";
// }

// // Function to display the ingredient list for the meal
// function ingredientListForMeals() {
//     const ingredientListElement = document.getElementById("ingredientListForMeals");
//     ingredientListElement.innerHTML = "";

//     mealData.ingredients.forEach(({ foodName, quantity, nutrition }) => {
//         const listItem = document.createElement("li");
//         listItem.textContent = `${foodName} - ${quantity} grams 
//         (Calories: ${nutrition.calories.toFixed(2)}, 
//         Protein: ${nutrition.protein.toFixed(2)}, 
//         Fat: ${nutrition.fat.toFixed(2)}, 
//         Fiber: ${nutrition.fiber.toFixed(2)})`;
//         ingredientListElement.appendChild(listItem);
//     });
// }

// // Function to handle new meal creation
// function newMealCreated() {
//     if (mealData.ingredients.length === 0) {
//         alert("At least one ingredient must be entered.");
//         return;
//     }

//     let savedMeals = localStorage.getItem('savedMeals');
//     if (!savedMeals) {
//         savedMeals = [];
//     } else {
//         savedMeals = JSON.parse(savedMeals);
//     }

//     savedMeals.push(mealData);
//     localStorage.setItem('savedMeals', JSON.stringify(savedMeals));

//     mealData = { name: "", ingredients: [] };
//     ingredientListForMeals();
//     document.getElementById("mealName").value = "";
//     window.location.href = "mealcreator.html";
// }

// // Load meal data on window load
// window.onload = function () {
//     dataFromMeals();
// };

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

function addIngredientToMeal(parentDiv) {
    const select = parentDiv.querySelector('.ingredientSelect');
    const foodID = select.value;
    const foodName = select.options[select.selectedIndex].text;
    const quantity = parentDiv.querySelector('.ingredientQuantity').value;

    if (!foodID || !quantity) {
        alert("Please select an ingredient and specify the quantity.");
        return;
    }

    nutritionValuesFromAPI(foodID, quantity).then(nutritionValues => {
        mealData.ingredients.push({
            foodID,
            foodName,
            quantity,
            nutrition: nutritionValues
        });
        updateIngredientList();
        alert("Ingredient added successfully!");
    }).catch(error => {
        console.error("Error adding ingredient:", error);
    });
}

function updateIngredientList() {
    const container = document.getElementById("dynamicMealCreator");
    container.innerHTML = "";
    mealData.ingredients.forEach(ing => {
        const detail = document.createElement('div');
        detail.textContent = `${ing.foodName} - ${ing.quantity} grams (Calories: ${ing.nutrition.calories.toFixed(2)}, Protein: ${ing.nutrition.protein.toFixed(2)}, Fat: ${ing.nutrition.fat.toFixed(2)}, Fiber: ${ing.nutrition.fiber.toFixed(2)})`;
        container.appendChild(detail);
    });
}

window.onload = function() {
    addIngredientEntry();  // Add the first ingredient input on load
};

// når man trykker create meal, sender den request til serveren, som så opretter måltidet i databasen
function createMeal() {
    mealData.name = document.getElementById('mealName').value.trim();

    // Remove any empty ingredient entries
    mealData.ingredients = mealData.ingredients.filter(ingredient => ingredient.foodID && ingredient.quantity);

    if (!mealData.name || mealData.ingredients.length === 0) {
        alert("Please provide a meal name and add at least one ingredient.");
        return;
    }

    // POST the meal data to the server
    fetch('/create-meal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            mealName: mealData.name,
            ingredients: mealData.ingredients.map(ing => ({ FoodID: ing.foodID, Quantity: ing.quantity })) // Adjust property names as per your database schema
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Show success or error message from server
        if (data.success) {
            mealData = { name: "", ingredients: [] }; // Reset for new meal creation
            document.getElementById('mealName').value = ''; // Clear meal name input
            updateIngredientList(); // Clear the list of added ingredients
        }
    })
    .catch(error => {
        console.error('Error creating meal:', error);
        alert('Failed to create meal.');
    });
}

// ... (Other parts of your mealcreator.js)

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
