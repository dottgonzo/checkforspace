
import { checkSpaceInDir, recursivecheckSpaceInDir } from "../index"
import { expect } from "chai"



checkSpaceInDir("/media/dario/storefs/testfolder",{ verbose:true }).then((a) => {
    console.log(a)
}).catch((err) => {
    console.error(err)
})