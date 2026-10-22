// Generates a 1x1 PNG used by the upload test. Run: node tests/fixtures/make-pixel.cjs
const fs=require('fs');
const zlib=require('zlib');
function crc32(buf){let c,crc=0xFFFFFFFF;for(let n=0;n<buf.length;n++){c=(crc^buf[n])&0xff;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;crc=(crc>>>8)^c;}return (crc^0xFFFFFFFF)>>>0;}
function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const t=Buffer.from(type,'ascii');const crcBuf=Buffer.alloc(4);crcBuf.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([len,t,data,crcBuf]);}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(1,0);ihdr.writeUInt32BE(1,4);ihdr[8]=8;ihdr[9]=2;
const raw=Buffer.from([0,0,0,0,0]);
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
fs.writeFileSync(__dirname+'/pixel.png',png);
console.log('wrote pixel.png',png.length,'bytes');
