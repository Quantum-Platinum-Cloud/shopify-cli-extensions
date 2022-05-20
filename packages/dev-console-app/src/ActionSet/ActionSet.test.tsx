import React from 'react';
import {mockExtension} from '@shopify/ui-extensions-server-kit/testing';
import {ExtensionServerClient} from '@shopify/ui-extensions-server-kit';
import {render, withProviders} from '@shopify/shopify-cli-extensions-test-utils';
import {mockI18n} from 'tests/mock-i18n';
import {DefaultProviders} from 'tests/DefaultProviders';

import en from './translations/en.json';
import {Action} from './Action';
import {ActionSet} from './ActionSet';

jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

const i18n = mockI18n(en);

describe('ActionSet', () => {
  function TableWrapper({children}: React.PropsWithChildren<{}>) {
    return (
      <table>
        <tbody>
          <tr>{children}</tr>
        </tbody>
      </table>
    );
  }

  it('calls refresh with given extension when refresh button is clicked', async () => {
    const extension = mockExtension();
    const client = new ExtensionServerClient({connection: {url: 'ws://localhost'}});
    const sendSpy = jest.spyOn(client.connection, 'send').mockImplementation();
    const container = render(
      <ActionSet extension={extension} />,
      withProviders(DefaultProviders, TableWrapper),
      {client},
    );

    container.find(Action, {accessibilityLabel: i18n.translate('refresh')})?.trigger('onAction');

    expect(sendSpy).toHaveBeenCalledWith(
      JSON.stringify({
        event: 'dispatch',
        data: {type: 'refresh', payload: [{uuid: extension.uuid}]},
      }),
    );
  });

  it('calls show with given extension when show button is clicked', async () => {
    const extension = mockExtension({development: {hidden: true}});
    const client = new ExtensionServerClient({connection: {url: 'ws://localhost'}});
    const sendSpy = jest.spyOn(client.connection, 'send').mockImplementation();
    const container = render(
      <ActionSet extension={extension} />,
      withProviders(DefaultProviders, TableWrapper),
      {client},
    );

    container.find(Action, {accessibilityLabel: i18n.translate('show')})?.trigger('onAction');

    expect(sendSpy).toHaveBeenCalledWith(
      JSON.stringify({
        event: 'update',
        data: {extensions: [{uuid: extension.uuid, development: {hidden: false}}]},
      }),
    );
  });

  it('calls hide with given extension when hide button is clicked', async () => {
    const extension = mockExtension({development: {hidden: false}});
    const client = new ExtensionServerClient({connection: {url: 'ws://localhost'}});
    const sendSpy = jest.spyOn(client.connection, 'send').mockImplementation();
    const container = render(
      <ActionSet extension={extension} />,
      withProviders(DefaultProviders, TableWrapper),
      {client},
    );

    container.find(Action, {accessibilityLabel: i18n.translate('hide')})?.trigger('onAction');

    expect(sendSpy).toHaveBeenCalledWith(
      JSON.stringify({
        event: 'update',
        data: {extensions: [{uuid: extension.uuid, development: {hidden: true}}]},
      }),
    );
  });
});
