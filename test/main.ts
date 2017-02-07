
import { checkSpaceInDir, recursivecheckSpaceInDir } from "../index"
import { expect } from "chai"



checkSpaceInDir("/home/dario/works/mahgghfon",{ verbose:true }).then((a) => {
    console.log(a)
}).catch((err) => {
    console.error(err)
})