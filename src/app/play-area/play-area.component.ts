import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Block } from '../block/block';
import { Position } from '../position.interface';
import Levels from '../levels';

import { BlockComponent } from '../block/block.component';
import { BallComponent } from '../ball/ball.component';
import { PlatformComponent } from '../platform/platform.component';

let degrees = 45 * (Math.PI / 180);
let sin = Math.sin(degrees);
let cos = Math.cos(degrees);

let squareHalfWidth = 35;
let ballRadius = 15;

let scales = {
  resolution: {w: 1910, h: 965},
  platform: 100,
  block: 80,
  ball: 40
}

@Component({
  selector: 'play-area',
  templateUrl: './play-area.component.html',
  styleUrls: ['./play-area.component.sass']
})
export class PlayAreaComponent implements OnInit {

  private startBallX = 0.2;
  private startBallY = 0.7;

  private mainMenu: boolean = true;

  private lastHit = -1;

  private pause : boolean = false;

  private ballX = this.startBallX;
  private ballY = this.startBallY;

  private timer;

  private wrapperOffsetLeft : number;
  private wrapperOffsetTop : number;
  private wrapperWidth : number;
  private wrapperHeight : number;

  private platformSize : number;
  private blockSize : number;
  private ballSize : number;

  private ballMultiplier = 1.0;

  private blocks : Block[] = [];
  private ballVelocity : Position = {x: this.ballX, y: this.ballY};
  private ballPosition : Position = {x: 50, y: 50};
  private platformX : number = 50;

  private highestID = 0;

  @ViewChild('block_wrapper') blockWrapper;

  constructor() { }

  ngOnInit() {
  }

  private startGame() {
    this.updateSize();

    this.ballPosition = {x: 50, y: 50};
    this.ballVelocity = {x: this.ballX, y: this.ballY};
    if (!this.timer) {
      this.timer = Observable.timer(100, 20);  // Our ball timer.  TODO: Pause for menu
      this.timer.subscribe(t => {
        if (this.pause) {
          return;
        }

        this.ballPosition.x += this.ballVelocity.x;
        this.ballPosition.y += this.ballVelocity.y;
        this.checkCollisions(this.ballPosition);
      });
    }
  }

  private setLevel(level) {
    let blocks = Levels[level]();
    for (let block of blocks) {
      this.addNewBlock(block);
    }

    this.ballPosition = {x: 50, y: 50};
    this.ballVelocity = {x: this.ballX, y: this.ballY};
    this.mainMenu = false;
    let timer = Observable.timer(50);
    timer.subscribe(() => {
      this.startGame();
    })
  }

  private exit() {
    this.blocks = [];
    this.pause = false;
    this.mainMenu = true;
  }

  private updateSize() {  // Triggers on window resize.
    this.wrapperOffsetLeft = this.blockWrapper.nativeElement.offsetLeft;
    this.wrapperOffsetTop = this.blockWrapper.nativeElement.offsetTop;
    this.wrapperWidth = this.blockWrapper.nativeElement.clientWidth;
    this.wrapperHeight = this.blockWrapper.nativeElement.clientHeight;

    let width = window.innerWidth;
    let height = window.innerHeight;

    let scaleX = width / scales.resolution.w;
    let scaleY = height / scales.resolution.h;

    console.log("ScaleX: " + scaleX);
    console.log("ScaleY: " + scaleY);

    this.platformSize = scales.platform * scaleX;
    this.ballSize = scales.ball * scaleX;
    this.blockSize = scales.block * scaleX;

    ballRadius = this.ballSize * 0.75;
    squareHalfWidth = (this.blockSize / 2) * 0.5;
  }

  private addNewBlock(block) {
    block.id = this.highestID;
    this.highestID += 1;
    this.blocks.push(block);
  }

