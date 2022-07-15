import { Component, OnInit } from '@angular/core';
import * as M from "materialize-css/dist/js/materialize";
import { MessageService } from '../services/message.service';
import { WalletService } from '../services/wallet.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  subscription: Subscription;
  connected: boolean;
  accountInfo: any[];

  constructor(
    private walletService: WalletService,
    private messageService: MessageService
  ) {
    this.connected = false;
    this.subscription = this.messageService.onMessage().subscribe(message => {
      if (message && Object.keys(message).length > 0 && message.type == 'account') {
        this.connected = true;
        this.accountInfo = [];
        for (var key in message) {
          this.accountInfo.push({ key: key, value: message[key] });
        }
      }
    });
  }

  ngOnInit(): void {
    var sidenav = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenav, {});
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async connect() {
    this.walletService.connect();
  }

  async disconnect() {
    this.walletService.disconnect();
    this.connected = false;
    this.accountInfo = [];
  }

}
