import { Component } from '@angular/core';

@Component({
  selector: 'app-platillo-skeleton',
  standalone: true,
  template: `
    <div class="card h-100 placeholder-glow">
      <div class="card-img-top placeholder" style="height: 180px; width: 100%;"></div>
      <div class="card-body d-flex flex-column">
        <h5 class="card-title placeholder-glow">
          <span class="placeholder col-6"></span>
        </h5>
        <p class="card-text placeholder-glow flex-grow-1">
          <span class="placeholder col-7"></span>
          <span class="placeholder col-4"></span>
          <span class="placeholder col-4"></span>
          <span class="placeholder col-6"></span>
          <span class="placeholder col-8"></span>
        </p>
        <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
          <span class="placeholder col-4"></span>
          <span class="placeholder col-2"></span>
        </div>
      </div>
    </div>
  `
})
export class PlatilloSkeletonComponent {}
