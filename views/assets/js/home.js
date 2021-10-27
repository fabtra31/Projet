const DateTime = luxon.DateTime;


//Partie timer INTO refresh page
if (window.location.pathname.startsWith("/home")) {
    const interval = 15;
    const stopTime = [0, 15, 30, 45]

    let now = DateTime.now();
    let checkTimer = stopTime.find(t => {
        t >= now.second;
    });
    let second_time = 0;
    if (checkTimer) {
        second_time = checkTimer
    }
    else {
        second_time = stopTime[0]
    }
    let parameters = {};
    if (second_time == 0) {
        parameters.minutes = now.minute + 1;
        parameters.seconds = 0;
    }
    else {
        parameters.seconds = second_time;
    }

    let new_clock = DateTime.now().set(parameters);
    getParties();

    setTimeout(async () => {
        setInterval(async () => {
            await getParties();
        }, interval * 1000);
    }, new_clock.diff(DateTime.now()).toObject().milliseconds);

}

//partie refresh des parties en cours + listage
async function getParties() {

    fetch("/api/list_parties?type=STARTED")
        .then(response => response.json())
        .then(result => {
            var table = document.querySelector('table');
            for (var i = 0; i < result.length; i++) {

                var child = result[i];
                
                var row = table.insertRow();
                Object.keys(child).forEach(function (k) {
                    console.log(k);
                    var cell = row.insertCell();
                    cell.appendChild(document.createTextNode(child[k]));
                })
            }
        })
        .catch(error => console.log('error', error));
}


//Liste adversaires
if (document.querySelector("#opposant")) {
    fetch("/api/list_users?no_owner=true")
        .then(response => response.json())
        .then(result => {
            result.users.forEach(user => {
                let option = document.createElement("option")
                option.value = user.id;
                option.innerHTML = user.username;
                document.querySelector("#opposant").appendChild(option);
            })
        })
        .catch(error => console.log('error', error));
}
