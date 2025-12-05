let calls = [];

const typeMap = {
  1: { icon: "call_received", class: "call-in" },   
  2: { icon: "call_made", class: "call-out" },
  3: { icon: "call_missed", class: "call-missed" },
  5: { icon: "call_received", class: "call-in" },
  6: { icon: "call_missed", class: "call-missed" }
};

// 秒 → "3分21秒" に整形
function formatDuration(sec) {
  sec = Number(sec);
  if (!sec || sec <= 0) return "0秒";

  const m = Math.floor(sec / 60);
  const s = sec % 60;

  return m > 0 ? `${m}分${s}秒` : `${s}秒`;
}

function parseXML(text) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");
  const callNodes = xml.getElementsByTagName("call");

  calls = [];

  for (let el of callNodes) {
    calls.push({
      name: el.getAttribute("contact_name") || "(Unknown)",
      number: el.getAttribute("number") || "(不明)",
      type: el.getAttribute("type"),
      type_text: typeMap[el.getAttribute("type")].class,
      date: el.getAttribute("readable_date"),
      duration: el.getAttribute("duration")
    });
  }

    calls = calls.reverse();

  renderList();
}

function renderList(filter = "") {
  const list = document.getElementById("callList");
  list.innerHTML = "";

  calls
    .filter(c => c.name.includes(filter) || c.number.includes(filter) || c.type_text.includes(filter))
    .forEach(c => {
      const t = typeMap[c.type] || typeMap[3];

      const li = document.createElement("li");
      li.className = "call-item";

      li.innerHTML = `
        <span class="material-icons call-icon ${t.class}">
          ${t.icon}
        </span>
        <div class="call-info">
          <div class="name">${c.name}</div>
          <div class="number">${c.number}</div>
          <div class="time">${c.date}（${formatDuration(c.duration)}）</div>
        </div>
      `;

      list.appendChild(li);
    });
}

document.getElementById("xmlFile").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => parseXML(reader.result);
  reader.readAsText(file);
});

document.getElementById("search").addEventListener("input", (e) => {
  renderList(e.target.value);
});

