import fetch from "node-fetch";
import cors from "cors";
import express from "express";
import path from "path";
import { Kafka } from "kafkajs";

const PORT = 4000;

const kafka = new Kafka({
  clientId: "kafka",
  brokers: ["localhost:9092"],
});
const consumer = kafka.consumer({ groupId: "my-group" });

const app = express();
app.use(cors());
app.use(express.static(path.join("client", "src")));

async function consumeAllMessages() {
  const messages = [];
  await consumer.connect();
  await consumer.subscribe({ topic: "YarmarkaProjects", fromBeginning: true });
  await new Promise(async (resolve) => {
    let timeout = setTimeout(resolve, 1000);
    consumer.run({
      eachMessage: ({ topic, partition, message }) => {
        clearTimeout(timeout);
        timeout = setTimeout(resolve, 200);
        messages.push(message.value.toString());
      },
    });
    consumer.seek({ topic: "YarmarkaProjects", partition: 0, offset: 0 });
  });
  await consumer.disconnect();
  return messages;
}

async function getData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function getAllProjects(url) {
  var i = 1;
  const allProjects = [];
  const param = "/";
  while (i <= 241) {
    allProjects.push(await getData(url + param + i));
    i++;
  }
  console.log(allProjects[0]);
  var s = allProjects[0];
  return allProjects;
}

app.get("/api/messages", async function (req, res) {
  try {
    const messages = await consumeAllMessages();
    console.log("req.obj = ", req.query.obj);
    if (req.query.obj) {
      var id = "";
      if (req.query.id) {
        id = req.query.id;
      }
      console.log("id: ", id);
      switch (req.query.obj) {
        case "projects":
          const messageProjects = messages[0] + "/" + id;
          console.log("api: ", messageProjects);
          const dataProjects = await getData(messageProjects);
          console.log("DataProjects: ", dataProjects);
          res.send(dataProjects);
          break;
        case "students":
          const messageStudents = messages[1] + "/" + id;
          console.log("api: ", messageStudents);
          const dataStudents = await getData(messageStudents);
          console.log("DataStudents: ", dataStudents);
          res.send(dataStudents);
          break;
        case "participations":
          //const messageParts = messages[0];
          const allProjects = await getAllProjects(messages[0]);
          res.send(allProjects);
          break;
        default:
          console.log("Other:", messages);
      }
    }
  } catch (error) {
    res.send(error).status(400);
  }
});

app.listen(PORT, () => {
  console.log(`server started http://localhost:${PORT}`);
});
