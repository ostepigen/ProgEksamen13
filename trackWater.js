// Funktion til at fjerne en væske fra listen og fra localStorage
function removeLiquid(item) {
    var itemName = item.firstChild.textContent.split(' - ')[0]; // Henter væskens navn

    // Fjerner listeelementet fra DOM'en
    item.parentNode.removeChild(item);

    // Fjerner væsken fra localStorage
    var trackedWater = JSON.parse(localStorage.getItem('trackedWater')) || [];
    trackedWater = trackedWater.filter(function(liquid) {
        return liquid.name !== itemName;
    });
    localStorage.setItem('trackedWater', JSON.stringify(trackedWater));
}

// Funktion til at tilføje en væske til listen
function addLiquid() {
    // Henter værdierne fra inputfelterne
    var liquidName = document.getElementById('liquidName').value;
    var amount = document.getElementById('amount').value;
    var currentDateTime = new Date().toLocaleString(); // Henter den aktuelle dato og tidspunkt

    // Opretter et nyt listeelement
    var listItem = document.createElement('li');
    listItem.textContent = liquidName + ' - ' + amount + ' ml (' + currentDateTime + ')';

    // Opretter slet-knap-elementet
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Slet';
    deleteButton.id = 'sletKnap'; 
    deleteButton.onclick = function() {
        removeLiquid(this.parentNode); // Kald funktionen for at fjerne væsken
    };

    // Tilføjer slet-knap til listeelementet
    listItem.appendChild(deleteButton);

    // Tilføjer listeelementet til listen
    document.getElementById('liquidList').appendChild(listItem);

    // Gemmer væsken i localStorage
    var trackedWater = JSON.parse(localStorage.getItem('trackedWater')) || [];
    trackedWater.push({ name: liquidName, amount: amount, datetime: currentDateTime }); // Gemmer både dato og tid
    localStorage.setItem('trackedWater', JSON.stringify(trackedWater));
}


// Funktion til at initialisere listen fra localStorage
function initializeList() {
    var trackedWater = JSON.parse(localStorage.getItem('trackedWater')) || [];
    var liquidList = document.getElementById('liquidList');

    // Tilføjer hver væske fra localStorage til listen
    trackedWater.forEach(function(liquid) {
        var listItem = document.createElement('li');
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Slet';
        deleteButton.onclick = function() {
            removeLiquid(this.parentNode); // Kalder funktionen for at fjerne væsken
        };
        var displayDateTime = liquid.datetime || new Date().toLocaleString(); // Hvis datoen mangler, bruges den aktuelle dato og tidspunkt
        listItem.textContent = liquid.name + ' - ' + liquid.amount + ' ml (' + displayDateTime + ')';
        listItem.appendChild(deleteButton);
        liquidList.appendChild(listItem);
    });
}

// Kalder initialiseringsfunktionen, når siden indlæses
initializeList();

// Funktion til at gå tilbage til mealcreator.html
function goBack() {
    window.location.href = "mealtracker.html";
}
