// API nøgle og URL til API'en
const apiKey = "170832";
const apiUrl = "https://nutrimonapi.azurewebsites.net/api";

// Objekt til at gemme måltidsdata
let mealData = {
    name: "",
    ingredients: []
};

// Variabel til at gemme det aktuelle mad
let currentFood = null;

// Funktion til at hente brugerens placering
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    resolve({ latitude, longitude });
                },
                error => {
                    reject(error);
                }
            );
        } else {
            reject(new Error("Geolocation is not supported by your browser."));
        }
    });
}

// Kald getUserLocation() når siden indlæses
window.addEventListener('load', () => {
    getUserLocation()
        .then(location => {
            console.log('User location:', location);
        })
        .catch(error => {
            console.error('Error getting user location:', error.message);
        });
});


// Funktion til at tilføje en ny ingrediens til måltidet
async function newIngredientAddedToMeal() {
     // Få brugerens placering
    let userLocation;
    try {
        userLocation = await getUserLocation();
    } catch (error) {
        alert("Error getting user's location: " + error.message);
        return;
    }

    // Få aktuel dato og tid
    const currentDate = new Date();
    const formattedDateTime = currentDate.toLocaleString('en-GB'); // Change locale as per requirement

    // Henter værdier fra inputfelter
    const ingredient = document.getElementById("ingredient").value;
    const quantity = document.getElementById("quantity").value;

    // Tjekker om alle felter er udfyldt
    if (!ingredient || !quantity) {
        alert("You must fill out all fields.");
        return;
    }

    // Hent mad-ID og ernæringsværdier for ingrediensen
    try {
        const foodID = await fetchFoodIdFromAPI(ingredient);
        const nutritionValues = await nutritionValuesFromAPI(foodID, quantity);

        // Tilføj ingrediens til måltidsdata
        const ingredientId = Date.now();
        mealData.name = ingredient;
        mealData.ingredients.push({
            id: ingredientId,
            name: ingredient,
            foodID: currentFood.foodID,
            foodName: currentFood.foodName,
            quantity,
            nutrition: nutritionValues,
            location: userLocation, // Include user's location
            datetime: formattedDateTime // Include date and time
        });

        // Gem måltidsdata i localStorage
        const loggedMeals = JSON.parse(localStorage.getItem("loggedMaltider")) || [];
        loggedMeals.push(mealData);
        localStorage.setItem("loggedMaltider", JSON.stringify(loggedMeals));

        // Opdater ingredienslistevisning
        ingrediensListForMeals();
    } catch (error) {
        alert(error.message);
    }

    // Nulstil inputfelter
    document.getElementById("ingredient").value = "";
    document.getElementById("quantity").value = "";
}

// Funktion til at hente mad-ID fra API baseret på ingrediens
async function fetchFoodIdFromAPI(ingredient) {
    try {
        const response = await fetch(`${apiUrl}/FoodItems/BySearch/${encodeURIComponent(ingredient)}`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        });
        const result = await response.json();

        if (result.length > 0) {
            currentFood = {
                foodID: result[0].foodID,
                foodName: result[0].foodName
            };
            return currentFood.foodID;
        } else {
            throw new Error("Your desired ingredient was not found");
        }
    } catch (error) {
        throw new Error("Error occurred while fetching foodID.");
    }
}

// Funktion til at hente ernæringsværdier fra API baseret på mad-ID og mængde
async function nutritionValuesFromAPI(foodID, quantity) {
    // Sorteringsnøgler for forskellige ernæringsværdier
    const sortKeys = [1030, 1110, 1310, 1240];
    // Forskellige ernæringsværdier
    let nutritionValues = { calories: 0, protein: 0, fat: 0, fiber: 0 };

    // Gennemgå sortKeys for at hente ernæringsværdier for hver nøgle
    for (const sortKey of sortKeys) {
        try {
            const response = await fetch(`${apiUrl}/FoodCompSpecs/ByItem/${foodID}/BySortKey/${sortKey}`, {
                method: 'GET',
                headers: {
                    'X-API-Key': apiKey,
                },
            });
            const result = await response.json();

            // Hvis resultatet ikke er tomt, beregn ernæringsværdi
            if (result.length > 0) {
                const valuePer100g = parseFloat(result[0].resVal.replace(',', '.'));
                const value = valuePer100g * (quantity / 100);
                switch (sortKey) {
                    case 1030:
                        nutritionValues.calories += value;
                        break;
                    case 1110:
                        nutritionValues.protein += value;
                        break;
                    case 1310:
                        nutritionValues.fat += value;
                        break;
                    case 1240:
                        nutritionValues.fiber += value;
                        break;
                    default:
                        break;
                }
            }
        } catch (error) {
            console.error(`Error fetching nutrition values for sortKey ${sortKey}:`, error);
            throw new Error(`Error fetching nutrition values for sortKey ${sortKey}. Please check console for details.`);
        }
    }

    return nutritionValues;
}

// Funktion til at vise ingredienslisten for måltidet
function ingrediensListForMeals() {
    // Find HTML-elementet til at vise ingredienslisten
    const ingrediensListForMeals = document.getElementById("ingrediensListForMeals");
    // Nulstil listen
    ingrediensListForMeals.innerHTML = "";

    // Tilføj hver ingrediens til listen
    mealData.ingredients.forEach(({ foodName, quantity, nutrition, datetime }) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${foodName} - ${quantity} grams 
        (Kalorier: ${nutrition.calories.toFixed(2)}, 
        Protein: ${nutrition.protein.toFixed(2)}, 
        Fedt: ${nutrition.fat.toFixed(2)}, 
        Fiber: ${nutrition.fiber.toFixed(2)})
        Date & Time: ${datetime}`;
        ingrediensListForMeals.appendChild(listItem);
    });

    // Laver en knap, hvor man kan tilføje til MEal Tracker
const addButton = document.createElement("button");
addButton.textContent = "Tilføj til Meal Tracker";
addButton.classList.add("add-to-tracker-button"); // Tilføjer en klasse til knappen
addButton.addEventListener("click", goBack);
ingrediensListForMeals.appendChild(addButton);

}


// Funktion til at gå tilbage til mealcreator.html
function goBack() {
    window.location.href = "mealtracker.html";
}
