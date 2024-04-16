// Funktion til at hente data fra local storage og vise det på siden
function dataFromMeals() {
    // Henter det dynamiske liste-element fra HTML, hvor måltiderne skal vises
    const dynamicListForMeals = document.getElementById("dynamicMealCreator");
    // Rydder det dynamiske liste-element for tidligere indhold
    dynamicListForMeals.innerHTML = "";

    // Henter måltidsdata fra localStorage gemtMaltider, hvis det findes
    const savedMeals = localStorage.getItem('gemtMaltider');
    if (savedMeals) {
        // Konverterer data fra JSON til et JavaScript-objekt
        const mealsArray = JSON.parse(savedMeals);

        // Itererer gennem hvert måltid
        mealsArray.forEach(meal => {
            // Opretter en container til måltidet
            const containerForTheMeals = document.createElement("div");
            containerForTheMeals.className = "containerForTheMeals";

            // Opretter et element til at vise navnet på måltidet
            const theNameOfTheMealsElement = createDivElement("theMealsName", meal.name);
            containerForTheMeals.appendChild(theNameOfTheMealsElement);

            // Opretter en liste til at vise ingredienserne for hvert måltid
            const ingredientsListForEachFood = document.createElement("ul");
            meal.ingredients.forEach(ingredient => {
                const ingredientItem = document.createElement("li");

                // Opretter et element til at vise navnet på ingrediensen
                const foodNameSpan = createSpanElement(ingredient.foodName);
                ingredientItem.appendChild(foodNameSpan);

                // Tjekker om der er ernæringsoplysninger for ingrediensen og tilføjer det til elementet
                if (ingredient.nutrition) {
                    appendNutritionDetails(ingredient, ingredientItem);
                } else {
                    // Hvis der ikke er nogen ernæringsoplysninger, tilføjes kun mængden af ingrediensen
                    ingredientItem.innerHTML += ` - ${ingredient.quantity} gram`;
                }

                ingredientsListForEachFood.appendChild(ingredientItem);
            });

            containerForTheMeals.appendChild(ingredientsListForEachFood);

// Opretter en knap til at vise/skjule ernæringsoplysninger og ingredienserne
const showNutritionButton = createButton("showNutritionButton", "Vis ernæringsindhold");
// Opretter en variabel til at holde styr på visningstilstanden af ernæringsoplysningerne og ingredienserne
let nutritionVisible = false;
showNutritionButton.addEventListener("click", function () {
    if (nutritionVisible) {
        // Hvis ernæringsoplysningerne og ingredienserne er synlige, skjul dem
        toggleNutritionVisibility(ingredientsListForEachFood, false);
        nutritionVisible = false;
        // Opdater knapteksten
        showNutritionButton.textContent = "Vis ernæringsindhold";
    } else {
        // Hvis ernæringsoplysningerne og ingredienserne er skjulte, vis dem
        toggleNutritionVisibility(ingredientsListForEachFood, true);
        nutritionVisible = true;
        // Opdater knapteksten
        showNutritionButton.textContent = "Skjul ernæringsindhold";
    }
});
containerForTheMeals.appendChild(showNutritionButton);

            // Tilføjer det totale næringsindhold for alle ingredienserne
            appendTotalNutritionValues(ingredientsListForEachFood);

            // Opretter et element til at vise det totale antal ingredienser i måltidet
            const totalIngredientsElement = createDivElement("total-ingredients", `Totale ingredienser: ${meal.ingredients.length}`);
            containerForTheMeals.appendChild(totalIngredientsElement);

            // Opretter en knap til at slette måltidet
            const deleteMealBtn = createButton("deleteButton", "Slet");
            deleteMealBtn.onclick = function () {
                deleteMeal(meal.name);
                // Opdaterer visningen efter sletning af måltidet
                dataFromMeals();
            };
            containerForTheMeals.appendChild(deleteMealBtn);

            // Tilføjer containeren for det aktuelle måltid til den dynamiske liste
            dynamicListForMeals.appendChild(containerForTheMeals);
        });
    }
}


// Funktion til at oprette et div-element med en given klasse og tekstindhold
function createDivElement(className, textContent) {
    const divElement = document.createElement("div");
    divElement.className = className;
    divElement.textContent = textContent;
    return divElement;
}

// Funktion til at oprette et span-element med givet tekstindhold
function createSpanElement(textContent) {
    const spanElement = document.createElement("span");
    spanElement.textContent = textContent;
    return spanElement;
}

