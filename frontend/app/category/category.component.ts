import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletService } from '../services/wallet.service';
import { Subscription } from 'rxjs';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  wip: boolean;
  error: string;
  subscription: Subscription;

  category: string;
  nft_list: any[];
  user: string;

  constructor(
    private route: ActivatedRoute,
    private walletService: WalletService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.error = null;
    this.route.params.subscribe(params => {
      this.category = params.cat;
      this.walletService.loggedUser().then(user => {
        this.walletService.checkNetwork().then(async () => {
          this.user = user;
          this.wip = true;
          let generator = this.walletService.getNftByCategory(this.category);
          this.nft_list = [];
          for (var i = 0; i < 10; i++) {
            let currentNft = (await generator.next()).value;
            this.nft_list.push(currentNft);
            this.wip = false;
          }
        });
      });
    });
    this.subscription = this.messageService.onMessage().subscribe(message => {
      if (message && Object.keys(message).length > 0 && message.type == 'account') {
        this.walletService.loggedUser().then(user => {
          this.user = user;
        });
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  gotoasset(id: string) {
    this.router.navigate(['asset/' + this.category + '/' + id])
  }

}
