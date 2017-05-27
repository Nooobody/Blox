export class Vector {
  constructor(public x: number, public y: number) {}

  public add(vec: Vector) {
    return new Vector(this.x + vec.x, this.y + vec.y);
  }

  public sub(vec: Vector) {
    return new Vector(this.x - vec.x, this.y - vec.y);
  }

  public mul(vec: Vector) {
    return new Vector(this.x * vec.x, this.y * vec.y);
  }

  public div(vec: Vector) {
    return new Vector(this.x / vec.x, this.y / vec.y);
  }

  public mul_scalar(num) {
    return new Vector(this.x * num, this.y * num);
  }

  public div_scalar(num) {
    return new Vector(this.x / num, this.y / num);
  }

  public copy() {
    return new Vector(this.x, this.y);
  }

  public unit() {
    return new Vector(this.x, this.y).div_scalar(this.length());
  }

  public dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }

  public length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public dist(vec: Vector) {
    let dx = vec.x - this.x;
    let dy = vec.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public print() {
    console.log("X: " + this.x + " Y: " + this.y);
  }
}
