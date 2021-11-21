const fs = require("fs")
const { uniswapV1 } = require("./pricePools")

const fix = JSON.stringify(uniswapV1, null, 2)

fs.writeFileSync("./fixed.js", fix)