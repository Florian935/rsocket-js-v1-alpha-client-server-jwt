import { Injectable } from '@angular/core';
import { RSocketRequester } from 'rsocket-messaging';
import { from, map, mergeMap, Observable } from 'rxjs';
import { RSocket, RSocketConnector } from 'rsocket-core';
import { WebsocketClientTransport } from 'rsocket-websocket-client';
import {
    encodeBearerAuthMetadata,
    WellKnownMimeType,
} from 'rsocket-composite-metadata';
import { StringCodec } from 'src/app/shared/models/string-codec.model';
import { RxRequestersFactory } from 'rsocket-adapter-rxjs';
import { Product } from 'src/app/shared/interfaces/product.interface';
import { ModelCodec } from 'src/app/shared/models/model-codec.model';
import { NumberCodec } from 'src/app/shared/models/number-codec.model';

@Injectable({
    providedIn: 'root',
})
export class RsocketService {
    private _stringCodec = new StringCodec();
    private _numberCodec = new NumberCodec();
    private _rsocket$!: Observable<RSocket>;
    private _rsocketRequester$!: Observable<RSocketRequester>;
    private _jwtToken =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNjY5MzM3NTE5LCJqdGkiOiI4ZmQwN2RlMy1mOWY1LTQ3MjAtODNhNC0zNGNjNjU4OWE0ODUifQ.cWVlIQIcNcfrqOLskHIKF0eeqiaw1_1qYUijANr0QGLVkRBE5OPSvnpeSEsFBt_DBvMj5ZiLfwQfOohooScHdg';

    constructor() {
        this._makeRSocketRequester();
    }

    private _makeRSocketRequester(): void {
        this._makeRSocket();
        this._rsocketRequester$ = this._rsocket$.pipe(
            map((rsocket: RSocket) => RSocketRequester.wrap(rsocket))
        );
    }

    private _makeRSocket(): void {
        const rsocketConnector = this._makeRSocketConnector();
        this._rsocket$ = from(rsocketConnector.connect());
    }

    private _makeRSocketConnector(): RSocketConnector {
        return new RSocketConnector({
            transport: new WebsocketClientTransport({
                url: 'ws://localhost:7000',
            }),
            setup: {
                payload: {
                    data: null,
                },
                dataMimeType: WellKnownMimeType.APPLICATION_JSON.toString(),
                metadataMimeType:
                    WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA.toString(),
            },
        });
    }

    fireAndForget(data: string, route: string): Observable<void> {
        return this._rsocketRequester$.pipe(
            mergeMap((requester: RSocketRequester) =>
                requester
                    .route(route)
                    .metadata(
                        WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION,
                        encodeBearerAuthMetadata(this._jwtToken)
                    )
                    .request(
                        RxRequestersFactory.fireAndForget(
                            data,
                            this._stringCodec
                        )
                    )
            )
        );
    }

    requestResponse(data: Product, route: string): Observable<Product> {
        return this._rsocketRequester$.pipe(
            mergeMap((requester: RSocketRequester) =>
                requester
                    .route(route)
                    .metadata(
                        WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION,
                        encodeBearerAuthMetadata(this._jwtToken)
                    )
                    .request(
                        RxRequestersFactory.requestResponse(
                            data,
                            new ModelCodec<Product>(),
                            new ModelCodec<Product>()
                        )
                    )
            )
        );
    }

    requestStream(payload: string[], route: string): Observable<Product> {
        return this._rsocketRequester$.pipe(
            mergeMap((requester: RSocketRequester) =>
                requester
                    .route(route)
                    .metadata(
                        WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION,
                        encodeBearerAuthMetadata(this._jwtToken)
                    )
                    .request(
                        RxRequestersFactory.requestStream(
                            payload,
                            new ModelCodec<string[]>(),
                            new ModelCodec<Product>()
                        )
                    )
            )
        );
    }

    requestChannel(
        datas: Observable<number>,
        route: string
    ): Observable<number> {
        return this._rsocketRequester$.pipe(
            mergeMap((requester: RSocketRequester) =>
                requester
                    .route(route)
                    .metadata(
                        WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION,
                        encodeBearerAuthMetadata(this._jwtToken)
                    )
                    .request(
                        RxRequestersFactory.requestChannel(
                            datas,
                            this._numberCodec,
                            this._numberCodec,
                            5
                        )
                    )
            )
        );
    }
}
