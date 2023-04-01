async function fetchMessages(obj) {
  str = "/api/messages";
  switch (obj) {
    case "projects":
      str += "?obj=projects";
      break;
    case "students":
      str += "?obj=students";
      break;
    case "participations":
      str += "?obj=participations";
      break;
    default:
      str += "/";
  }
  if (obj != "participations") {
    if (inp.value != "") {
      str += "&?id=" + inp.value;
    }
  }

  const res = await fetch(str);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

const btnProject = document.getElementById("btnProject");
const btnStudent = document.getElementById("btnStudent");
const btnPart = document.getElementById("btnPart");
const titleEl = document.getElementById("title");
const messagesListEl = document.getElementById("messages");
const inp = document.getElementById("inp");

function getParticipants(array) {
  var i = 0;
  var result = "";
  while (i < array.length) {
    const str = JSON.stringify(array[i]);
    const obj = JSON.parse(str);
    const lenPart = Object.keys(obj.participations).length;
    var j = 0;
    result += "------------------------------------------------<br>";
    result += "Project id = " + obj.id;
    result += " | title = " + obj.title + "<br><br>";
    while (j < lenPart) {
      result += "candidate id = " + obj.participations[j].candidate.id;
      result += "| fio = " + obj.participations[j].candidate.fio + " <br>";
      j++;
    }
    i++;
  }
  return result;
}

btnPart.addEventListener("click", async () => {
  try {
    messagesListEl.innerHTML = "";
    titleEl.textContent = "Заявки студентов";
    const messages = await fetchMessages("participations");
    messagesListEl.innerHTML = getParticipants(messages);
  } catch (error) {
    titleEl.textContent = String(error);
  }
});

btnProject.addEventListener("click", async () => {
  try {
    messagesListEl.innerHTML = "";
    titleEl.textContent = "Проекты";
    const messages = await fetchMessages("projects");
    messagesListEl.innerHTML = JSON.stringify(messages, null, 2);
  } catch (error) {
    titleEl.textContent = String(error);
  }
});

btnStudent.addEventListener("click", async () => {
  try {
    messagesListEl.innerHTML = "";
    titleEl.textContent = "Студенты";
    const messages = await fetchMessages("students");
    messagesListEl.innerHTML = JSON.stringify(messages, null, 2);
  } catch (error) {
    titleEl.textContent = String(error);
  }
});
