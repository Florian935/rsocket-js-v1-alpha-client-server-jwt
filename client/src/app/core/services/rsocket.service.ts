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

@Injectable({
    providedIn: 'root',
})
export class RsocketService {
    private _stringCodec = new StringCodec();
    private _rsocket$!: Observable<RSocket>;
    private _rsocketRequester$!: Observable<RSocketRequester>;

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
                        encodeBearerAuthMetadata(
                            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNjY5MzM1NjM4LCJqdGkiOiJhMjMwN2RiMS03OTNjLTRjNGQtYjExZS0xOTA4YWY2OWY0N2UifQ.oMbD1Yb2FcX7t1_TNuS73jwKarGmJudDnZUX_sTsEqEn_cQzb6WZyBTmyNt1_jzM5qsEPZQGq82V7HNsummdzg'
                        )
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

    requestResponseWithPayload(
        data: Partial<Product>,
        route: string
    ): Observable<Partial<Product>> {
        return this._rsocketRequester$.pipe(
            mergeMap((requester: RSocketRequester) =>
                this._requestResponseBuilder<Partial<Product>>(
                    requester,
                    route,
                    data
                )
            )
        );
    }

    private _requestResponseBuilder<T>(
        requester: RSocketRequester,
        route: string,
        data: T
    ): Observable<T> {
        return requester
            .route(route)
            .request(
                RxRequestersFactory.requestResponse(
                    data,
                    new ModelCodec<T>(),
                    new ModelCodec<T>()
                )
            );
    }

    requestStream(payload: string, route: string): Observable<string> {
        return this._rsocketRequester$.pipe(
            mergeMap((requester: RSocketRequester) =>
                requester
                    .route(route)
                    .request(
                        RxRequestersFactory.requestStream(
                            payload,
                            this._stringCodec,
                            this._stringCodec
                        )
                    )
            )
        );
    }

    requestChannel(
        datas: Observable<string>,
        route: string
    ): Observable<string> {
        return this._rsocketRequester$.pipe(
            mergeMap((requester: RSocketRequester) =>
                requester
                    .route(route)
                    .request(
                        RxRequestersFactory.requestChannel(
                            datas,
                            this._stringCodec,
                            this._stringCodec,
                            5
                        )
                    )
            )
        );
    }
}
