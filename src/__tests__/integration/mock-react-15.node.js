/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/* eslint-env node */

import path from 'path';
import puppeteer from 'puppeteer';

import {test} from 'fusion-test-utils';
import {dev} from 'fusion-cli/test/run-command';

// Create Mocks
jest.mock('react', () => () => {
  const React = require('react');
  return {...React, Fragment: undefined};
});

test(
  'able to do simple translations',
  async t => {
    const dir = path.resolve(__dirname, '../../../app-fixture');
    const {proc, port} = await dev(`--dir=${dir}`);
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    const allUrls = [];

    // enable request interception
    await page.setRequestInterception(true);
    page.on('request', request => {
      // Add a new header for navigation request.
      const headers = request.headers();
      headers['accept-language'] = 'en-US,en';
      request.continue({...request, _headers: headers});
    });

    page.on('response', response => {
      const req = response.request();
      allUrls.push(req.url());
    });

    await page.goto(`http://localhost:${port}/`, {waitUntil: 'load'});
    const content = await page.content();

    // Wrapper <span>s
    t.ok(
      content.includes(`<div id="root"><div>hello world</span></div></div>`)
    );

    await browser.close();
    proc.kill();
  },
  // $FlowFixMe - Need to add timeouts
  60000
);
