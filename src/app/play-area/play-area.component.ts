import { Component, OnInit, HostListener, ViewChild, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Block } from '../block/block';
import Levels from '../levels';

import { Vector } from '../vector';

import { BlockComponent } from '../block/block.component';
import { BallComponent } from '../ball/ball.component';
import { PlatformComponent } from '../platform/platform.component';

let degrees = 45 * (Math.PI / 180);
let sin = Math.sin(degrees);
let cos = Math.cos(degrees);

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

  private ballRadius : number = 20;
  private squareHalfWidth : number = 35;
  private platformSize : number;
  private blockSize : number;
  private ballSize : number;

  private ballMultiplier = 1.0;

  private collisionDebug = [];

  private blocks : Block[] = [];
  private ballVelocity : Vector = new Vector(this.ballX, this.ballY);
  private ballPosition : Vector = new Vector(50, 50);
  private platformX : number = 50;

  private highestID = 0;

  @ViewChildren('blocks') blockComponents;
  @ViewChild('block_wrapper') blockWrapper;

  @ViewChild('batHit') sound_BatHit;
  @ViewChild('tileBreak') sound_TileBreak;
  @ViewChild('tileHit') sound_TileHit;
  @ViewChild('wallHit') sound_WallHit;

  constructor() { }

  ngOnInit() {
  }

  private startGame() {
    this.updateSize();

    if (!this.timer) {
      this.timer = Observable.timer(100, 20);  // Our ball timer.  TODO: Pause for menu
      this.timer.subscribe(t => {
        if (this.pause || this.mainMenu) {
          return;
        }

        this.ballPosition = this.ballPosition.add(this.ballVelocity);
        this.checkCollisions(this.ballPosition);
      });
    }
  }

  private setLevel(level) {
    let blocks = Levels[level]();
    for (let block of blocks) {
      this.addNewBlock(block);
    }

    this.spawnBall();
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
    this.highestID = 0;
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

    this.ballRadius = this.ballSize * 0.5;
    this.squareHalfWidth = (this.blockSize / 2);
  }

  private addNewBlock(block) {
    block.id = this.highestID;
    this.highestID += 1;
    block.pos = new Vector(block.pos.x, block.pos.y);
    this.blocks.push(block);
  }

  private spawnBall() {
    this.resetMultiplier();
    let randomSpawn = Math.random() * 80 + 10;
    let xVel = Math.random() * 0.4 + 0.3;
    xVel *= Math.random() > 0.5 ? -1 : 1;
    this.ballPosition = new Vector(randomSpawn, 55);
    this.ballVelocity = new Vector(xVel, 1.0 - Math.abs(xVel));
    this.ballVelocity.print();
    this.lastHit = -1;
  }

  private checkCollisions(ball) {
    let realBall = this.convertPos(ball, false);
    if (realBall.x < this.convertPerX(2, false) + this.ballSize / 2) { // Left wall
      this.ballVelocity.x = Math.abs(this.ballVelocity.x);
      this.lastHit = -1;
      this.sound_WallHit.nativeElement.play();
    }
    else if (realBall.x > this.convertPerX(98, false) - this.ballSize / 2) { // Right wall
      this.ballVelocity.x = -Math.abs(this.ballVelocity.x);
      this.lastHit = -1;
      this.sound_WallHit.nativeElement.play();
    }

    if (realBall.y < this.convertPerY(2, false) + this.ballSize / 2) { // Ceiling
      this.ballVelocity.y = Math.abs(this.ballVelocity.y);
      this.lastHit = -1;
      this.sound_WallHit.nativeElement.play();
    }
    else if (ball.y > 96) { // Are we dead?
      this.spawnBall();
      return;
    }

    if (ball.y < 55) {  // Maximum altitude for blocks?
      for (let block of this.blocks) {
        if (block.pos.dist(this.ballPosition) < 10 && block.id !== this.lastHit) { // Do not calculate if we are too far away.
          // Calculate collision here.
          if (this.checkBlockCollision(block.pos, this.ballPosition)) {
            // Collision happened!
            block.health -= 1;
            this.lastHit = block.id;

            for (let blockComponent of this.blockComponents._results) {
              if (blockComponent.block.id === block.id) {
                blockComponent.gotHit();
                break;
              }
            }

            if (block.health > 0) {
              this.sound_TileHit.nativeElement.play();
            }
            else {
              this.sound_TileBreak.nativeElement.play();
            }

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

            let delta = new Vector(blockPixels.x - realBall.x, blockPixels.y - realBall.y);
            let length = delta.length();

            let testVec = blockPixels.copy().sub(delta);

            testVec = testVec.add(delta.div_scalar(length).mul_scalar(this.ballRadius));

            let cornerWidth = this.squareHalfWidth / 1.5;

            let leftC = new Vector(blockPixels.x - this.squareHalfWidth, blockPixels.y);
            let rightC = new Vector(blockPixels.x + this.squareHalfWidth, blockPixels.y);
            let upC = new Vector(blockPixels.x, blockPixels.y - this.squareHalfWidth);
            let downC = new Vector(blockPixels.x, blockPixels.y + this.squareHalfWidth);

            let leftDist = testVec.dist(leftC);
            let rightDist = testVec.dist(rightC);
            let upDist = testVec.dist(upC);
            let downDist = testVec.dist(downC);

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

            if (realBall.x < leftC.x && this.ballVelocity.x > 0 && dists[0] === leftDist && leftDist < this.ballRadius) {  // Left Corner
              this.ballVelocity.x *= -1;
              console.log("Left corner");
            }
            else if (realBall.x > rightC.x && this.ballVelocity.x < 0 && dists[0] === rightDist && rightDist < this.ballRadius) {  // Right Corner
              this.ballVelocity.x *= -1;
              console.log("Right corner");
            }
            else if (realBall.y < upC.y && this.ballVelocity.y > 0 && dists[0] === upDist && upDist < this.ballRadius) {  // Up Corner
              this.ballVelocity.y *= -1;
              console.log("Up corner");
            }
            else if (realBall.y > downC.y && this.ballVelocity.y < 0 && dists[0] === downDist && downDist < this.ballRadius) {  // Down Corner
              this.ballVelocity.y *= -1;

              console.log("Down corner");
            }
            // Source: https://gamedev.stackexchange.com/questions/23672/determine-resulting-angle-of-wall-collision
            else if (downLeft) { // Down left
              let norm = new Vector(1, -1);
              this.ballVelocity = this.calc_angle(norm, this.ballVelocity);

              console.log("Down left");
            }
            else if (downRight) { // Down right
              let norm = new Vector(-1, -1);
              this.ballVelocity = this.calc_angle(norm, this.ballVelocity);

              console.log("Down right");
            }
            else if (upLeft) { // Up left
              let norm = new Vector(1, 1);
              this.ballVelocity = this.calc_angle(norm, this.ballVelocity);

              console.log("Up left");
            }
            else if (upRight) { // Up right
              let norm = new Vector(-1, 1);
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
          this.ballVelocity.x = -Math.abs(this.ballVelocity.x);
        }
        // Hitting the center will keep X in the same direction.
        this.ballVelocity.y = -Math.abs(this.ballVelocity.y);

        this.sound_BatHit.nativeElement.play();

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

    let unRotatedBall = new Vector(cx, cy);

    let closestPoint;
    let x, y;
    if (cx < realBlock.x - this.squareHalfWidth) {
      x = realBlock.x - this.squareHalfWidth;
    }
    else if (cx > realBlock.x + this.squareHalfWidth) {
      x = realBlock.x + this.squareHalfWidth;
    }
    else {
      x = cx;
    }

    if (cy < realBlock.y - this.squareHalfWidth) {
      y = realBlock.y - this.squareHalfWidth
    }
    else if (cy > realBlock.y + this.squareHalfWidth) {
      y = realBlock.y + this.squareHalfWidth;
    }
    else {
      y = cy;
    }
    closestPoint = new Vector(x, y);

    let dist = unRotatedBall.dist(closestPoint);
    if (dist < this.ballRadius) {

      // let deltaX = realBlock.x - realBall.x;
      // let deltaY = realBlock.y - realBall.y;
      //
      // let testvec = {x: realBlock.x - deltaX, y: realBlock.y - deltaY}
      //
      // let length = this.vec_length({x: deltaX, y: deltaY});
      //
      // testvec.x += (deltaX / length) * this.ballRadius;
      // testvec.y += (deltaY / length) * this.ballRadius;

      let delta = new Vector(realBlock.x - realBall.x, realBlock.y - realBall.y);
      let length = delta.length();

      let testVec = realBlock.copy().sub(delta);

      testVec = testVec.add(delta.div_scalar(length).mul_scalar(this.ballRadius));

      this.collisionDebug.push(testVec);
      Observable.timer(2000).subscribe(() => {
        this.collisionDebug.shift();
      })
      console.log(this.collisionDebug);
      return true;
    }
    return false;
  }

  private resetMultiplier() {
    this.ballMultiplier = 1.0;
    this.setSpeed();
  }

  private setMultiplier() {
    this.ballMultiplier += 0.002;
    this.setSpeed();
  }

  private setSpeed() {
    this.ballVelocity = this.ballVelocity.unit().mul_scalar(this.ballMultiplier);
  }

  private convertPos(pos, isBlock) {
    return new Vector(this.convertPerX(pos.x, isBlock), this.convertPerY(pos.y, isBlock));
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
    let dot = vel.dot(norm);

    let result = vel.sub(norm.mul_scalar(dot));
    // result.y *= -1;
    // console.log("Before: " + vel.x + " / " + vel.y);
    // console.log("After: " + result.x + " / " + result.y);
    return result;
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
