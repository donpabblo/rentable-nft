import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  wip: boolean;
  error: string;

  constructor(
    private router: Router
  ) {
    this.wip = false;
    this.error = null;
  }

  ngOnInit(): void {
  }

  gotocategory(category: string) {
    this.router.navigate(['category/' + category])
  }
}
