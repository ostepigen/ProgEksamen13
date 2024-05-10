const apiUrl = '/water-intake';

function getUserLiquids() {
    console.log('Making fetch call to the server');
    fetch(`/water-intaken`)
    //Konveterer json
    .then(response => response.json())
    //Det konveretede objekt bruges til at opdatere brugerens side, så de kan få vist 
        .then(data => {
            console.log('Data hentet fra serveren:', data);

            data.forEach(water => {
                const waterContainer = document.getElementById('liquidList');
                const waterDiv = document.createElement('div');
                waterDiv.classList.add('loggedWater');

                waterDiv.innerHTML = `
                    <p>${water.LiquidName} - ${water.Amount} ml</p>
                    <p>Consumed at:  ${water.IntakeDateTime}</p>
                    <button class="deleteButton" onclick="removeLiquid(this.parentNode, ${water.WaterIntakeId})">Delete</button>
                `;
                waterContainer.appendChild(waterDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching user liquids:', error);
            alert('Failed to fetch liquids for the specified user.');
        });
    }


//Funktion der sletter 
function removeLiquid(element, waterIntakeId) {
    fetch(`/water-intake/${waterIntakeId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Liquid deleted successfully');
            //Fjerner elementet fra siden
            element.parentNode.removeChild(element); 
            console.log(`nr ${waterIntakeId} er lige blevet slettet`);
        } else {
            throw new Error(result.message);
        }
    })
    .catch(error => {
        console.error('Error deleting water intake:', error);
        alert('Failed to delete water intake. Please try again.');
    });
}


function addLiquid() {
    const liquidName = document.getElementById('liquidName').value;
    const amount = document.getElementById('amount').value;

    if (!liquidName || !amount) {
        alert('Please enter both the name of the liquid and the amount.');
        return;
    }

    const newLiquid = {
        liquidName: liquidName,
        amount: amount,
        intakeDateTime: new Date().toISOString()

    };

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLiquid)
    })
        .then(response => {
            if (response.ok) {
                console.log(newLiquid)
                return response.json();
            } else {
                throw new Error('Failed to add liquid intake');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to add liquid intake. Please try again.');
        });
}


document.addEventListener("DOMContentLoaded", function() {
    getUserLiquids();
});

// Go back to mealtracker.html
function goBack() {
    window.location.href = "mealtracker.html";
}





