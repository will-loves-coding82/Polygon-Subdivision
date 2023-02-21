const GAP = 1; // specifies how much space there should be between shapes
let smallest = 50000; // smallest size or area of a given polygon region
let w;
let h;
let cnvNum = 0;
let table;
let canv;
let seed;
let palette1, palette2;

function preload() {
  table = loadTable("./colors.csv", "csv", "header");
}
// This program will subdivide the canvas into smaller rounded polygons
function setup() {
  w = windowHeight - 50;
  h = windowHeight - 50;

  canv = createCanvas(w, h);  
  palette1 = floor(random(676));
  palette2 = floor(random(676));

  r0 = (int(table.get(palette1, 0)) + int(table.get(palette2, 0))) / 2;
  g0 = (int(table.get(palette1, 1)) + int(table.get(palette2, 1))) / 2;
  b0 = (int(table.get(palette1, 2)) + int(table.get(palette2, 2))) / 2;
  background(r0, g0, b0, random(100, 225));

  smallest = floor(random(2000, 5000));
  let x1 = createVector(GAP, GAP); // top left
  let x2 = createVector(w - GAP, 0); // top right
  let x3 = createVector(GAP, h - GAP); // bottom left
  let x4 = createVector(w - GAP, h - GAP); // bottom right

  let area = calcArea(x1, x2, x3, x4);

  rootStart(x1, x2, x3, x4, 0.5, 0.5);
  
  saveButton = createButton('Save Image')
  saveButton.position(0, height + 20)
  let date = new Date()
  seed = date.getTime()
  saveButton.mousePressed(saveArt)
  noLoop()
}


/* Initially, I used recursion in one method block but it would overwrite the  
 * changes made to the parent canvas since I would call draw at the
 * very end. This method will only divide rather than draw rectangles
 */
function rootStart(x1, x2, x3, x4, horizRatio, vertRatio) {
  let h1 = findPoint(x1, x3, 0.5);
  let h2 = findPoint(x2, x4, 0.5);

  let type = random(10);
  if (type > 5) {
    subDivide(x1, x2, h1, h2, horizRatio, vertRatio); // top portion
    subDivide(h1, h2, x3, x4, horizRatio, vertRatio); // bottom portion
  } else {
    let v1 = findPoint(x1, x2, 0.5);
    let v2 = findPoint(x3, x4, 0.5);

    subDivide(x1, v1, x3, v2, horizRatio, vertRatio); // left portion
    subDivide(v1, x2, v2, x4, horizRatio, vertRatio); // right portion
  }
}

// This function will take 4 points and subdivide the enclosing area
function subDivide(x1, x2, x3, x4, xRatio, yRatio, isRoot) {
  let horizRatio, vertRatio;
  let area = calcArea(x1, x2, x3, x4);

  let length = abs(dist(x2.x, x2.y, x1.x, x1.y));
  let height = abs(dist(x3.x, x3.y, x1.x, x1.y));

  
  if (area > smallest) {
    
    // Randomize chance of horizontal or vertical separation
    let type = random(10);

    // horizontal
    if (type < 5) {
      chance = random(10);
      let h1 = findPoint(x1, x3, 0.5);
      let h2 = findPoint(x2, x4, 0.5);

      // If too tall, split horizontally
      if (height / length > 2 || chance > 6) {
        subDivide(x1, x2, h1, h2, horizRatio, vertRatio, false); // top portion
        subDivide(h1, h2, x3, x4, horizRatio, vertRatio, false); // bottom portion
      } else {
        fillShape(x1, x2, x3, x4);
      }
    }

    // vertical
    if (type > 5) {
      chance = random(10);
      let v1 = findPoint(x1, x2, 0.5);
      let v2 = findPoint(x3, x4, 0.5);

      // If too wide, then split vertically
      if (length / height > 2 || chance > 6) {
        subDivide(x1, v1, x3, v2, horizRatio, vertRatio, false); // left portion
        subDivide(v1, x2, v2, x4, horizRatio, vertRatio, false); // right portion
      } else {
        fillShape(x1, x2, x3, x4);
      }
    }
  } else {
    fillShape(x1, x2, x3, x4);
  }

  return;
}

// Returns x,y coordinates between two points based on ratio of polygon portions
function findPoint(x1, x2, ratio) {
  let newX = x1.x + (x2.x - x1.x) * ratio;
  let newY = x1.y + (x2.y - x1.y) * ratio;
  return createVector(newX, newY);
}

function calcArea(x1, x2, x3, x4) {
  // Formula for calculating area of any 4 sides polygon
  // A = 1/2 * diagonal * sum of height of 2 triangles
  let diag = createVector(x2.x - x3.x, x2.y - x3.y);

  /* Determine the lines that intersect with the diagonal at 90 degrees from
   * the  top left corner and bottom right corner
   * Ortho Projection: y * u / ( u * u)
   * Let y be the vector joining the upper left and bottom left corners
   * of the polygon so (x1.x - x3.x, x1.y - x3.y) for the first calculation
   * and then for the second calculation, y will be the vector from the top right
   * to bottom right corners (x4.x - x2.x, x4.y - x2.y)
   *
   *  Let u be the diagonal
   *  Resouces: https://byjus.com/maths/area-of-quadrilateral/
   */

  let yVector, proj, perp;

  let height1, height2;

  // Calculate length for first perpendicular line
  yVector = createVector(x1.x - x3.x, x1.y - x3.y);
  //console.log(yVector);
  proj = dotProduct(yVector, diag) / dotProduct(diag, diag);
  proj = createVector(proj * diag.x, proj * diag.y);
  perp = createVector(proj.x - yVector.x, proj.y - yVector.y);
  height1 = mag(perp.x, perp.y);

  // Calculate length for second perpendicular line
  yVector = createVector(x4.x - x2.x, x4.y - x2.y);
  proj = dotProduct(yVector, diag) / dotProduct(diag, diag);
  proj = createVector(proj * diag.x, proj * diag.y);
  perp = createVector(proj.x - yVector.x, proj.y - yVector.y);
  height2 = mag(perp.x, perp.y);

  return 0.5 * mag(diag.x, diag.y) * (height1 + height2);
}

