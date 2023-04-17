const token = "9lApXUKBS1FZGlQjZd7CDYxL";
const participantsURL = "https://mock-api.driven.com.br/api/vm/uol/participants";
const statusURL = "https://mock-api.driven.com.br/api/vm/uol/status";
const messageURL = "https://mock-api.driven.com.br/api/vm/uol/messages";
const keepAliveTime = 5000;
const verifyMessagesTime = 3000;

let user = "";

axios.defaults.headers.common['Authorization'] = token;

function startChat() {
    user = prompt('Digite seu nome de usuário: ');

    while(userAuthentication(user) == false){
        user = prompt('Digite seu nome de usuário: ');
    }

    console.log('autenticação com sucesso');

    keepAlive(user);
    verifyMessages();
}

startChat();

function userAuthentication(username) {
    if(username === "") {
        alert("User is empty");
        return false;
    }

    let statusReturn = true;

    axios.post(participantsURL, {name: username})
    .catch(err => {
        console.log(err);
        if (err.response.status === 400) {
            alert("Invalid user");
            statusReturn = false;
        }    
    });

    return statusReturn;
}

function keepAlive(username) {
    setInterval(() => {
        axios.post(statusURL, {name: username})
        .catch(err => {
            if (err.response.status === 400) {
                window.location.reload(true);
            }
        })
    }, keepAliveTime);
}

function verifyMessages() {
    setInterval(() => {
        axios.get(messageURL)
        .then(ret => {
            let messages = ret.data;
            renderMessages(messages);
        })
        .catch(err => {
            console.log(err);
        });
    }, verifyMessagesTime);
}

function renderMessages(messages) {
    const messagesList = document.querySelector('.mailbox').querySelector('ul');
    messagesList.innerHTML = '';

    messages.forEach((message) => {
        if (message.type === 'message') {
            messagesList.innerHTML += `
                <li class="message-all" data-test="message">
                    <h3 class="message-content"><span class="message-time">(${message.time})</span><strong>${message.from}</strong>
                    para<strong>${message.to}:</strong>${message.text}</h3>
                </li>
            `;
        }
        else if (message.type === 'status') {
            messagesList.innerHTML += `
                <li class="message-status" data-test="message">
                    <h3 class="message-content"><span class="message-time">(${message.time})</span><strong>${message.from}</strong>${message.text}</h3>
                </li>
            `;
        }
    });

    const allMessages = messagesList.querySelectorAll('li');
    const lastMessage = allMessages[allMessages.length-1];
    lastMessage.scrollIntoView();
}

function sendMessage() {
    const messageInput = document.querySelector('.input-message');
    const messageContent = messageInput.value;

    if (!messageContent) {
        console.log("mensagem vazia");
        return;
    }

    const data = {
        from: user,
        to: "Todos",
        text: messageContent,
        type: "message"
    };

    messageInput.value = "";

    axios.post(messageURL, data)
    .then(verifyMessages())
    .catch(err => {
        alert("You can't send a message. You're offline.");
        window.location.reload(true);
    });
}