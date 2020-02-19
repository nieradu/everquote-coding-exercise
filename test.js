const cluster = require("cluster");
const http = require("http");
const numCPUs = require("os").cpus().length;

//console.log(cpus);

// if (cluster.isMaster) {
//   console.log("master process", process.pid);
//   for (let index = 0; index < numCPUs; index++) {
//     cluster.fork();

//   }
// } else {
//   console.log("worker process", process.pid);
//   http.createServer((req, res) => {
//     const message = `Worker: ${process.pid}`;
//     console.log(message);
//     res.end(message);
//   }).listen(3000);
// }

var async = require("async");

var taskList = [
  "task_1",
  "task_2",
  "task_3",
  "task_4",
  "task_5",
  "task_6",
  "task_7",
  "task_8",
  "task_9",
  "task_10"
];

var taskQueue = async.queue(function(task, callback) {
  console.log("Performing task: " + task.name);
  console.log("Waiting to pe processed ", taskQueue.length());
  console.log("----------------");

  setTimeout(function() {
    callback();
  }, (1 + Math.floor((3 - 1) * Math.random())) * 1000);
}, 20);

taskQueue.drain(function() {
  console.log("all items have been processed");
});

for (let index = 0; index < taskList.length; index++) {
  const element = taskList[index];
  taskQueue.push({ name: element }, function(err) {
    //Done

    if (err) {
      console.log(err);
    }
  });
}
