
let tools = JSON.parse(localStorage.getItem("tools") || "{}")

// /* LOGIN FIX */

document.getElementById("continueBtn").onclick = function () {

    let key = document.getElementById("apikeyinput").value.trim()

    if (!key) return

    localStorage.setItem("api_key", key)

    document.getElementById("login").style.display = "none"

}

// /* AUTO LOGIN */

if (localStorage.getItem("api_key")) {
    document.getElementById("login").style.display = "none"
}

// /* MENU */

function toggleMenu() {

    document.getElementById("drawer").classList.toggle("open");
    document.querySelector(".blank_exit").classList.toggle("show");

}

/* API SETTINGS */

function changeAPI() {

    document.getElementById("login").style.display = "flex"
    document.getElementById("cross").style.display = "block"

}

function closelogin(){
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

    let w = window.open()

    w.document.write(html)

    w.document.close()

}

function deleteTool(name) {

    delete tools[name]

    saveTools()

    renderTools()

}

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

        saveTools()

        renderTools()

        showMessage("Tool Created")

    } catch {

        showMessage("Error generating tool")

    }

}

renderTools()
