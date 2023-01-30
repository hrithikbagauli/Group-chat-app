const myform = document.getElementById('myform');
const joined_div = document.getElementById('joined');
const message_input = document.querySelector('.message');
const message_div = document.getElementById('message_div');
let token = localStorage.getItem('token');

if (!localStorage.getItem('messages')) {
    localStorage.setItem('messages', JSON.stringify([]));
}
document.addEventListener('DOMContentLoaded', function (e) {
    setInterval(async () => {
        try {
            getMessages();
            const users = await axios.get('http://localhost:4000/online-user');
            joined_div.replaceChildren();
            for (let i = 0; i < users.data.length; i++) {
                const div = document.createElement('div');
                div.classList.add('text-center', 'p-0');
                let content = `<span class="badge fw-normal bg-secondary">${users.data[i].name} joined</span>`;
                div.innerHTML = content;
                joined_div.append(div);
            }

            message_div.replaceChildren();
            let messages = JSON.parse(localStorage.getItem('messages'));
            for (let i = 0; i < messages.length; i++) {
                const div = document.createElement('div');
                let time = convertTime(messages[i].createdAt);
                if (messages[i].user.name == localStorage.getItem('username')) {
                    div.classList.add('d-flex', 'p-0', 'w-100', 'justify-content-end', 'pe-2')
                    div.innerHTML =
                        `<span class="wrap bg-primary text-white my-2 pb-0 rounded">
                ${messages[i].message}
                <div class="p-0 m-0 d-flex justify-content-end"><span class="p-0 m-0 fw-bold">${time}</span></div>
                </span>`
                }
                else {
                    div.classList.add('d-flex', 'justify-content-start', 'p-0', 'w-100', 'mt-2');
                    div.innerHTML =
                        `<span class="wrap bg-light rounded pb-0">
                <div class="p-0 fw-bold"><span class="p-0">${messages[i].user.name}</span></div>
                ${messages[i].message} 
                <div class="p-0 m-0 d-flex justify-content-end"><span class="p-0 m-0 fw-bold">${time}</span></div>
                </span>`
                }
                message_div.append(div);
            }
        } catch (err) {
            console.log(err)
        }
    }, 100);
})

myform.addEventListener('submit', async function (e) {
    e.preventDefault();
    try {
        if (message_input.value != '') {
            await axios.post('http://localhost:4000/send-message', { message: message_input.value }, { headers: { Authorization: token } });
            getMessages();
            updateScroll();
            message_input.value = '';
        }
    } catch (err) {
        console.log(err);
    }
})



async function getMessages() {
    try {
        let last_message_id;
        let old_messages = JSON.parse(localStorage.getItem('messages'));
        if (old_messages.length > 0) {
            last_message_id = old_messages[old_messages.length - 1].id;
        }
        if (old_messages.length > 10) {
            for (let i = 0; i < old_messages.length / 2; i++) {
                old_messages.shift();
                localStorage.setItem('messages', JSON.stringify(old_messages));
            }
        }
        const result = await axios.get(`http://localhost:4000/get-messages?id=${last_message_id}`, { headers: { Authorization: token } });
        if (result.data.length > 0) {
            let new_messages = old_messages.concat(result.data);
            localStorage.setItem('messages', JSON.stringify(new_messages));
        }
        // console.log(JSON.parse(localStorage.getItem('messages')));
    } catch (err) {
        console.log(err);
    }
}

function convertTime(time) {
    let time_indicator = 'am';
    let hour = parseInt(time.slice(11, 13));
    if (hour >= 12 && hour < 24) {
        time_indicator = 'pm';
        if (hour > 12) {
            hour = hour - 12;
        }
    }
    const minutes = time.slice(13, 16);
    return `${hour}${minutes} ${time_indicator}`;
}

function updateScroll() {
    message_div.scrollTop = message_div.scrollHeight;
}
