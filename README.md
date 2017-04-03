# lokka-transport-http-retry
This is a fork of the basic "Isomorphic HTTP Transport Layer" for [Lokka](https://github.com/kadirahq/lokka). 

Lokka's great for `node` projects, but I found I was clumsily wrapping most of my operations in retry logic, so I decided to just add that functionality into the network layer, as it is in `react-relay`'s network layer. 

The underlying network layer is pretty reliable, but the retry functionality I've added hasn't been extensively tested in production. If you use it & find issues, please post in this repo.  Or better yet: write a test that shows the problem.  Or, best of all: fix them & help bring a more fully-featured gql client to `node` <3.

## Retries

This layer supports retries courtesy of [async-retry](https://github.com/zeit/async-retry). The default config will retry 3 times & throw afterwards if it isn't successful. 

To configure retries, pass options to the constructor under the `retryOptions` key of the `options` object. You can pass the following options:


`retries (number)`: The total number of retries to make before aborting.

`checkShouldAbortRetry ((response: Response) => ?Error)`: By default, fetch retries on non-200 and non-400 errors. If you want to abort future retries (eg, if you get a response you know means retries will fail), just return (not throw) an error.

`onRetry ((retryCount, err) => void)`: This is called before each retry. Useful for logging.  Also, if you get an error you know means future retries will fail, you can throw in this function & stop future retries. 


Example:
```js
import HttpTransport from 'lokka-transport-http';

const headers = {
    'my-headers': 'some-value'
};
const retryOptions = {
    retries: 5,
    onRetry: (retryCount, err) => { console.log(`Failed attempt # ${retryCount} with message: ${err.message}`) },
    checkShouldAbortRetry: (response) => { if (response.status === 404) throw new Error('404! aborting retries.')}
  };

const transport = new HttpTransport('http://graphql-swapi.parseapp.com/', 
{ headers, retryOptions }
);

transport.send(`
    {
      allFilms {
        films {
          title
        }
      }
    }
`).then(response => {
    console.log(JSON.stringify(response, null, 2));
});

```



# From the original repo: 
---

This is a [graphql-express](https://github.com/graphql/express-graphql) compatible transport layer for [Lokka](https://github.com/kadirahq/lokka).

## Basic Usage

Install the package:

```
npm i --save lokka-transport-http
npm i --save lokka
```

This is how to send request to Facebook's [SWAPI GraphQL Demo](http://graphql-swapi.parseapp.com/).

```js
import HttpTransport from 'lokka-transport-http';
const transport = new HttpTransport('http://graphql-swapi.parseapp.com/');
transport.send(`
    {
      allFilms {
        films {
          title
        }
      }
    }
`).then(response => {
    console.log(JSON.stringify(response, null, 2));
});
```

## Send Custom Headers

It's possible to send custom headers like this:

```js
const headers = {
    'my-headers': 'some-value'
};
const transport = new HttpTransport('/graphql', {headers});
```

## Authentication

This package does not handle authentication information for you. But it'll let you interact with your app's existing authentication mechanism.

* If you already have an authorized cookie, it'll be sent with the HTTP request. (supports CORS)
* You can also set a custom `Authorization` [header]((https://www.npmjs.com/package/basic-auth-header) to implement [basic-auth](https://www.npmjs.com/package/basic-auth) support.

## Error Handling

By default it will create and throw a new `Error` object using the first GraphQL error. Error handling can be customized with the `handleErrors` option. Check the deafult error handler in `lib/index.js` for an example.


