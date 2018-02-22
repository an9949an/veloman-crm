import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'navbar',
  styleUrls: [ './navbar.component.scss' ],
  template: `


    <nav class="navbar navbar-toggleable-md navbar-inverse bg-inverse navbar-fixed-top">
      <button class="navbar-toggler navbar-toggler-right" type="button"
              (click)="isCollapsed = !isCollapsed"
              [attr.aria-expanded]="!isCollapsed" aria-controls="navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <a class="navbar-brand" [routerLink]=" ['./'] " >Veloman Crm</a>
      <div class="collapse navbar-collapse" id="navbarNav" [ngbCollapse]="isCollapsed">
        <ul class="navbar-nav">
          <li class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]= "{exact: true}">
            <a class="nav-link" [routerLink]=" ['./'] ">
              Импорт товаров
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              Менеджер прайс-листов
            </a>
          </li>
        </ul>
      </div>
    </nav>
    
    
    
    
    `
})

export class NavbarComponent implements OnInit {
  public isCollapsed = true;

  public ngOnInit() {
  }
}
