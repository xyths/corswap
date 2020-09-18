
const keccak256 = require("keccak256");

function hashKey(token1, token2) {
    let _token1 = token1, _token2 = token2;
    if (token2 < token1) {
        _token1 = token2;
        _token2 = token1;
    }
    let data1 = Buffer.alloc(32);
    data1.fill(_token1, 0, token1.length);
    let data2 = Buffer.alloc(32);
    data2.fill(_token2, 0, token2.length);
    return "0x" + Buffer.from(keccak256(Buffer.concat([data1, data2]))).toString('hex')
}
console.log(hashKey("SERO", "SUSD"));

console.log(hashKey("SERO","SCNY"));