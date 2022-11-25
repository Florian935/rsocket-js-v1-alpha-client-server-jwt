import { Component, OnInit } from '@angular/core';
import { RsocketService } from 'src/app/core/services/rsocket.service';
import { UnsubscribeAdapter } from 'src/app/shared/utils/unsubscribe-adapter.util';

@Component({
    selector: 'app-request-stream',
    templateUrl: './request-stream.component.html',
    styleUrls: ['./request-stream.component.scss'],
})
export class RequestStreamComponent
    extends UnsubscribeAdapter
    implements OnInit
{
    constructor(private _rsocketService: RsocketService) {
        super();
    }

    ngOnInit(): void {
        this.addSub(
            this._rsocketService
                .requestStream(
                    ['1', '2', '3', '4', '5'],
                    'product.request.stream'
                )
                .subscribe(console.log)
        );
    }
}
