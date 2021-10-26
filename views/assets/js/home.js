if (document.querySelector("#opposant")) {
    fetch("/api/list_users?no_owner=true")
        .then(response => response.json())
        .then(result => {
            result.users.forEach(user =>{
                let option = document.createElement("option")
                option.value = user.id;
                option.innerHTML = user.username;
                document.querySelector("#opposant").appendChild(option);
            })
        })
        .catch(error => console.log('error', error));
}