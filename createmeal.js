const apiKey = "170832";
const apiUrl = "https://nutrimonapi.azurewebsites.net/api";

// Objekt til at gemme måltidsdata
let mealData = {
    name: "",
    ingredients: []
};

// Variabel til at holde den aktuelle fødevare
let currentFood = null;

// Funktion til at hente fødevare-ID fra API'en baseret på ingrediens
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
            throw new Error("Din ønskede ingrediens blev ikke fundet");
        }
    } catch (error) {
        throw new Error("Fejl fundet ved indhentning af foodID.");
    }
}

// Funktion til at hente ernæringsværdier fra API'en baseret på fødevare-ID og mængde
async function nutritionValuesFromAPI(foodID, quantity) {
    // Sorteringsnøgler for de forskellige ernæringsværdier
    const sortKeys = [1030, 1110, 1310, 1240];
       // De forskellige ernæringsværdier
    let nutritionValues = { calories: 0, protein: 0, fat: 0, fiber: 0 };

    // Itererer gennem sortKeys for at hente ernæringsværdierne for hver nøgle
    for (const sortKey of sortKeys) {
        try {
            const response = await fetch(`${apiUrl}/FoodCompSpecs/ByItem/${foodID}/BySortKey/${sortKey}`, {
                method: 'GET',
                headers: {
                    'X-API-Key': apiKey,
                },
            });
            const result = await response.json();

            // Hvis resultet er ikke-tom, beregnes ernæringsværdien
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

// Funktion til at tilføje en ny ingrediens til måltidet
function newIngredientAddedToMeal() {
    const mealName = document.getElementById("mealName").value;
    const ingredient = document.getElementById("ingredient").value;
    const quantity = document.getElementById("quantity").value;

    if (!mealName || !ingredient || !quantity) {
        alert("Du skal udfylde alle felterne.");
        return;
    }

    mealData.name = mealName;

    fetchFoodIdFromAPI(ingredient)
        .then(foodID => nutritionValuesFromAPI(foodID, quantity))
        .then(nutritionValues => {
            mealData.ingredients.push({
                foodID: currentFood.foodID,
                foodName: currentFood.foodName,
                quantity,
                nutrition: nutritionValues
            });
            ingrediensListForMeals();
        })
        .catch(error => {
            alert(error.message);
        });

    document.getElementById("ingredient").value = "";
    document.getElementById("quantity").value = "";
}

// Funktion til at vise ingredienslisten for måltidet
function ingrediensListForMeals() {
    // Find HTML-elementet til visning af ingredienslisten
    const ingrediensListForMeals = document.getElementById("ingrediensListForMeals");
    // Nulstiller listen
    ingrediensListForMeals.innerHTML = "";

    // Tilføj hver ingrediens til listen
    mealData.ingredients.forEach(({ foodName, quantity, nutrition }) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${foodName} - ${quantity} grams 
        (Kalorier: ${nutrition.calories.toFixed(2)}, 
        Protein: ${nutrition.protein.toFixed(2)}, 
        Fedt: ${nutrition.fat.toFixed(2)}, 
        Fiber: ${nutrition.fiber.toFixed(2)})`;
        ingrediensListForMeals.appendChild(listItem);
    });
}

// Funktion til at gå tilbage til mealcreator.html
function goBack() {
    window.location.href = "mealcreator.html";
}

// Funktion til at oprette et nyt måltid
function newMealCreated() {
    // Tjek om mindst én ingrediens er tilføjet
    if (mealData.ingredients.length === 0) {
        alert("Du skal mindst indtaste 1 ingrediens");
        return;
    }

    // Check if gemtMaltider exists in localStorage, if not create it
    let savedMeals = localStorage.getItem('gemtMaltider');
    if (!savedMeals) {
        savedMeals = [];
    } else {
        savedMeals = JSON.parse(savedMeals);
    }

    // Add the current meal data to the array
    savedMeals.push(mealData);

    // Save the updated array back to localStorage
    localStorage.setItem('gemtMaltider', JSON.stringify(savedMeals));

    // Nulstil måltidsdata
    mealData = { name: "", ingredients: [] };

    // Opdater visningen af ingredienslisten
    ingrediensListForMeals();

    // Nulstil inputfelterne
    document.getElementById("mealName").value = "";

    // Gå tilbage til mealcreator.html
    window.location.href = "mealcreator.html";
}






