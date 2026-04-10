let API_KEY = null; // placeholder, not used in code but required for bundler to work with dotenv




const API_POOL = ["47c1cd69241da6b5665d5a841c7a36840e56da965d4a1503852299057a528bec", "33b631e98771a81aae8b0b4ca5235d065ba658f78a355fceb610e276d54cda5d", "17eb58c407b222cbe3e68277bcaf84393f219f89dd34ef80febf66e7d53478e7", "4bff3235fe4cfa7ec28adb0c0f07f549ebcbc91c2d614b6e7b56dfc96f1cf6f6", "b64beb7c03e10ec9462db0e517d4e9f0df978678d9c8173f1c086c5021d2a2c3", "8181246df7457002eb474986ca8d0406785866b5fe66284556b729885359f8aa", "c7ad2e50e76650391f2d8becd733f11418b650587d90489985d0399c70e3f27c", "507e2942d2d5195e69f07b63ad5079b956fa2a5ff121aeb17a5c42c075e6ccd5", "066fef5716136da6a03722a1c2b8de67912fac4be068c0cf499bee355c533b44", "98066cb79b6466f200bbe95bf338c87199da7049896e8b83ba1537f07b62c424", "7c3eea4071bb6fa87ce5d088c68d685d71f21ed30b7b34fc4a0c1eeb73b087eb", "cfa5f412516400fd22a8b5e3351becbf27c8ba9ed33f7c8daebaa99617858263", "ee744717fd766c47317dc09c4646b0c7eed8b6083b120d323da2508a356a7734", "28ae1d0974da45fc929161b867b7a49dcb4211b7580f7b43b2a443ad2f772a44"]

// 🔍 check api
async function checkAPI(api_key) {
    try {
        const res = await fetch("https://openrouter.ai/api/v1/models", {
            headers: {
                Authorization: `Bearer ${api_key}`
            }
        });
        return res.ok;
    } catch {
        return false;
    }
}

// 🎯 main function
async function add_api() {

    // if already exists → do nothing
    if (localStorage.getItem("api_key")) return;

    let keys = [...API_POOL];

    while (keys.length > 0) {

        // pick random
        let index = Math.floor(Math.random() * keys.length);
        let api_key = "sk-or-v1-" + keys[index];

        let valid = await checkAPI(api_key);

        if (valid) {
            localStorage.setItem("api_key", api_key);
            return;
        } else {
            // remove bad key
            keys.splice(index, 1);
        }
    }

    console.log("No valid API found");
}

// 🚀 run once
add_api();

async function initAPI() {
    await add_api();
    API_KEY = localStorage.getItem("api_key");
}

initAPI();






// /* AUTO LOGIN */

async function initApp() {

    // wait for api to be set
    await add_api();

    API_KEY = localStorage.getItem("api_key");

    // NOW handle UI
    if (API_KEY) {
        document.getElementById("login").style.display = "none";
    } else {
        document.getElementById("login").style.display = "block";
    }
}

initApp();


// /* LOGIN FIX */
document.getElementById("continueBtn").onclick = function () {
    let key = document.getElementById("apikeyinput").value.trim();
    if (!key) return;
    localStorage.setItem("api_key", key);
    document.getElementById("login").style.display = "none";
    setTimeout(() => {
        location.reload(true);
    }, 200);
}






// /* MENU */

function toggleMenu() {

    document.getElementById("drawer").classList.toggle("open");
    document.querySelector(".blank_exit").classList.toggle("show");

}

/// /* API GUIDE */

function open_api_guide() {
    document.getElementById("apiGuide").style.display = "flex";
}

// ABOUT
function open_about() {
    document.getElementById("about").style.display = "flex"
}
function close_about() {
    document.getElementById("about").style.display = "none"
}
/* API SETTINGS */

function changeAPI() {
    document.getElementById("login").style.display = "flex"
    document.getElementById("cross").style.display = "flex"
}
function closelogin() {
    document.getElementById("login").style.display = "none"
    document.getElementById("cross").style.display = "none"
}
function deleteAPI() {
    localStorage.removeItem("api_key")
    location.reload()
}

/* NAV */

function tab(id) {

    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"))

    document.querySelectorAll(".navbtn").forEach(b => b.classList.remove("active"))

    document.getElementById(id).classList.add("active")

    event.target.classList.add("active")

}


/* TOOL STORAGE */

function saveTools() {
    localStorage.setItem("tools", JSON.stringify(tools))
}

function renderTools() {

    let list = document.getElementById("toolList")

    list.innerHTML = ""

    for (let name in tools) {

        let div = document.createElement("div")

        div.className = "tool"

        div.innerHTML = `
<span>${name}</span>
<div>
<button onclick="openTool('${name}')">Open</button>
<button onclick="deleteTool('${name}')">Delete</button>
</div>
`

        list.appendChild(div)

    }

}

function openTool(name) {

    let html = tools[name]

    let blob = new Blob([html], { type: "text/html" })

    let url = URL.createObjectURL(blob)

    window.open(url, "_blank")

}


function deleteTool(name) {

    delete tools[name]

    saveTools()

    renderTools()

}

// MAIN LOADING

window.addEventListener("load", function () {

    setTimeout(function () {

        document.getElementById("main-loading").style.display = "none";

    }, 1500);

});

/* OVERLAY */

function showMessage(text, loading = false) {

    document.getElementById("overlay").style.display = "flex"

    document.getElementById("msg").innerText = text

    document.getElementById("spin").style.display = loading ? "flex" : "none"

    if (!loading) {
        setTimeout(() => document.getElementById("overlay").style.display = "none", 2000)
    }

}

/* GENERATE */

async function generate() {

    let name = document.getElementById("name").value
    let prompt = document.getElementById("prompt").value

    if (!name || !prompt) return

    showMessage("", true)

    try {

        let res = await fetch("https://openrouter.ai/api/v1/chat/completions", {

            method: "POST",

            headers: {
                "Authorization": "Bearer " + localStorage.getItem("api_key"),
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                model: "deepseek/deepseek-chat",

                messages: [{
                    role: "user",
                    content: `
Generate a complete HTML file.
Start with <!DOCTYPE html>
End with </html>.
Include CSS and JS.

User request:
${prompt}
`
                }]

            })

        })

        let data = await res.json()

        let raw = data.choices[0].message.content

        raw = raw.replace(/```html/g, "").replace(/```/g, "")

        let match = raw.match(/<!DOCTYPE html>[\s\S]*<\/html>/i)

        let html = match ? match[0] : raw

        tools[name] = html

        saveTools();

        renderTools();

        showMessage("Tool Created");

    } catch {

        showMessage("Error generating tool")
        setTimeout(() => {
                location.reload(true);
            }, 2000);

    }

}

renderTools();


function delete_all() {
    document.getElementById("delete-overlay").style.display = "none";
    localStorage.removeItem("tools");
    tools = {};
    renderTools();
    setTimeout(() => {
                location.reload(true);
            }, 200);
}


document.querySelectorAll(".question").forEach(q => {
    q.addEventListener("click", () => {
        q.classList.toggle("active");
        q.querySelector(".q img").style.transform = q.classList.contains("active") ? "rotate(180deg)" : "rotate(0deg)";
    });
});
