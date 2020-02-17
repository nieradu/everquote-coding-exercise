import * as sourceMaps from "source-map-support";
import InsuranceCallCenter from "./insurance-call-center";

sourceMaps.install();

console.log("--------------------------");
console.log("--------------------------");
console.log("--------------------------");

new InsuranceCallCenter({ noAgents: 20 });
