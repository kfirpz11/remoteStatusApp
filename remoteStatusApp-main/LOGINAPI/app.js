let acckey = document.getElementById('acckey').value;
let Users_list = [];
let Status_list = [];
let settings = document.getElementById('sub');
settings.addEventListener('click', changeacckey);
test = 'ahsheli haykar 1548'

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

let dropdownhandler = function(divid) {
    return function() { document.getElementById(divid).classList.toggle("show") };
};


// q0ZgVgxndt493LFId4DU
// d6jUinigCJsSwEKc2geH
// BEDGFss4Uiio5IV3Q04D

function changeacckey() {
    console.log('clicked');
    acckey = document.getElementById('acckey').value;
    start(acckey);
}

async function getStatus(acckey) {
    Status_list = [];
    let uri = `https://loginapi.voicenter.co.il/UserLogin/GetStatusesList?code=${acckey}`
    return fetch(uri)
        .then((data) => data.json())
        .then(data => {
            let status = data.Statuses;
            status.forEach(element => {
                console.log(element.Name, element.ID, element.Color)
                Status_list.push(new Status(element.Name, element.ID))
            })

        })
}

// fetch from active calls API the list of users (provide with account key)

async function getUsers(acckey) {
    userIndex = 0
    Users_list = [];
    let Uri = `https://monapisec.voicenter.co.il/comet/API/GetExtensionsCalls?code=${acckey}`;
    return fetch(Uri)
        .then((response) => response.json())
        .then(data => {
            let ext = data.EXTENSIONS;
            console.log("getUsers: ", ext);
            ext.forEach(element => {
                console.log(element.name.substring(0, 14), element.onlineUserStatus, element.userID, element.username)
                Users_list.push(new User(checkSpaces(element.name), element.onlineUserStatus, element.userID, element.username));
            })
        })
}


// after getting the users from active calls API
// create a div and a button for each of the users with dynamic id 

async function createButtons(users, Status) {
    const myDiv = document.getElementById("users");
    while (myDiv.firstChild) {
        myDiv.removeChild(myDiv.firstChild);
    }
    let i = 0;
    users.forEach(element => {

        const dropDiv = document.createElement("DIV");
        let subDiv = document.createElement('DIV');
        let button = document.createElement('BUTTON');
        console.log(element.name)
        let text = document.createTextNode(element.name);
        dropDiv.setAttribute('id', element.name + 'div');
        button.setAttribute(`id`, element.name);
        button.setAttribute('class', 'dropbtn');
        dropDiv.setAttribute('class', 'dropdown');
        subDiv.setAttribute('id', 'myDropdown' + element.name);
        subDiv.setAttribute('class', 'dropdown-content');
        button.appendChild(text);
        myDiv.appendChild(dropDiv);
        dropDiv.appendChild(button);
        dropDiv.appendChild(subDiv);
        button.addEventListener('click', dropdownhandler('myDropdown' + element.name, false));
        // updateCss(element, element.currentstatus);

        Status.forEach(elem => {
            let sbutton = document.createElement('button');
            let txt = document.createTextNode(elem.name);
            subDiv.appendChild(sbutton);
            sbutton.appendChild(txt);
            sbutton.setAttribute('id', elem.name + element.name);
            sbutton.addEventListener('click', triggerstatuschange(element, elem))
        })
        i++;

    });
    console.log(`created ` + i + ` users`);
    return
}


class Status {
    constructor(name, number) {
        this.name = name;
        this.number = number
        this.color = this.defColor(this.number);

    }

    defColor(number) {
        let color = null;
        switch (number) {
            case 1:
                color = 'rgb(73,202,109)';
                break
            case 2:
                color = 'black';
                break
            case 3:

            case 5:
                color = 'rgb(10,57,69)';
                break
            case 7:
                color = 'rgb(249,85,71)';
                break
            case 9:
                color = 'rgb(209,192,222)';
                break
            case 11:
                color = 'rgb(232,179,45)';
                break
            case 12:
                color = 'rgb(94,128,130)';
                break
            case 13:
                color = 'rgb(37,179,171)';
                break
        }
        return color;
    }
}
class User {
    constructor(name, currentstatus, userid, sipid) {

        this.name = name;
        this.currentstatus = currentstatus;
        this.userid = userid;
        this.sipid = sipid;
    }

    async Changestatus(User, Status, acckey) {
            // call LoginAPI to change status for the user
            let loginUri = `https://loginapi.voicenter.co.il/UserLogin/SetStatusFromAPI?code=${acckey}&userid=${User.userid}&sipid=${User.sipid}&status=${Status.number}`;
            console.log("changing status");
            return fetch(loginUri)
                .then((res) => {
                    if (res.ok) {
                        console.log();
                        console.log(res.status);
                        console.log(`changed ${User.name} status to status ${Status.name}`)
                    } else {
                        console.error('ERROR');
                    }
                })


        }
        // check with active calls API what is the current status
    async ValidateUserStatus(User, acckey) {
        let callloguri = `https://monapisec.voicenter.co.il/comet/API/GetExtensionsCalls?code=${acckey}&extension=${User.sipid}`;
        return fetch(callloguri)
            .then(response => response.json())
            .then(data => {
                console.log(User.currentstatus == data.EXTENSIONS[0].onlineUserStatus)
                console.log(`JSON ` + data.EXTENSIONS[0].onlineUserStatus);
                User.currentstatus = data.EXTENSIONS[0].onlineUserStatus;
                console.log(`USER ` + User.currentstatus);
            })
    }

    updateCss(User, Status) {
        const userButton = document.getElementById(User.name);
        userButton.style.backgroundColor = Status.color;
        console.log(userButton.style.backgroundColor);

    }
}


let triggerstatuschange = function(User, Status) {
    return async function() {
        await User.Changestatus(User, Status, acckey);
        await User.ValidateUserStatus(User, acckey);
        User.updateCss(User, Status);
    }
}





async function start(acckey) {
    await getStatus(acckey);
    await getUsers(acckey);
    await createButtons(Users_list, Status_list);
}


function checkSpaces(name) {
    let i = 0
    let second = 0
    while (i != 2) {
        let space = name.indexOf(" ", second);
        console.log(space);
        i++;

        second = space + 1;
    }
    console.log(name.substring(0, second - 1))
    if (second != 0) {
        return name.substring(0, second - 1);
    }
    console.log(name)
    return name
}