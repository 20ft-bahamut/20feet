// Measure alpha ink bbox of a PNG (8-bit RGBA, non-interlaced) — no deps.
const fs = require('fs');
const zlib = require('zlib');

function decode(file) {
    const b = fs.readFileSync(file);
    let pos = 8, w = 0, h = 0, bitDepth = 0, colorType = 0, interlace = 0;
    const idat = [];
    while (pos < b.length) {
        const len = b.readUInt32BE(pos);
        const type = b.toString('ascii', pos + 4, pos + 8);
        if (type === 'IHDR') {
            w = b.readUInt32BE(pos + 8); h = b.readUInt32BE(pos + 12);
            bitDepth = b[pos + 16]; colorType = b[pos + 17]; interlace = b[pos + 20];
        } else if (type === 'IDAT') idat.push(b.subarray(pos + 8, pos + 8 + len));
        pos += 12 + len;
    }
    if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2) || interlace !== 0)
        throw new Error(`unsupported png: depth=${bitDepth} color=${colorType} interlace=${interlace}`);
    const raw = zlib.inflateSync(Buffer.concat(idat));
    const bpp = colorType === 6 ? 4 : 3;
    const stride = w * bpp;
    const out = Buffer.alloc(h * stride);
    let rp = 0;
    for (let y = 0; y < h; y++) {
        const filter = raw[rp++];
        const line = raw.subarray(rp, rp + stride); rp += stride;
        const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
        const cur = out.subarray(y * stride, (y + 1) * stride);
        for (let x = 0; x < stride; x++) {
            const a = x >= bpp ? cur[x - bpp] : 0;
            const bb = prev ? prev[x] : 0;
            const c = (x >= bpp && prev) ? prev[x - bpp] : 0;
            let v = line[x];
            switch (filter) {
                case 0: break;
                case 1: v = (v + a) & 0xff; break;
                case 2: v = (v + bb) & 0xff; break;
                case 3: v = (v + ((a + bb) >> 1)) & 0xff; break;
                case 4: {
                    const p = a + bb - c, pa = Math.abs(p - a), pb = Math.abs(p - bb), pc = Math.abs(p - c);
                    v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? bb : c)) & 0xff; break;
                }
                default: throw new Error('bad filter ' + filter);
            }
            cur[x] = v;
        }
    }
    return { w, h, bpp, out };
}

for (const file of process.argv.slice(2)) {
    const { w, h, bpp, out } = decode(file);
    let minX = w, minY = h, maxX = -1, maxY = -1;
    const thresh = 8; // alpha > 8 counts as ink
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const a = out[y * w * bpp + x * bpp + (bpp - 1)];
            if (a > thresh) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    const iw = maxX - minX + 1, ih = maxY - minY + 1;
    console.log(
        `${file.split('/').pop()}  canvas ${w}x${h}  ink x${minX}-${maxX} y${minY}-${maxY}` +
        `  ink ${iw}x${ih}  aspect ${(iw / ih).toFixed(3)}` +
        `  padT ${(minY / h * 100).toFixed(1)}% padB ${((h - 1 - maxY) / h * 100).toFixed(1)}%` +
        ` padL ${(minX / w * 100).toFixed(1)}% padR ${((w - 1 - maxX) / w * 100).toFixed(1)}%`
    );
}