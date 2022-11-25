import { Component, OnInit } from '@angular/core';
import {
  encodeCompositeMetadata,
  encodeRoute,
  encodeSimpleAuthMetadata,
  WellKnownMimeType,
} from 'rsocket-composite-metadata';
import {
  Cancellable,
  MAX_REQUEST_N,
  OnExtensionSubscriber,
  OnNextSubscriber,
  OnTerminalSubscriber,
  Requestable,
  RSocket,
  RSocketConnector,
} from 'rsocket-core';
import { WebsocketClientTransport } from 'rsocket-websocket-client';
import { from, fromEvent, map, Observable, Observer, tap } from 'rxjs';
import { Product } from './shared/interfaces/product.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
