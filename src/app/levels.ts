import { Block } from './block/block';

export default {
  level1() {
    let blocks = [];
    for (let i = 0; i < 21; i++) {
      for (let a = 0;a < 7; a++) {
        let b = a % 2 === 0 ? 2.2 : 4.4;
        blocks.push({
          pos: {x: 4.6 * i + b, y: 6 + 6 * a},
          health: 3,
          color: 10 * i
        })
      }
    }

    return blocks;
  },
  level2() {
    let blocks = [];
    for (let  x = 0; x < 21; x++) {
      for (let y = 0; y < 7; y++) {
        if (x < 3 + y || x > 4 + y && x < 16 - y || x > 17 - y) {
          let color;
          if (x < 3 + y) {
            color = -30;
          }
          else if (x > 17 - y) {
            color = 60;
          }
          else {
            color = 180;
          }

          let b = y % 2 === 0 ? 2.2 : 4.4;
          blocks.push({
            pos: {x: 4.6 * x + b, y: 6 + 6 * y},
            health: 3,
            color: color
          });
        }
      }
    }

    return blocks;
  },
  level3() {
    let heart = `
xxxyyyyyxxxxyyyyyxx
xxyyxxxyyyyyxxxyyxxx
xxyyxxxxxyyxxxxxyyxx
xxyyxxxxxxxxxxxyyxxx
xxxyyxxxxxxxxxxyyxxx
xxxyyyyyyyyyyyyyxxxx
`
    let blocks = [];
    let x = 0;
    let y = -1;
    for (let letter of heart) {
      if (letter === "x") {
        x++;
      }
      else if (letter === "y") {
        let b = y % 2 === 0 ? 2.2 : 4.4;
        blocks.push({
          pos: {x: 4.6 * x + b, y: 6 + 6 * y},
          health: 3,
          color: -35
        });
        x++;
      }
      else {
        y++;
        x = 0;
      }
    }

    return blocks;
  },
  level4() {
    let blocks = [];
    for (let x = 0; x < 21; x++) {
      for (let y = 0; y < 7; y++) {
        if (x % 2 === 0) {
          let b = y % 2 === 0 ? 2.2 : 4.4;
          blocks.push({
            pos: {x: 4.6 * x + b, y: 6 + 6 * y},
            health: 3,
            color: -30 * y
          });
        }
      }
    }

    return blocks;
  },
  level5() {
    let thingie = `
yxxyxxyxxyxxyxxyxxyxx
yxyyxyyxyyxyyxyyxyyxy
xyyxyyxyyxyyxyyxyyxyy
xyxxyxxyxxyxxyxxyxxyx
xyyxyyxyyxyyxyyxyyxyy
yxyyxyyxyyxyyxyyxyyxy
yxxyxxyxxyxxyxxyxxyxx`

    let blocks = [];
    let x = 0;
    let y = -1;
    let color = 0;
    for (let letter of thingie) {
      if (letter === "x") {
        x++;
      }
      else if (letter === "y") {
        let b = y % 2 === 0 ? 2.2 : 4.4;
        blocks.push({
          pos: {x: 4.6 * x + b, y: 6 + 6 * y},
          health: 3,
          color: color
        });
        color += 30;
        x++;
      }
      else {
        y++;
        x = 0;
        color = 0;
      }
    }

    return blocks;
  }
};