// Calculates the dot product of two vectors
function dotProduct(v1, v2) {
  let dot = v1.x * v2.x + v1.y * v2.y;
  return dot;
}

// This function will draw and fill an area with striations or solid colors
function fillShape(x1, x2, x3, x4) {
  let type = random(10);

  // Solid Color 
  if (type < 6) {
    beginShape();
    let n = noise(
      (x1.x + x2.x + x3.x + x3.x) / 4,
      (x1.y + x2.y + x3.y + x3.y) / 4
    );
    
    // Map the noise to some value between 0 and 5. 
    // to index the rgb columns in the csv file
    let col = floor(map(n, 0, 1, 0, 5));
    let alph = random(50, 200);    
    
    
    let paletteType = random(2);
    let r1, g1, b1;

    if (paletteType < 1) {
      // We multiply by 3 since each color in the csv has 3 channels (r,g,b) 
      r1 = table.get(palette1, col * 3);     // r
      g1 = table.get(palette1, col * 3 + 1); // g
      b1 = table.get(palette1, col * 3 + 1); // b
    } else {
      r1 = table.get(palette2, col * 3);
      g1 = table.get(palette2, col * 3 + 1);
      b1 = table.get(palette2, col * 3 + 1);
    }

    fill(r1, g1, b1, alph);
    noStroke();
    vertex(x1.x + GAP, x1.y + GAP);
    vertex(x2.x - GAP, x2.y + GAP);
    vertex(x4.x - GAP, x4.y - GAP);
    vertex(x3.x + GAP, x3.y - GAP);
    vertex(x1.x + GAP, x1.y + GAP);
    endShape();
    
  } else {
    let length = abs(x2.x - GAP - (x1.x + GAP));
    let height = abs(x4.y - GAP - (x1.y + GAP));

    let numStripes;

    // vertical striations
    if (length >= height) {
      numStripes = floor(random(10, 20));
      sWidth = length / numStripes;
      sHeight = height - GAP;

      let c1, c2, c3, c4; // 4 corners for each stripe

      c1 = createVector(x1.x + GAP, x1.y + GAP);
      c2 = createVector(c1.x + sWidth, c1.y);
      c4 = createVector(c2.x, c2.y + sHeight);
      c3 = createVector(c1.x, c1.y + sHeight);

      for (let i = 0; i < numStripes; i++) {
        fill(getRepeatColor(x1, c2, c3, c4))
        beginShape();
        noStroke();
        vertex(c1.x, c1.y);
        vertex(c2.x, c2.y);
        vertex(c4.x, c4.y);
        vertex(c3.x, c3.y);
        vertex(c1.x, c1.y);
        endShape();

        // Move from left to right by stripe width
        c1.x += sWidth;
        c2.x += sWidth;
        c3.x += sWidth;
        c4.x += sWidth;
      }
    }

    // horizontal striations
    else {
      numStripes = floor(random(10, 30));
      sHeight = height / numStripes;

      sWidth = length - GAP;
      let c1, c2, c3, c4; // 4 corners for each stripe

      c1 = createVector(x1.x + GAP, x1.y + GAP);
      c2 = createVector(c1.x + sWidth, c1.y);
      c4 = createVector(c2.x, c2.y + sHeight);
      c3 = createVector(c1.x, c1.y + sHeight);

      for (let i = 0; i < numStripes; i++) {
        beginShape();
        fill(getRepeatColor(x1, c2, c3, c4))
        noStroke();
        vertex(c1.x, c1.y);
        vertex(c2.x, c2.y);
        vertex(c4.x, c4.y);
        vertex(c3.x, c3.y);
        vertex(c1.x, c1.y);

        vertex(c1.x, c1.y);
        endShape();
        
        // Move from top to bottom by stripe height
        c1.y += sHeight;
        c2.y += sHeight;
        c3.y += sHeight;
        c4.y += sHeight;
      }
    }
  }
}


// Inspired by Steve's Makerspace code
function getRepeatColor(x1,x2,x3,x4) {
  let n = noise(
    x1.x + x2.x + x3.x + x3.x + 1000 / 4,
    x1.y + x2.y + x3.y + x3.y + 1000 / 4
  );
  let col = map(n, 0, 1, 0, 360);
  let mappedVal = fract(col / random(2, 20));
  if (mappedVal < 0.2) {
    col = 0;
  }
  if (mappedVal < 0.4) {
    col = 1;
  }
  if (mappedVal < 0.6) {
    col = 2;
  }
  if (mappedVal < 0.8) {
    col = 3;
  } else {
    col = 4;
  }

  let type = random(2);
  let alph = random(50, 200);
  if (type < 1) {
    r1 = table.get(palette1, col * 3);
    g1 = table.get(palette1, col * 3 + 1);
    b1 = table.get(palette1, col * 3 + 1);
  } else {
    r1 = table.get(palette2, col * 3);
    g1 = table.get(palette2, col * 3 + 1);
    b1 = table.get(palette2, col * 3 + 1);
  }
  
  return color(r1, b1, g1, alph)
}


function saveArt() {
  save( seed + '.jpg')
}
