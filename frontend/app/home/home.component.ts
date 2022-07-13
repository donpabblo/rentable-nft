import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  wip: boolean;
  error: string;

  constructor(
    private router: Router,
    private walletService: WalletService
  ) {
    this.wip = false;
    this.error = null;
  }

  ngOnInit(): void {
    this.walletService.log('views');
  }

  gotocategory(category: string) {
    this.router.navigate(['category/' + category])
  }
}
