async function searchFoodAndDisplayNutrition() {
    // Hent fødevarenavnet fra inputfeltet og fjern eventuelle ekstra mellemrum
    const foodName = document.getElementById("searchInput").value.trim();

    // Hvis inputfeltet er tomt, vis en advarsel og afslut funktionen
    if (foodName === "") {
        alert("Indtast venligst en fødevare.");
        return;
    }

    // API-nøgle til at foretage forespørgsler til Nutrimon API
    const apiKey = "170832";

    // URL til at søge efter fødevare baseret på navn
    const searchUrl = `https://nutrimonapi.azurewebsites.net/api/FoodItems/BySearch/${foodName}`;

    try {
        // Foretag en GET-forespørgsel for at søge efter fødevaren
        const searchData = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        });

        // Konverter svaret til JSON-format
        const searchDataJson = await searchData.json();

        // Hvis der er fundet resultater
        if (searchDataJson && searchDataJson.length > 0) {
            // Hent ID'et for den første fundne fødevare
            const foodId = searchDataJson[0].foodID;

            // Definer endpoints for at hente specifik ernæringsoplysninger
            const endpoints = ["1030", "1310", "1240", "1110", "1010", "1230", "1620", "1610"];
            // Definer et objekt med etiketter til de forskellige ernæringsoplysninger
            const nutritionalLabels = {
                "1030": "Kalorier",
                "1310": "Fedt",
                "1240": "Fiber",
                "1110": "Protein",
                "1010": "kJ",
                "1230": "Kulhydrater",
                "1620": "Vand",
                "1610": "Tørstof"
            };

            // Find resultatdiv'en og fjern tidligere resultater
            const resultDiv = document.getElementById("results");
            resultDiv.innerHTML = "";

            // Tilføj overskrift med fødevarenavn
            const heading = document.createElement("h2");
            heading.textContent = `Næringsindhold i ${foodName}`;
            resultDiv.appendChild(heading);

            // For hver endpoint, hent de relevante ernæringsoplysninger og tilføj dem til resultatdiv'en
            for (const endpoint of endpoints) {
                const nutritionUrl = `https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodId}/BySortKey/${endpoint}`;

                const nutritionData = await fetch(nutritionUrl, {
                    method: 'GET',
                    headers: {
                        'X-API-Key': apiKey,
                    },
                });

                const nutritionDataJson = await nutritionData.json();

                const relevantEntry = nutritionDataJson.find(entry => entry.sortKey === parseInt(endpoint));
                let resVal = relevantEntry ? relevantEntry.resVal : 'N/A';

                // Formatér ernæringsværdien til at have én decimal
                resVal = parseFloat(resVal).toFixed(1);

                const nutritionalValue = nutritionalLabels[endpoint];
                const nutritionItem = document.createElement("p");
                nutritionItem.textContent = `${nutritionalValue}: ${resVal}`;
                resultDiv.appendChild(nutritionItem);
            }
        } else {
            // Hvis der ikke blev fundet nogen fødevare, vis en besked
            const resultDiv = document.getElementById("results");
            resultDiv.textContent = "Ingen fødevare fundet.";
        }
    } catch (error) {
        console.error("Fejl under hentning af data:", error);
    }
}

// Funktion til at gå tilbage til måltidskreatoren
function goBack() {
    window.location.href = "mealcreator.html";
}

