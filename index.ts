//

import * as Promise from "bluebird"
import { exec } from "child_process"
import { readdirSync, statSync } from "fs"
import * as checkFolderSize from "checkfoldersize"

export function getPercentSpace(dir: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {

    exec("df -h " + dir + " | grep '/'", (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {

        const reout = []
        for (let i = 0; i < stdout.split(" ").length; i++) {
          if (stdout.split(" ")[i]) reout.push(stdout.split(" ")[i].replace('\n', ''))
        }
        resolve(reout[4].replace('%', ''))

      }

    })

  })

}

export function getFreeGigaSpace(dir: string): Promise<number> { 
  return new Promise<number>((resolve, reject) => {

    checkFolderSize.getSizeInfo(dir).then((diskInfo) => {

      resolve(((diskInfo.available / 1024) / 1024) / 1024)

    }).catch((err) => {
      reject(err)
    })

  })

}

export function removeLastFileFromDir(dir: string) {
  return new Promise((resolve, reject) => {


    const fis = readdirSync(dir)

    const files = []


    for (let i = 0; i < fis.length; i++) {

      if (!statSync(dir + "/" + fis[i]).isDirectory()) {
        files.push(fis[i])
      }

    }


    if (files.length > 1) {

      files.sort(function (a, b) {
        return statSync(dir + "/" + a).mtime.getTime() -
          statSync(dir + "/" + b).mtime.getTime();
      });


      exec("rm '" + dir + "/" + files[0] + "'", (err, stdout, stderr) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }

      })

    } else {
      reject("nothing to remove!")
    }

  })

}

export function remfilesOnDir(dir: string, options?: { freeGigaSpace?: number }) {
  return new Promise((resolve, reject) => {

    if (!options) options = {}

    function recursiveremfiles(dir: string) {

      if (options.freeGigaSpace) {

        getFreeGigaSpace(dir).then((freeGiga) => {
          if (options.freeGigaSpace > freeGiga) {
            removeLastFileFromDir(dir).then(() => {
              recursiveremfiles(dir)
            }).catch((err) => {
              reject(err)
            })
          } else {
            resolve(true)
          }

        }).catch((err) => {
          reject(err)
        })


      } else {
        getPercentSpace(dir).then((percent) => {
          if (percent > 85) {
            removeLastFileFromDir(dir).then(() => {
              recursiveremfiles(dir)
            }).catch((err) => {
              reject(err)
            })
          } else {
            resolve(true)
          }

        }).catch((err) => {
          reject(err)
        })
      }



    }
    recursiveremfiles(dir)
  })


}

export function checkSpaceInDir(dir: string, options?: { extension?: string, verbose?: boolean, freeGigaSpace?: number }) {

  return new Promise((resolve, reject) => {

    if (!options) options = {}
    if (!dir) {

      if (options.verbose) console.error("No dir provided")

      reject("No dir provided")

    } else {

      if (options.verbose) console.log("checking disk")

      // remove files (based on extension if extension is provided), by modified time
      if (options.freeGigaSpace) {

        getFreeGigaSpace(dir).then((freeGiga) => {
          if (options.freeGigaSpace > freeGiga) {

            remfilesOnDir(dir).then((a) => {
              if (options.verbose) console.log("space cleaned")
              resolve(a)

            }).catch((err) => {
              if (options.verbose) console.error(err)
              reject(err)
            })

          } else {
            if (options.verbose) console.log("disk checked")
            resolve("disk ok, nothing to do")
          }
        }).catch((err) => {
          reject(err)
        })

      } else {


        getPercentSpace(dir).then((percent) => {


          if (percent > 85) {

            remfilesOnDir(dir).then((a) => {

              if (options.verbose) console.log("space cleaned")
              resolve(a)

            }).catch((err) => {
              if (options.verbose) console.error(err)
              reject(err)
            })

          } else {
            if (options.verbose) console.log("disk checked")
            resolve("disk ok, nothing to do")
          }




        }).catch((err) => {
          reject(err)
        })


      }
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

      checkSpaceInDir(that.dir, { extension: that.extension, verbose: that.verbose }).then((a) => {
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