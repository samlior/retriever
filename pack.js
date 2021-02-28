const packager = require('electron-packager')
const settings = require('./settings')

async function bundleElectronApp(options) {
  const appPaths = await packager(options)
}

const appName = "Retriever"

async function main() {
    
    let platform = ""
    let arch = ""
    let out = ""
    
    try {
        if (process.argv[2] === "darwin") {
            platform = "darwin"
            arch = "x64"
            out = "out-darwin-asar"
        }
        else {
            platform = "win32"
            arch = "x64"
            out = "out-win-asar"
        }
    }
    catch(e) {
        console.log("use default params")
        platform = "win32"
        arch = "x64"
        out = "out-win-asar"
    }

    await bundleElectronApp({
        dir: ".",
        appVersion: settings.version,
        arch: arch,
        asar: false,
        ignore: (fileName)=>{
            if (fileName === "") {
                return false
            }
            if (fileName.indexOf(".bin") !== -1) {
                return true
            }
            for (let n of settings.packFileName) {
                if (fileName.indexOf(n) === 0 || n.indexOf(fileName) === 0) {
                    console.log("pack:" + fileName)
                    return false
                }
            }
            console.log("ignore:" + fileName)
            return true
        },
        electronZipDir: "./zip",
        name: appName,
        out: out,
        overwrite: true,
        platform: platform
    })
}

main()