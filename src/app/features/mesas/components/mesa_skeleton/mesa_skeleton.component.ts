import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '@shared/components/card/card.component';

@Component({
  selector: 'app-mesa-skeleton',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <app-card padding="1.25rem">
      <div class="skeleton-wrapper">
        <div class="d-flex justify-content-between mb-3">
          <div class="skeleton skeleton-circle"></div>
          <div class="skeleton skeleton-badge"></div>
        </div>
        <div class="skeleton skeleton-title mb-2"></div>
        <div class="skeleton skeleton-text mb-4"></div>
        <div class="d-flex justify-content-end gap-2 border-top pt-3">
          <div class="skeleton skeleton-button"></div>
          <div class="skeleton skeleton-button"></div>
        </div>
      </div>
    </app-card>
  `,
  styles: [`
    .skeleton {
      background: #eee;
      background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
      background-size: 200% 100%;
      animation: 1.5s shine linear infinite;
      border-radius: 4px;
    }

    .skeleton-circle { width: 60px; height: 60px; border-radius: 50%; }
    .skeleton-badge { width: 80px; height: 24px; border-radius: 20px; }
    .skeleton-title { width: 60%; height: 28px; }
    .skeleton-text { width: 80%; height: 16px; }
    .skeleton-button { width: 32px; height: 32px; }

    @keyframes shine {
      to { background-position-x: -200%; }
    }
  `]
})
export class MesaSkeletonComponent {}
