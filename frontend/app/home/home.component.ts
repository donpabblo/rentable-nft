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

  constructor(
    private walletService: WalletService
  ) {
    this.wip = false;
    this.error = null;
  }

  ngOnInit(): void {
    this.walletService.log('views');
  }

}
