import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WalletService } from '../services/wallet.service';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../services/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss']
})
export class AssetComponent implements OnInit {
  nft: number;
  category: string;
  metadata: any;
  user: string;
  expires: string;
  image: string;
  waiting: boolean;

  wip: boolean;
  error: string;
  subscription: Subscription;

  rentable: boolean;

  constructor(
    private route: ActivatedRoute,
    private walletService: WalletService,
    private http: HttpClient,
    private messageService: MessageService
  ) {
    this.error = null;
    this.waiting = false;
    this.route.params.subscribe(params => {
      this.nft = params.id;
      this.category = params.cat;
      this.getNftData(this.nft);
    });
    this.subscription = this.messageService.onMessage().subscribe(message => {
      if (message && Object.keys(message).length > 0 && message.type == 'rented') {
        this.getNftData(this.nft);
        this.waiting = false;
      }
    });
  }

  getNftData(nft: number) {
    this.rentable = false;
    this.walletService.loggedUser().then(user => {
      this.walletService.checkNetwork().then(() => {
        this.wip = true;
        this.walletService.getNftMetadata(this.nft).then(assetInfo => {
          this.metadata = assetInfo.metadata;
          this.image = this.metadata.image;
          this.user = assetInfo.user == '0x0000000000000000000000000000000000000000' ? 'None' : assetInfo.user == user ? 'me' : assetInfo.user;
          this.expires = assetInfo.expires;
          this.rentable = this.user && this.user != 'None' ? false : true;
          this.wip = false;
        }).catch(err => {
          this.error = err;
          this.wip = false;
        });
      });
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async run(cmd: string) {
    try {
      this.error = null;
      let command = await lastValueFrom(this.http.get<any>(this.metadata.endpoint + cmd));
      let signature = await this.walletService.sign(command);
      let result = await lastValueFrom(this.http.post<any>(this.metadata.endpoint + cmd, { message: command, signature: signature }));
      this.walletService.log('actions');
      if ('error' in result) {
        this.error = JSON.stringify(result.error);
      } else {
        this.image = 'assets/' + result.result + '.png';
      }
    } catch (err) {
      this.error = err.message;
    }
  }

  async rent() {
    try {
      this.waiting = true;
      this.error = null;
      await this.walletService.rent(this.nft);
      this.walletService.log('rents');
    } catch (err) {
      this.error = JSON.stringify(err);
      this.waiting = false;
    }
  }

}