  private checkCollisions(ball) {
    let realBall = this.convertPos(ball, false);
    if (realBall.x < this.convertPerX(2, false) + this.ballSize / 2) { // Left wall
      this.ballVelocity.x = Math.abs(this.ballVelocity.x);
      this.lastHit = -1;
    }
    else if (realBall.x > this.convertPerX(98, false) - this.ballSize / 2) { // Right wall
      this.ballVelocity.x = -Math.abs(this.ballVelocity.x);
      this.lastHit = -1;
    }

    if (realBall.y < this.convertPerY(2, false) + this.ballSize / 2) { // Ceiling
      this.ballVelocity.y = Math.abs(this.ballVelocity.y);
      this.lastHit = -1;
    }
    else if (ball.y > 96) { // Are we dead?
      this.resetMultiplier();
      let randomSpawn = Math.random() * 80 + 10;
      this.ballPosition = {x: randomSpawn, y: 50};
      this.ballVelocity = {x: Math.random() * 1.6 - 0.8, y: this.ballY};
      this.lastHit = -1;
      return;
    }

    if (ball.y < 50) {  // Maximum altitude for blocks?
      for (let block of this.blocks) {
        if (this.dist_2d(block.pos, this.ballPosition) < 10 && block.id !== this.lastHit) { // Do not calculate if we are too far away.
          // Calculate collision here.
          if (this.checkBlockCollision(block.pos, this.ballPosition)) {
            // Collision happened!
            block.health -= 1;
            this.lastHit = block.id;

            // Get the corner cases first.
            // Corners need pixels.
            let blockPixels = this.convertPos(block.pos, true);

            // console.log("Ball: ");
            // console.log("X: " + realBall.x);
            // console.log("Y: " + realBall.y);
            // console.log("Block: ");
            // console.log("X: " + blockPixels.x);
            // console.log("Y: " + blockPixels.y);

            // let xDiff = this.diff(realBall.x, blockPixels.x);   // Corners are calculated by the difference to the middle point of the square.
            // let yDiff = this.diff(realBall.y, blockPixels.y);

            let cornerWidth = squareHalfWidth / 1.5;

            let leftC = {x: blockPixels.x - squareHalfWidth, y: blockPixels.y};
            let rightC = {x: blockPixels.x + squareHalfWidth, y: blockPixels.y};
            let upC = {x: blockPixels.x, y: blockPixels.y - squareHalfWidth};
            let downC = {x: blockPixels.x, y: blockPixels.y + squareHalfWidth};

            let leftDist = this.dist_2d(realBall, leftC);
            let rightDist = this.dist_2d(realBall, rightC);
            let upDist = this.dist_2d(realBall, upC);
            let downDist = this.dist_2d(realBall, downC);

            // console.log("LeftDist: " + leftDist);
            // console.log("RightDist: " + rightDist);
            // console.log("UpDist: " + upDist);
            // console.log("DownDist: " + downDist);

            let dists = [leftDist, rightDist, upDist, downDist];
            for (let a = 0; a < 4; a++) {
              for (let i = 0;i < dists.length; i++) {
                if (dists[i] > dists[i + 1]) {
                  let temp = dists[i];
                  dists[i] = dists[i + 1];
                  dists[i + 1] = temp;
                }
              }
            }

            // console.log(dists);

            let downLeft = (dists[0] === leftDist || dists[0] === downDist) && (dists[1] === leftDist || dists[1] === downDist);
            let downRight = (dists[0] === rightDist || dists[0] === downDist) && (dists[1] === rightDist || dists[1] === downDist);
            let upLeft = (dists[0] === leftDist || dists[0] === upDist) && (dists[1] === leftDist || dists[1] === upDist);
            let upRight = (dists[0] === rightDist || dists[0] === upDist) && (dists[1] === rightDist || dists[1] === upDist);

            if (realBall.x < leftC.x && dists[0] === leftDist && leftDist <= cornerWidth + ballRadius) {  // Left Corner
              this.ballVelocity.x *= -1;
              console.log("Left corner");
            }
            else if (realBall.x > rightC.x && dists[0] === rightDist && rightDist <= cornerWidth) {  // Right Corner
              this.ballVelocity.x *= -1;
              console.log("Right corner");
            }
            else if (realBall.y < upC.y && dists[0] === upDist && upDist <= cornerWidth) {  // Up Corner
              this.ballVelocity.y *= -1;
              console.log("Up corner");
            }
            else if (realBall.y > downC.y && dists[0] === downDist && downDist <= cornerWidth) {  // Down Corner
              this.ballVelocity.y *= -1;
              console.log("Down corner");
            }
            // Source: https://gamedev.stackexchange.com/questions/23672/determine-resulting-angle-of-wall-collision
            else if (downLeft) { // Down left
              let norm = {x: 1, y: -1};
              this.ballVelocity = this.calc_angle(norm, this.ballVelocity);

              console.log("Down left");
            }
            else if (downRight) { // Down right
              let norm = {x: -1, y: -1};
              this.ballVelocity = this.calc_angle(norm, this.ballVelocity);

              console.log("Down right");
            }
            else if (upLeft) { // Up left
              let norm = {x: 1, y: 1};
              this.ballVelocity = this.calc_angle(norm, this.ballVelocity);

              console.log("Up left");
            }
            else if (upRight) { // Up right
              let norm = {x: -1, y: 1};
              this.ballVelocity = this.calc_angle(norm, this.ballVelocity);

              console.log("Up right");
            }
          }
        }
      }
      // Check healths after collisions.
      this.blocks = this.blocks.filter((block) => block.health > 0);
    }

    if (ball.y > 89 && ball.y < 94 && this.lastHit !== -2) { // Platform's Y
      let pixelPlat = this.convertPerX(this.platformX, false);
      if (realBall.x > pixelPlat - this.platformSize / 2 && realBall.x < pixelPlat + this.platformSize / 2) { // Hits the UFO
        if (realBall.x > pixelPlat + this.platformSize / 4) {  // Hits the right side
          this.ballVelocity.x = Math.abs(this.ballVelocity.x);
        }
        else if (realBall.x < pixelPlat - this.platformSize / 4) { // Hits the left side
          this.ballVelocity.x = -Math.abs(this.ballVelocity.x)
        }
        // Hitting the center will keep X in the same direction.
        this.ballVelocity.y = -Math.abs(this.ballVelocity.y);

        this.setMultiplier();
        this.lastHit = -2;
      }
    }
  }

