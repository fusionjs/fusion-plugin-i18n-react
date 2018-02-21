# fusion-plugin-i18n-react

[![Build status](https://badge.buildkite.com/fd8fcdba7b74ed2e6dcbca1b5c4998797b400f536029c45483.svg?branch=master)](https://buildkite.com/uberopensource/fusion-plugin-i18n-react)

Adds I18n (Internationalization) string support to a Fusion.js app.

This plugin looks for translations in the `./translations` folder by default.  Translations for each language are expected to be in a JSON file with a [locale](https://www.npmjs.com/package/locale) as a filename.  For example, for U.S. English, translations should be in `./translations/en-US.json`.  Language tags are dictated by your browser, and likely follow the [RFC 5646](https://tools.ietf.org/html/rfc5646) specification.

For date I18n, consider using [date-fns](https://date-fns.org/).

---

### Table of contents

* [fusion-plugin-i18n-react](#fusion-plugin-i18n-react)
  * [Installation](#installation)
  * [Usage](#usage)
    * [React component](#react-component)
    * [Higher order component](#higher-order-component)
    * [Examples of translation files](#examples-of-translation-files)
  * [Setup](#setup)
  * [API](#api)
    * [Registration API](#registration-api)
      * [`I18nLoaderToken`](#i18nloadertoken)
      * [`HydrationStateToken`](#hydrationstatetoken)
      * [`FetchToken`](#fetchtoken)
    * [Service API](#service-api)
    * [React component](#react-component-1)
    * [Higher order component](#higher-order-component-1)
  * [Other examples](#other-examples)
      * [Custom translations loader example](#custom-translations-loader-example)

---

### Installation

```sh
yarn add fusion-plugin-i18n-react
```

---

### Example

```js
// src/main.js
import React from 'react';
import App from 'fusion-react';
import I18n, {I18nToken, I18nLoaderToken, createI18nLoader} from 'fusion-plugin-i18n-react';
import {FetchToken} from 'fusion-tokens';
import fetch from 'unfetch';
import Hello from './hello';

export default () => {
  const app = new App(<div></div>);

  app.register(I18nToken, I18n);
  __NODE__
    ? app.register(I18nLoaderToken, createI18nLoader())
    : app.register(FetchToken, fetch);

  app.register(Hello);

  return app;
}

// src/hello.js
import {I18nToken} from 'fusion-plugin-i18n-react';

export default createPlugin({
  deps: {I18n: I18nToken},
  middleware: ({I18n}) => (ctx, next) => {
    // use the service
    if (__NODE__ && ctx.path === '/hello') {
      const i18n = I18n(ctx);
      ctx.body = {
        message: i18n.translate('test', {name: 'world'}), // hello world
      }
    }
    return next();
  }
}

#### React component

If you are using React, we recommend using the supplied `Translate` component.

```js
import React from 'react';
import {Translate, withTranslations} from 'fusion-plugin-i18n-react';

export default () => {
  return <Translate id="test" data={{name: 'world'}} />);
});
```

#### Higher order component

A higher order component is provided to allow passing translations to third-party or native components.  If you are using the `translate` function directly, be aware that you can only pass in a string literal to this function.  This plugin uses a babel transform and non-string literals (e.g. variables) will break.

```js
import React from 'react';
import {Translate, withTranslations} from 'fusion-plugin-i18n-react';

export default withTranslations(['test'])(({translate}) => {
  return <input placeholder={translate('test', {name: 'world'})} />;
});
```

#### Examples of translation files

The default loader expects translation files to live in `./translations/{locale}`.

`./translations/en-US.json`

```json
{
  "HomeHeader": "Welcome!",
  "Greeting": "Hello, ${name}"
}
```

`./translations/pt-BR.json`

```json
{
  "HomeHeader": "Benvindo!",
  "Greeting": "Olá, ${name}"
}
```

Usage:

```js
<Translate id="HomeHeader" />
<Translate id="Greeting" data={{name: user.name}} />
```

### Setup

```js
// src/main.js
import React from 'react';
import App from 'fusion-react';
import I18n, {I18nToken, I18nLoaderToken, createI18nLoader} from 'fusion-plugin-i18n-react';
import {FetchToken} from 'fusion-tokens';
import fetch from 'unfetch';

export default () => {
  const app = new App(<div></div>);

  app.register(I18nToken, I18n);
  __NODE__
    ? app.register(I18nLoaderToken, createI18nLoader())
    : app.register(FetchToken, fetch);

  return app;
}
```

---

### API

#### Registration API

##### `I18nLoaderToken`

```js
import {I18nLoaderToken} from 'fusion-plugin-i18n-react';
```

A function that provides translations.  Optional.  Server-side only.

**Type**
```js
type I18nLoader = {
  from: (ctx: Context) => ({locale: string, translations: Object})
};
```
- `loader.from: (ctx) => ({locale, translations})` -
  - `ctx: FusionContext` - Required. A [FusionJS context](https://github.com/fusionjs/fusion-core#context) object.
  - `locale: Locale` - A [Locale](https://www.npmjs.com/package/locale)
  - `translations: Object` - A object that maps translation keys to translated values for the given locale

**Default value**

If no loader is provided, the default loader will read translations from `./translations/{locale}.json`.  See [src/loader.js](https://github.com/fusionjs/fusion-plugin-i18n/blob/master/src/loader.js#L12) for more details.

##### `HydrationStateToken`

```js
import {HydrationStateToken} from 'fusion-plugin-i18n-react';
```

Sets the hydrated state in the client, and can be useful for testing purposes.  Optional.  Browser only.

**Type**
```js
type HydrationState = {
  chunks: Array,
  translations: Object
};
```

**Default value**

If no hydration state is provided, this will be an empty object (`{}`) and have no effect.

##### `FetchToken`

```js
import {FetchToken} from 'fusion-tokens';
```

A [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) implementation.  Browser-only.

**Type**
```js
type Fetch = (url: string, options: Object) => Promise<Response>;
```

- `url: string` - Required.  Path or URL to the resource you wish to fetch.
- `options: Object` - Optional.  You may optionally pass an `init` options object as the second argument.  See [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) for more details.
- `[return]: Promise<Request>` - Return value from fetch.  See [Response](A function that loads appropriate translations and locale information given an HTTP request context) for more details.

**Default value**

If no fetch implementation is provided, [`window.fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) is used.

#### Service API

```js
const translations: string = i18n.translate(key: string, interpolations: Object)
```

- `key: string` - A translation key. When using `createI18nLoader`, it refers to a object key in a translation json file.
- `interpolations: object` - A object that maps an interpolation key to a value. For example, given a translation file `{"foo": "${bar} world"}`, the code `i18n.translate('foo', {bar: 'hello'})` returns `"hello world"`.
- `translation: string` - A translation, or `key` if a matching translation could not be found.

#### React component

If you are using React, we recommend using the supplied `Translate` component.

```js
import {Translate} from 'fusion-plugin-i18n-react';

<Translate id="key" data={interpolations} />;
```

- `key: string` - Required. Must be a hard-coded value. This plugin uses a babel transform, i.e you cannot pass a value via JSX interpolation.
- `interpolations: Object` - Optional. Replaces `${value}` interpolation placeholders in a translation string with the property of the specified name.

#### Higher order component

A higher order component is provided to allow passing translations to third-party or native components.  If you are using the `translate` function directly, be aware that you can only pass in a string literal to this function.  This plugin uses a babel transform and non-string literals (e.g. variables) will break.

```js
import {withTranslations} from 'fusion-plugin-i18n-react';

const TranslatedComponent = withTranslations(['key'])(Component);
```

Be aware that the `withTranslations` function expects an array of string literals. This plugin uses a babel transform and the argument to this function must be an inline value, i.e. you cannot pass a variable.

The original `Component` receives a prop called `{translate}`.

**Types**
```js
type TranslateProp = {
  translate: (key: string, interpolations: Object) => string
};
type WithTranslations = (translationKeys: Array<string>) => React.Component<Props> => React.Component<Props & TranslateProp>;
```

- `translationKeys: Array<string>` - list of keys with which to provide translations for.
- `translate: (key: string, interpolations: Object) => string` - returns the translation for the given key, with the provided interpolations.

---

### Other examples

##### Custom translations loader example

```js
// src/main.js
import React from 'react';
import App from 'fusion-react';
import I18n, {I18nToken, I18nLoaderToken} from 'fusion-plugin-i18n-react';
import {FetchToken} from 'fusion-tokens';
import fetch from 'unfetch';
import Hello from './hello';
import I18nLoader from './translations';

export default () => {
  const app = new App(<div></div>);

  app.register(I18nToken, I18n);
  __NODE__
    ? app.register(I18nLoaderToken, I18nLoader);
    : app.register(FetchToken, fetch);

  app.register(Hello);

  return app;
}

// src/hello.js
import {I18nToken} from 'fusion-plugin-i18n-react';

export default withDependencies({I18n: I18nToken})(({I18n}) => {
  return withMiddleware((ctx, next) => {
    if (__NODE__ && ctx.path === '/hello') {
      const i18n = I18n(ctx);
      ctx.body = {
        message: i18n.translate('test', {name: 'world'}), // hello world
      }
    }
    return next();
  });
});

// src/translation-loader.js
import {Locale} from 'locale';

const translationData = {
  'en-US': {
    test: "hello ${name}"
  }
}

export default (ctx) => {
  // locale could be determined in different ways,
  // e.g. from ctx.headers['accept-language'] or from a /en-US/ URL
  const locale = new Locale('en-US');
  const translations = translationData[locale];
  return {locale, translations};
}
```
