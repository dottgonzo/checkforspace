"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
index_1.checkSpaceInDir("/media/dario", { verbose: true }).then((a) => {
    console.log(a);
}).catch((err) => {
    console.error(err);
});
