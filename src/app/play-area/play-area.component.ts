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

  private lastHit = -1;

  private pause : boolean = false;

  private ballX = this.startBallX;
  private ballY = this.startBallY;

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
    this.updateSize();

    let blocks = Levels.level1();
    for (let block of blocks) {
      this.addNewBlock(block);
    }

    let timer = Observable.timer(0, 20);  // Our ball timer.  TODO: Pause for menu
    timer.subscribe(t => {
      if (this.pause) {
        return;
      }

      this.ballPosition.x += this.ballVelocity.x;
      this.ballPosition.y += this.ballVelocity.y;
      this.checkCollisions(this.ballPosition);
    });
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
      this.ballVelocity.x = this.ballX;
      this.lastHit = -1;
    }
    else if (realBall.x > this.convertPerX(98, false) - this.ballSize / 2) { // Right wall
      this.ballVelocity.x = -this.ballX;
      this.lastHit = -1;
    }

    if (realBall.y < this.convertPerY(2, false) + this.ballSize / 2) { // Ceiling
      this.ballVelocity.y = this.ballY;
      this.lastHit = -1;
    }
    else if (ball.y > 96) { // Are we dead?
      this.resetMultiplier();
      let randomSpawn = Math.random() * 80 + 10;
      this.ballPosition = {x: randomSpawn, y: 50};
      this.ballVelocity = {x: Math.random() > 0.5 ? this.ballX : -this.ballX, y: this.ballY};
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

            let xDiff = this.diff(realBall.x, blockPixels.x);   // Corners are calculated by the difference to the middle point of the square.
            let yDiff = this.diff(realBall.y, blockPixels.y);

            let cornerWidth = squareHalfWidth / 2;

            // let leftC = {x: blockPixels.x - squareHalfWidth, y: blockPixels.y};
            // let rightC = {x: blockPixels.x + squareHalfWidth, y: blockPixels.y};
            // let upC = {x: blockPixels.x, y: blockPixels.y - squareHalfWidth};
            // let downC = {x: blockPixels.x, y: blockPixels.y + squareHalfWidth};

            if (realBall.x < blockPixels.x && yDiff < cornerWidth) {  // Left Corner
              this.ballVelocity.x = -this.ballX;
              console.log("Left corner");
            }
            else if (realBall.x > blockPixels.x && yDiff < cornerWidth) {  // Right Corner
              this.ballVelocity.x = this.ballX;
              console.log("Right corner");
            }
            else if (realBall.y < blockPixels.y && xDiff < cornerWidth) {  // Up Corner
              this.ballVelocity.y = -this.ballY;
              console.log("Up corner");
            }
            else if (realBall.y > blockPixels.y && xDiff < cornerWidth) {  // Down Corner
              this.ballVelocity.y = this.ballY;
              console.log("Down corner");
            }
            else if (this.ballPosition.x < block.pos.x && this.ballPosition.y > block.pos.y) { // Down left
              this.ballVelocity.x = -this.ballX;
              this.ballVelocity.y = this.ballY;
              console.log("Down left");
            }
            else if (this.ballPosition.x > block.pos.x && this.ballPosition.y > block.pos.y) { // Down right
              this.ballVelocity.x = this.ballX;
              this.ballVelocity.y = this.ballY;
              console.log("Down right");
            }
            else if (this.ballPosition.x < block.pos.x && this.ballPosition.y < block.pos.y) { // Up left
              this.ballVelocity.x = -this.ballX;
              this.ballVelocity.y = -this.ballY;
              console.log("Up left");
            }
            else if (this.ballPosition.x > block.pos.x && this.ballPosition.y < block.pos.y) { // Up right
              this.ballVelocity.x = this.ballX;
              this.ballVelocity.y = -this.ballY;
              console.log("Up right");
            }
          }
        }
      }
      // Check healths after collisions.
      this.blocks = this.blocks.filter((block) => block.health > 0);
    }

    if (ball.y > 89 && ball.y < 94) { // Platform's Y
      let pixelPlat = this.convertPerX(this.platformX, false);
      if (realBall.x > pixelPlat - this.platformSize / 2 && realBall.x < pixelPlat + this.platformSize / 2) { // Hits the UFO
        if (realBall.x > pixelPlat + this.platformSize / 4) {  // Hits the right side
          this.ballVelocity.x = this.ballX;
        }
        else if (realBall.x < pixelPlat - this.platformSize / 4) { // Hits the left side
          this.ballVelocity.x = -this.ballX
        }
        // Hitting the center will keep X in the same direction.
        this.ballVelocity.y = -this.ballY;
        this.setMultiplier();
        this.lastHit = -1;
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
    this.ballX = this.startBallX * this.ballMultiplier;
    this.ballY = this.startBallY * this.ballMultiplier;
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

  @HostListener('document:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (event.code === "Space") {
      this.pause = !this.pause;
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
