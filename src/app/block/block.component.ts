import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockComponent implements OnInit {

  private trustedColor : SafeStyle;
  @Input() block;
  @Input() size;

  constructor(private sanitizer: DomSanitizer, private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    let color = "hue-rotate(" + this.block.color + "deg)";
    this.trustedColor = this.sanitizer.bypassSecurityTrustStyle(color);
  }

  public gotHit() {
    this.changeDetector.detectChanges();
  }

}