// Funktion til at oprette en knap med en given klasse og tekstindhold
function createButton(className, textContent) {
    const button = document.createElement("button");
    button.className = className;
    button.textContent = textContent;
    return button;
}

// Funktion til at tilføje ernæringsoplysninger til en given ingrediens
function appendNutritionDetails(ingredient, element) {
    // Beregner det totale næringsindhold for ingrediensen
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalFiber = 0;

    totalCalories += ingredient.nutrition.calories;
    totalProtein += ingredient.nutrition.protein;
    totalFat += ingredient.nutrition.fat;
    totalFiber += ingredient.nutrition.fiber;

    // Opretter et div-element til at vise ernæringsoplysninger og skjuler det som standard
    const nutritionForEachFood = createDivElement("hidden-nutrition", `
    Gram: ${ingredient.quantity} 
    Næringsindhold:
    Kalorier: ${ingredient.nutrition.calories.toFixed(1)}, 
    Protein: ${ingredient.nutrition.protein.toFixed(1)}, 
    Fedt: ${ingredient.nutrition.fat.toFixed(1)}, 
    Fiber: ${ingredient.nutrition.fiber.toFixed(1)}`);
    element.appendChild(nutritionForEachFood);
    nutritionForEachFood.style.display = "none";
}


function toggleNutritionVisibility(element) {
    const nutritionForEachFood = element.querySelectorAll(".hidden-nutrition");
    nutritionForEachFood.forEach(item => {
        if (item.style.display === "none") {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

// Funktion til at tilføje det totale næringsindhold for alle ingredienserne
function appendTotalNutritionValues(element) {
    // Opretter et listeelement til at vise titlen for det totale næringsindhold
    const totalNutritionTitle = document.createElement("li");
    totalNutritionTitle.textContent = "Det totale næringsindhold:";
    element.appendChild(totalNutritionTitle);

    // Initialiserer variabler til at holde det totale næringsindhold
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalFiber = 0;

    // Itererer gennem alle ingredienserne
    const ingredients = Array.from(element.children);
    ingredients.forEach(ingredient => {
        // Tjekker om ingrediensen har ernæringsoplysninger
        if (ingredient.querySelector(".hidden-nutrition")) {
            // Henter ernæringsoplysningerne og opdaterer de totale næringsværdier
            const nutrition = ingredient.querySelector(".hidden-nutrition").textContent.split("\n");
            nutrition.forEach(n => {
                if (n.includes("Kalorier")) totalCalories += parseFloat(n.split(":")[1].trim());
                if (n.includes("Protein")) totalProtein += parseFloat(n.split(":")[1].trim());
                if (n.includes("Fedt")) totalFat += parseFloat(n.split(":")[1].trim());
                if (n.includes("Fiber")) totalFiber += parseFloat(n.split(":")[1].trim());
            });
        }
    });

    // Opretter et div-element til at vise det totale næringsindhold
    const totalNutritionValues = createDivElement("total-nutrition-values",
        `Kalorier: ${totalCalories.toFixed(1)}, 
        Protein: ${totalProtein.toFixed(1)}, 
        Fedt: ${totalFat.toFixed(1)}, 
        Fiber: ${totalFiber.toFixed(1)}`);
    element.appendChild(totalNutritionValues);
}

// Funktion til at slette et måltid fra local storage
function deleteMeal(theNameOfTheMeals) {
    // Henter gemtMaltider fra localStorage
    const savedMeals = localStorage.getItem('gemtMaltider');

    // Hvis gemtMaltider findes i localStorage
    if (savedMeals) {
        // Konverterer gemtMaltider fra JSON til et JavaScript-objekt
        const mealsArray = JSON.parse(savedMeals);

        // Finder indexet for måltidet med det angivne navn
        const index = mealsArray.findIndex(meal => meal.name === theNameOfTheMeals);

        // Hvis måltidet blev fundet
        if (index !== -1) {
            // Fjerner måltidet fra arrayet
            mealsArray.splice(index, 1);

            // Gemmer det opdaterede array tilbage i localStorage
            localStorage.setItem('gemtMaltider', JSON.stringify(mealsArray));
        }
    }

    // Opdaterer visningen efter sletning af måltidet
    dataFromMeals();
}


// Funktion til at udføre handlinger ved indlæsning af vinduet
window.onload = function () {
    // Viser data for måltiderne ved indlæsning af siden
    dataFromMeals();
};
