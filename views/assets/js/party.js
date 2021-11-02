let DateTime = luxon.DateTime;

const gameID = window.location.href.split("/")[window.location.href.split("/").length - 1];
const ConfigTimer = {
    miseTimer: 30,
    showResult: 10,
    showWinners: 10
}

let oldStates = "";
const actionAEffectue = [null, null];

if (window.location.pathname.startsWith("/party")) {
    getParty();

    const interval = 2;
    const validTime = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58];

    let next_time = DateTime.now();
    let check = validTime.find(t => t >= next_time.second);
    let cloak_time = (check) ? check : validTime[0];

    let params = {};
    if (cloak_time == 0) {
        params.minutes = next_time.minute + 1;
        params.seconds = 0;
    } else {
        params.seconds = cloak_time;
    }
    let new_time = DateTime.now().set(params);



    setTimeout(async () => {
        setInterval(async () => {

            if (isPlayer) {

                await sendHeartbeat();

            }
            await getParty();




        }, interval * 1000);
    }, new_time.diff(DateTime.now()).toObject().milliseconds)

}

async function getParty() {
    await fetch(`/api/party/${gameID}`)
        .then(async res => res.json())
        .then(async data => {
            console.log(data);
            document.getElementById("table-game").children[0].children[0].children[5].innerHTML = "🟥"

            if (data.event == "wait") {

                document.getElementById("bar").style.display = "none";
                document.getElementById("inputFields").style.display = "none";


                // if (!data.player_one.connected) {
                //     document.getElementById("infoJ1").children[0].chidren[0].children[0].innerHTML = "❌";
                // } else {
                //     document.getElementById("infoJ1").children[0].chidren[0].innerHTML = "✔";
                // }

                // if (!data.player_two.connected) {
                //     document.getElementById("infoJ2").children[5].innerHTML = "❌";
                // } else {
                //     document.getElementById("infoJ2").children[5].innerHTML = "✔";
                // }

                console.log(!data.player_one.connected || !data.player_one.connected);

                if (!data.player_one.connected || !data.player_two.connected) {
                    document.getElementById("info").children[4].innerHTML = "<b>En attente des joueurs</b>";
                }
            }
            else if (data.event == "starting") {
                let timer = setInterval(function () {
                    let now = DateTime.now();
                    let end = DateTime.fromJSDate(new Date(data.next_event))
                    let time = end.diff(now, 'seconds').toObject().seconds;

                    if (time.toFixed(0) == 0) {
                        document.getElementById("info").children[4].innerHTML = `<b>Round ${data.round}</b><br>0 S`;
                        clearInterval(timer);
                    } else {
                        document.getElementById("info").children[4].innerHTML = `<b>Démarrage de la partie</b><br>${time.toFixed(0)} S`;
                    }
                }, 1000)
            }
            else if (game.event == "startRound") {
                await Game.findByIdAndUpdate(game._id, {
                    'J1.bet': 0,
                    'J2.bet': 0,
                    event: "wait_endRound"
                })

            }

            async function sendHeartbeat() {

                await fetch(`/api/party/${gameID}/heartbeat`, { method: 'POST' })
                    .then(res => res.json())
                    .then(data => { })
                    .catch(err => location.reload())
            }
        })
}

document.getElementById("buttonJ1").addEventListener("click", async () => {
    if (isPlayer && data.player_one.id == user) {
        if (!document.getElementById("J1bet").value) return;
        document.getElementById("J1bet").disabled = true;
        document.getElementById("J1bet").disabled = true;

        console.log(document.getElementById("J1bet").value);
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        await fetch(`/api/game/${gameID}/secretNumber`, {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify({ nb: parseInt(document.getElementById("J1bet").value) })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById("info").children[3].innerHTML = `✔️`;
                } else {
                    document.getElementById("J1bet").disabled = false;
                    document.getElementById("buttonJ1").disabled = false;
                }
            })
            .catch(error => {
                document.getElementById("J1bet").disabled = false;
                document.getElementById("buttonJ1").disabled = false;
            })
    }
});
