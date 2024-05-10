//Objekt til at gemme data for det måltid brugeren er ved at oprette
let mealData = {
    name: "",
    ingredients: []
};

//Funktion til at søge efter ingredienser 
function searchIngredients() {
    let searchTerm = document.getElementById('searchTerm').value;
    //Forespørgsel til serveren med søgeordet
    fetch(`/${searchTerm}`)
        .then(response => response.json())
        .then(data => {
            let select = document.getElementById('searchResults');
            //Tømmer det man søgte før
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

//Funktion til at tilføje en ingrediens til det måltid brugeren er i gang med at oprette
function submitIngredient() {
    let selectedIngredient = document.getElementById('searchResults').value;
    let quantity = document.getElementById('quantity').value;
    mealData.ingredients.push({ name: selectedIngredient, quantity: quantity });
    updateAddedIngredientsDisplay();
}

//Opdaterer visningen af de tilføjede ingredienser
function updateAddedIngredientsDisplay() {
    let container = document.getElementById('addedIngredients');
    container.innerHTML = '<h3>Added Ingredients:</h3>';
    mealData.ingredients.forEach((ing, index) => {
        let div = document.createElement('div');
        div.textContent = `${ing.quantity} grams of ${ing.name}`;

        //Tilføj en Remove-knap for hver ingrediens, så man kan fjerne den hvis det var en fejl
        let removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        //Kalder funktionen der fjerner ingrediensen 
        removeButton.onclick = function () { removeIngredient(index); };
        div.appendChild(removeButton);

        container.appendChild(div);
    });
}

//Fjerner en specifik ingrediens fra måltidet
function removeIngredient(index) {
    //Fjerner ingrediensen fra arrayet baseret på index
    mealData.ingredients.splice(index, 1);
    //Opdaterer displayet af tilføjede ingredienser
    updateAddedIngredientsDisplay();
}


// Opretter et måltid baseret på brugerens indtastning og valgte ingredienser
function createMeal() {
    //Gemmer inputtet i en variabel
    let mealNameInput = document.getElementById('mealName');
    let mealName = mealNameInput.value.trim();

    //Brugeren skal indtaste navn
    if (!mealName) {
        alert('Please provide a meal name.');
        return;
    }

    //Og der skal være ingredienser i måltidet før det kan blive oprettet
    if (mealData.ingredients.length === 0) {
        alert('Please add at least one ingredient.');
        return;
    }

    let requestBody = {
        mealName: mealName,
        ingredients: mealData.ingredients
    };

    //Sender en POST andmodning til servren 
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

                //Tømmer felterne, så brugeren kan oprette et nyt måltid
                document.getElementById('mealName').value = '';
                document.getElementById('searchTerm').value = '';
                document.getElementById('quantity').value = '';
                document.getElementById('searchResults').innerHTML = '';
                mealData.name = '';
                mealData.ingredients = [];

                //Kalder funktionen der viser de tilføjede ingredienser, så den igen er tom 
                updateAddedIngredientsDisplay();
            } else {
                alert('Failed to create meal: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error creating meal:', error);
        });
}

//Viser oprettede måltider på siden
function addMealToDisplay(mealName, ingredients) {
    let container = document.getElementById('mealDisplayContainer'); 

    
    let mealBox = document.createElement('div');
    mealBox.classList.add('meal-box');

    //Viser navnet på måltidet
    let mealNameElement = document.createElement('h3');
    mealNameElement.textContent = mealName;
    mealBox.appendChild(mealNameElement);

    //Ingredienserne på måltidet 
    let ul = document.createElement('ul');
    ingredients.forEach(ing => {
        let li = document.createElement('li');
        li.textContent = `${ing.quantity} grams of ${ing.name}`;
        ul.appendChild(li);
    });
    mealBox.appendChild(ul);

    //Tilføjer måltidet til boksen
    container.appendChild(mealBox);
}

//Funktion til at søge om information på fødevare
function searchForInformation() {
    let searchTerm = document.getElementById('infoSearchTerm').value;
    fetch(`/search-ingredient-info/${searchTerm}`)
        .then(response => response.json())
        .then(data => {
            let select = document.getElementById('infoSearchResults');
            select.innerHTML = '';
            data.forEach(food => {
                let option = document.createElement('option');
                option.textContent = food.FoodName;
                option.value = food.FoodID;
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
            if (data && data.length > 0) {
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