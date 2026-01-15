const perm = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


// x and y: int from 1-256
function grid(x, y) {
   let grid = [];
   for (let i = 0; i < y; i++) {
       grid[i] = [];
       for (let j = 0; j < x; j++) {
           switch (perm[(perm[j % 256] + i) % 256] % 4) {
               case 0:
                   grid[i][j] = {x: 1, y: 0};
                   break;
               case 1:
                   grid[i][j] = {x: -1, y: 0};
                   break;
               case 2:
                   grid[i][j] = {x: 0, y: 1};
                   break;
               case 3:
                   grid[i][j] = {x: 0, y: -1};
                   break;
               default:
                   grid[i][j] = {x: 1, y: 0};
                   break;
           }
       }
   }
   return grid;
}


const gr = grid(256,256);
function perlin(x, y) { // returns values from [-1.0, 1.0]
   const dist = [
       {x: x-Math.floor(x), y: y-Math.floor(y)}, // bottom left
       {x: x-Math.ceil(x), y: y-Math.floor(y)}, // bottom right
       {x: x-Math.floor(x), y: y-Math.ceil(y)}, // top left
       {x: x-Math.ceil(x), y: y-Math.ceil(y)} // top right
   ];
   const dot = [
       dist[0].x * gr[Math.floor(y)][Math.floor(x)].x + dist[0].y * gr[Math.floor(y)][Math.floor(x)].y, // bottom left
       dist[1].x * gr[Math.floor(y)][Math.ceil(x) % 256].x + dist[1].y * gr[Math.floor(y)][Math.ceil(x) % 256].y, // bottom right
       dist[2].x * gr[Math.ceil(y) % 256][Math.floor(x)].x + dist[2].y * gr[Math.ceil(y) % 256][Math.floor(x)].y, // top left
       dist[3].x * gr[Math.ceil(y) % 256][Math.ceil(x) % 256].x + dist[3].y * gr[Math.ceil(y) % 256][Math.ceil(x) % 256].y // top right
   ];
   const x1 = lerp(dot[0], dot[1], x-Math.floor(x));
   const x2 = lerp(dot[2], dot[3], x-Math.floor(x));
   const avg = lerp(x1, x2, y-Math.floor(y));
   return fade(avg / 2 + 0.5);
}
function fade(t) {
   return 6 * Math.pow(t, 5) - 15 * Math.pow(t, 4) + 10 * Math.pow(t, 3);
}

let xsize, ysize, frq, seed, bin, low, high, lowCol, highCol, fall;
function generate() {
    xsize = document.getElementById("xsize").value;
    ysize = document.getElementById("ysize").value;
    frq = document.getElementById("frq").value;
    seed = (document.getElementById("set").checked) ? document.getElementById("seed").value % 65536 : Math.floor(Math.random() * 65536);
    bin = document.getElementById("bin").checked;
    low = document.getElementById("lowcol").value;
    high = document.getElementById("highcol").value;
    lowCol = [parseInt(low.substring(1,3),16),parseInt(low.substring(3,5),16),parseInt(low.substring(5),16)];
    highCol = [parseInt(high.substring(1,3),16),parseInt(high.substring(3,5),16),parseInt(high.substring(5),16)];
    fall = document.getElementById("fall").checked;
    canvas.width = xsize;
    canvas.height = ysize;
    for (let i = 0; i < ysize; i++) {
        for (let j = 0; j < xsize; j++) {
            ctx.fillStyle = color(perlin((j / frq + perm[Math.floor(seed / 256)]) % 256, (i / frq + perm[seed % 256]) % 256) * ((fall) ? falloff(j, i, xsize, ysize) : 1));
            ctx.fillRect(j, i, 1, 1);
        }
    }
}

function falloff(x, y, w, h) {
    const xRel = x / w;
    const yRel = y / w;
    const dist = Math.max(Math.abs(xRel-0.5),Math.abs(yRel-0.5));
    if (dist > 0.3) {
        return lerp(1, 0, dist * 5 - 1.5);
    }
    return 1;
}


function color(x) {
    if (bin) {
        if (x > 0.5) {
            return high;
        }
        return low;
    }
   const col = [
    Math.floor(lerp(lowCol[0],highCol[0],x)),
    Math.floor(lerp(lowCol[1],highCol[1],x)),
    Math.floor(lerp(lowCol[2],highCol[2],x))];
    return "#" + rgbStr(col[0]) + rgbStr(col[1]) + rgbStr(col[2]);
}
function lerp(a, b, c) {
   return a + (b - a) * c;
}
function rgbStr(x) {
    if (x < 16) {
        return "0" + x.toString(16);
    }
    return x.toString(16);
}