  private checkBlockCollision(block, ball) {
    // Source: http://www.migapro.com/circle-and-rotated-rectangle-collision-detection/
    let realBall = this.convertPos(ball, false);
    let realBlock = this.convertPos(block, true);

    let cx = cos * (realBall.x - realBlock.x) - sin * (realBall.y - realBlock.y) + realBlock.x;
    let cy = sin * (realBall.x - realBlock.x) + cos * (realBall.y - realBlock.y) + realBlock.y;

    let x, y;
    if (cx < realBlock.x - squareHalfWidth) {
      x = realBlock.x - squareHalfWidth;
    }
    else if (cx > realBlock.x + squareHalfWidth) {
      x = realBlock.x + squareHalfWidth;
    }
    else {
      x = cx;
    }

    if (cy < realBlock.y - squareHalfWidth) {
      y = realBlock.y - squareHalfWidth
    }
    else if (cy > realBlock.y + squareHalfWidth) {
      y = realBlock.y + squareHalfWidth;
    }
    else {
      y = cy;
    }

    let dist = this.dist_2d({x: cx, y: cy}, {x: x, y: y});
    if (dist < ballRadius) {
      return true;
    }
    return false;
  }

  private resetMultiplier() {
    this.ballMultiplier = 1.0;
    this.setSpeed();
  }

  private setMultiplier() {
    this.ballMultiplier += 0.02;
    this.setSpeed();
  }

  private dist_2d(pos1, pos2) {
    let dx = pos2.x - pos1.x;
    let dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private setSpeed() {
    this.mul_scalar(this.ballVelocity, this.ballMultiplier);
  }

  private convertPos(pos, isBlock) {
    return {x: this.convertPerX(pos.x, isBlock), y: this.convertPerY(pos.y, isBlock)};
  }

  private diff(num1, num2) {
    return num1 > num2 ? num1 - num2 : num2 - num1;
  }

  private convertPerX(percentage, isBlock) {
    if (isBlock) {
      let num = this.wrapperWidth * (percentage / 100);
      return num + this.wrapperOffsetLeft;
    }
    else {
      return window.innerWidth * (percentage  / 100);
    }
  }

  private convertNumX(num) {
    return (num / window.innerWidth) * 100;
  }

  private convertPerY(percentage, isBlock) {
    if (isBlock) {
      let num = this.wrapperHeight * (percentage / 100);
      return num + this.wrapperOffsetTop;
    }
    else {
      return window.innerHeight * (percentage / 100);
    }
  }

  private calc_angle(norm, vel) {
    let dot = this.dot(vel, norm);

    let result = this.sub_vec(vel, this.mul_scalar(norm, dot));
    // result.y *= -1;
    // console.log("Before: " + vel.x + " / " + vel.y);
    // console.log("After: " + result.x + " / " + result.y);
    return result;
  }

  private mul_scalar(vec1, scalar) {
    return {x: vec1.x * scalar, y: vec1.y * scalar};
  }

  private mul_vec(vec1, vec2) {
    return {x: vec1.x * vec2.x, y: vec1.y * vec2.y};
  }

  private add_vec(vec1, vec2) {
    return {x: vec1.x + vec2.x, y: vec1.y + vec2.y};
  }

  private sub_vec(vec1, vec2) {
    return {x: vec1.x - vec2.x, y: vec1.y - vec2.y};
  }

  private dot(vec1, vec2) {
    return vec1.x * vec2.x + vec1.y * vec2.y;
  }

  private movePlatform(x) {
    if (this.pause) {
      return;
    }

    let width = window.innerWidth;

    let leftSide = width * (2 / 100) + this.platformSize / 2;
    let rightSide = width * (98 / 100) - this.platformSize / 2;

    this.platformX = (x / width) * 100;
    if (x < leftSide) {
      this.platformX = this.convertNumX(leftSide);
    }

    if (x > rightSide) {
      this.platformX = this.convertNumX(rightSide);
    }
  }

  private unPause() {
    this.pause = false;
  }

  private fPause() {
    this.pause = !this.pause;
  }

  @HostListener('document:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (event.code === "Space" && !this.mainMenu) {
      this.fPause();
    }
    else {

    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.movePlatform(event.clientX);
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    let touch = event.changedTouches[0];
    this.movePlatform(touch.clientX);
  }
}
