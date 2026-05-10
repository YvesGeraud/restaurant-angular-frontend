import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
// @ts-ignore
import anime from 'animejs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroTitle') heroTitle!: ElementRef;
  @ViewChild('heroSubtitle') heroSubtitle!: ElementRef;
  @ViewChild('heroButtons') heroButtons!: ElementRef;
  @ViewChild('introOverlay') introOverlay!: ElementRef;

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.initAnimations();
    }
  }

  initAnimations() {
    const timeline = anime.timeline({
      easing: 'easeOutExpo'
    });

    // 1. Fade out the intro overlay
    timeline.add({
      targets: this.introOverlay.nativeElement,
      opacity: [1, 0],
      duration: 1000,
      delay: 500,
      complete: (anim: any) => {
        if (this.introOverlay && this.introOverlay.nativeElement) {
          this.introOverlay.nativeElement.style.display = 'none';
        }
      }
    })
    // 2. Animate title
    .add({
      targets: this.heroTitle.nativeElement,
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 1200,
      offset: '-=400'
    })
    // 3. Animate subtitle
    .add({
      targets: this.heroSubtitle.nativeElement,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 1000,
      offset: '-=800'
    })
    // 4. Animate buttons
    .add({
      targets: this.heroButtons.nativeElement,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 1000,
      offset: '-=600'
    });
  }

  ngOnDestroy() {
    // anime.js cleans up automatically, but we ensure no memory leaks
  }
}
