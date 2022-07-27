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
  connected: boolean;

  constructor(
    private router: Router,
    private walletService: WalletService
  ) {
    this.wip = false;
    this.error = null;
    this.connected = this.walletService.isConnected();
  }

  ngOnInit(): void {
    this.walletService.log('views');
  }

  gotocategory(category: string) {
    this.router.navigate(['category/' + category])
  }

  async connect() {
    await this.walletService.connect();
    await this.walletService.checkNetwork();
    this.connected = true;
  }
}
