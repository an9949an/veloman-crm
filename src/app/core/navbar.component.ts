import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'navbar',
  styleUrls: [ './navbar.component.scss' ],
  template: `
    <nav>
      <a [routerLink]=" ['./'] " mat-button
        routerLinkActive="active" [routerLinkActiveOptions]= "{exact: true}">
        Загрузчик товаров
      </a>
      <!--<a [routerLink]=" ['./home'] " mat-button-->
        <!--routerLinkActive="active" [routerLinkActiveOptions]= "{exact: true}">-->
        <!--Home-->
      <!--</a>-->
    </nav>
    `
})

export class NavbarComponent implements OnInit {
  public ngOnInit() {
  }
}
