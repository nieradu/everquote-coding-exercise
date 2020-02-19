var async = require("async");

var qu = async.queue((task, callback) => {
  /** Start workflow for new consumer */
  console.log(`a task`);
  /** Free task from queue */
  callback();
}, 1);

qu.drain(() => {
  console.log(`all have been done`);
})

for (let index = 0; index < 10; index++) {
  qu.push("test", (err) => {
    console.log("after each push");
    if (err) {
      console.log(err);
    }
  })
}

setTimeout(() => {
  qu.push("test", () => {
    console.log("after 1 sec");
  })
}, 1000)