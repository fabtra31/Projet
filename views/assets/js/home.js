let DateTime = luxon.DateTime;


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
    getInvites();
    getOwnedParties();

    setTimeout(async () => {
        setInterval(async () => {
            await getParties();
            await getInvites();
            await getOwnedParties();
        }, interval * 1000);
    }, new_clock.diff(DateTime.now()).toObject().milliseconds);

}

//partie refresh des parties en cours + listage
async function getParties() {
    const table = document.querySelector('#listparties');
    let actualsItems = [];

    for (let index = 0; index < table.children.length; index++) {
        const element = table.children[index];
        actualsItems.push(element.id)
    }
    
    await fetch("/api/list_parties?type=STARTED")
        .then(async response => response.json())
        .then(async result => {

            for (var i = 0; i < result.parties.length; i++) {

                await actualsItems.splice(actualsItems.indexOf(result.parties[i]),1)

                let data = result.parties[i];
                var user1 = {};
                var user2 = {};

                await fetch(`/api/user/${data.J1.id}`)
                    .then(response => response.json())
                    .then(result => user1 = result)
                    .catch(error => console.log('error', error))

                await fetch(`/api/user/${data.J2.id}`)
                    .then(response => response.json())
                    .then(result => user2 = result)
                    .catch(error => console.log('error', error));

                if (document.getElementById(data.id)) {
                    let item = document.getElementById(data.id);
                    item.children[1].innerHTML = user1.username;
                    item.children[2].innerHTML = user2.username;
                    item.children[0].innerHTML = data.round;
                }
                else {
                    let row = document.createElement('tr');
                    row.id = data.id;

                    let dataTable = [data.round, user1.username, user2.username, data.id];

                    dataTable.forEach(element => {
                        let th = document.createElement('th')
                        if (dataTable[dataTable.length - 1] == element) {
                            th.className = "text-end"
                            th.innerHTML = `<a href="/party/${element}" class="btn btn-primary btn-sm">Watch</a>`;
                        } else {
                            th.innerHTML = element;
                        }
                        row.appendChild(th);
                    });
                    table.appendChild(row)
                }

            }
        })
        .catch(error => console.log('error', error));

    await actualsItems.forEach(actualItem => {
        let objet = document.getElementById(actualItem);
        objet.parentNode.removeChild(objet)
    })
//Recupérér les parties en attente

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

}
async function getInvites() {
    const table = document.querySelector('#listInvites');
    let actualsItems = [];

    for (let index = 0; index < table.children.length; index++) {
        const element = table.children[index];
        actualsItems.push(element.id)
    }
    console.log("fetch invits...");
    await fetch("/api/invites")
        .then( response => response.json())
        .then(async result => {
            console.log(result);
            for (var i = 0; i < result.parties.length; i++) {

                await actualsItems.splice(actualsItems.indexOf(result.parties[i]),1)

                let data = result.parties[i];
                var user1 = {};
                console.log(data);
                await fetch(`/api/user/${data.J1.id}`)
                    .then(response => response.json())
                    .then(result => user1 = result)
                    .catch(error => console.log('error', error))

                if (document.getElementById("invite_"+data.id)) {
                    let item = document.getElementById("invte_"+data.id);
                    item.children[1].innerHTML = user1.username;
                    item.children[0].innerHTML = data.round;
                }
                else {
                    let row = document.createElement('tr');
                    row.id = "invte_"+data.id;

                    let dataTable = [data.round, user1.username, data.id];

                    dataTable.forEach(element => {
                        let th = document.createElement('th')
                        if (dataTable[dataTable.length - 1] == element) {
                            th.className = "text-end"
                            th.innerHTML = `<a href="/party/${element}" class="btn btn-primary btn-sm">Accept</a> <a href="/party/${element}" class="btn btn-primary btn-sm">Decline</a>`;
                        } else {
                            th.innerHTML = element;
                        }
                        row.appendChild(th);
                    });
                    table.appendChild(row)
                }

            }
        })
        .catch(error => console.log('error', error));
    await actualsItems.forEach(actualItem => {
        let objet = document.getElementById(actualItem);
        objet.parentNode.removeChild(objet)
    })


}

async function getOwnedParties() {
    const table = document.querySelector('#listmyparties');
    let actualsItems = [];

    for (let index = 0; index < table.children.length; index++) {
        const element = table.children[index];
        actualsItems.push(element.id)
    }
    
    await fetch("/api/myparties")
        .then(async response => response.json())
        .then(async result => {

            for (var i = 0; i < result.parties.length; i++) {

                await actualsItems.splice(actualsItems.indexOf(result.parties[i]),1)

                let data = result.parties[i];
                var user1 = {};
                var user2 = {};

                await fetch(`/api/user/${data.J1.id}`)
                    .then(response => response.json())
                    .then(result => user1 = result)
                    .catch(error => console.log('error', error))

                await fetch(`/api/user/${data.J2.id}`)
                    .then(response => response.json())
                    .then(result => user2 = result)
                    .catch(error => console.log('error', error));

                if (document.getElementById("own_"+data.id)) {
                    let item = document.getElementById("own_"+data.id);
                    item.children[1].innerHTML = user1.username;
                    item.children[2].innerHTML = user2.username;
                    item.children[0].innerHTML = data.round;
                }
                else {
                    let row = document.createElement('tr');
                    row.id = "own_"+data.id;

                    let dataTable = [data.round, user1.username, user2.username, data.id];

                    dataTable.forEach(element => {
                        let th = document.createElement('th')
                        if (dataTable[dataTable.length - 1] == element) {
                            th.className = "text-end"
                            th.innerHTML = `<a href="/api/party/${element}/delete" class="btn btn-primary btn-sm">Delete</a>`;
                        } else {
                            th.innerHTML = element;
                        }
                        row.appendChild(th);
                    });
                    table.appendChild(row)
                }

            }
        })
        .catch(error => console.log('error', error));

    await actualsItems.forEach(actualItem => {
        let objet = document.getElementById(actualItem);
        objet.parentNode.removeChild(objet)
    })


}




