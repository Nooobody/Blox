import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Position } from '../position.interface';

@Component({
  selector: 'block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.sass']
})
export class BlockComponent implements OnInit {

  private trustedColor : SafeStyle;
  @Input() block;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    let color = "hue-rotate(" + this.block.color + "deg)";
    this.trustedColor = this.sanitizer.bypassSecurityTrustStyle(color);
  }

}