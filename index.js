#!/usr/bin/env node --no-warnings

const shell = require("shelljs")
const path = require("path")
const fs = require("fs-extra")

const adjustLernaBootstrap = async (currentValue, newValue) => {
    const rootPackageJson = await fs.readJson("package.json")
    const scriptName = "bootstrap"
    if (rootPackageJson.scripts?.[scriptName]) {
        rootPackageJson.scripts[scriptName] = rootPackageJson.scripts[scriptName].replace(currentValue, newValue)
        await fs.writeJson("package.json", rootPackageJson, { spaces: 2 })
    }
}

const install = async () => {
    await adjustLernaBootstrap("--ci", "--no-ci")
    shell.exec(`npm install`)
    await adjustLernaBootstrap("--no-ci", "--ci")
}


const lcr = () => {
    shell.exec("git diff --name-only --diff-filter=U", async (code, stdout, stderr) => {
        if (stderr) {
            console.error(`Error: ${stderr}`)
        } else {
            let filesInConflict = stdout.split("\n")
            filesInConflict.forEach((file) => {
                if (file.endsWith("package-lock.json")) {
                    fs.unlink(file, (err) => {})
                    console.log("package-lock.json deleted")
                    shell.rm("-rf", file.replace("package-lock.json", "node_modules"))
                    console.log("node_modules folder deleted")
                }
            })
            await install()
        }
    })
}

lcr()