import { create } from 'lodash';
import { Client } from '../client/client';
import { ClientView } from '../client/client-view';
import { createElement } from '../common/util';

export class VirtualClient {
  output: HTMLElement;
  input: HTMLElement;
  debug: HTMLElement;
  clientView: ClientView;
  client: Client;

  constructor(el: HTMLElement, name: string, client: Client) {
    el.append(this.createHTML(name));

    this.client = client;

    this.clientView = new ClientView({
      input: this.input,
      output: this.output,
      debug: this.debug,
      client,
    });
  }

  createHTML(name: string) {
    return createElement('div', {
      classList: ['console'],
      children: [
        createElement('div', {
          classList: ['console-section'],
          children: [
            name,
            createElement('span', {
              classList: ['float-right'],
              children: [
                createElement('lablel', {
                  children: ['Debug'],
                  attributes: { for: 'enable-debug' },
                }),
                (this.debug = createElement('input', {
                  attributes: { type: 'checkbox', checked: 'true' },
                })),
              ],
            }),
          ],
        }),

        createElement('div', {
          classList: ['console-section', 'log'],
          children: [
            (this.output = createElement('div', {
              classList: ['text-output'],
            })),
          ],
        }),

        (this.input = createElement('input', {
          classList: ['console-section', 'command'],
          attributes: {
            type: 'text',
            placeholder: '>',
          },
        })),
      ],
    });
  }
}
