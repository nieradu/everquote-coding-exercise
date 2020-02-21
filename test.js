var async = require("async");

var qu = async.queue((task, callback) => {
  /** Start workflow for new consumer */
  console.log(`a task`);

  callManager().then(x => {
    console.log("DONE");
    callback();
  });
  /** Free task from queue */
  //callback();
}, 10);

qu.drain(() => {
  console.log(`all have been done`);
});

// for (let index = 0; index < 10; index++) {
//   qu.push("test", (err) => {
//     console.log("after each push");
//     if (err) {
//       console.log(err);
//     }
//   })
// }

setTimeout(() => {
  qu.push("test", () => {
    console.log("after 10 sec");
  });
}, 1000);

function callManager() {
  var newOpenCall = new Promise(resolve => {
    setTimeout(() => {
      qu.push("Radu", () => {
        console.log("after 1 sec");
      });
      resolve();
    }, 1000);
  });
  return newOpenCall;
}

// function pusher(name) {
//   qu.push(name, () => {
//     console.log("after 1 sec");
//   });
// }
