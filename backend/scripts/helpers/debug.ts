import hre from "hardhat"
import fs from "fs"

async function main() {
    const trace = await hre.network.provider.send("debug_traceTransaction", [
        "0x37fec0dd3c58cecb2c7d47b6698529d0a946c2a20f4c52e8b6c43b8de8b785b0",
        {
            disableMemory: true,
            disableStack: true,
            disableStorage: true,
        },
    ])
    fs.writeFileSync("debug_out.json", JSON.stringify(trace))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
