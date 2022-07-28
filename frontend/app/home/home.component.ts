import { Component, OnInit } from '@angular/core';
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
    private walletService: WalletService
  ) {
    this.wip = false;
    this.error = null;
    this.connected = this.walletService.isConnected();
  }

  ngOnInit(): void {
    this.walletService.log('views');
  }

  async connect() {
    await this.walletService.connect();
    await this.walletService.checkNetwork();
    this.connected = true;
  }
}
