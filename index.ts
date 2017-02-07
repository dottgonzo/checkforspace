//

import * as Promise from "bluebird"

export function checkSpaceInDir(options: { dir: string, extension?: string, verbose?: boolean }) {

    return new Promise((resolve, reject) => {


        if (!options) {

            if (options.verbose) console.error("No dir provided")

            reject("No dir provided")

        } else {

            if (options.verbose) console.log("checking disk")


            // check partition in which there is that folder
            // check partition free space
            // remove files (based on extension if extension is provided), by modified time




        }

    })

}


export class recursivecheckSpaceInDir {
    dir: string
    extension?: string
    interval: number
    verbose: boolean
    constructor(options: { dir: string, extension?: string, interval?: number, verbose?: true }) {

        if (!options) {

            throw Error("No dir provided")

        } else {

            this.dir = options.dir


            if (!options.interval) options.interval = 5 * 60
            this.interval = options.interval

            if (!options.extension) this.extension = options.extension

            this.verbose = false
            if (options.verbose) this.verbose = options.verbose


        }


    }


    run() {
        const that = this
        return new Promise((resolve, reject) => {

            checkSpaceInDir({ dir: that.dir, extension: that.extension, verbose: that.verbose }).then((a) => {
                if (that.verbose) console.log("disk check ok")
                resolve(a)
            }).then((err) => {
                if (that.verbose) console.error(err)
                reject(err)
            })
        })
    }

    daemonize(interval?: number) {
        if (interval) this.interval = interval

        const that = this


        that.run()
        setInterval(() => {
            that.run()
        }, this.interval)

    }

}