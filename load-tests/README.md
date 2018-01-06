# Load tests

## Broadcasts

Generates traffic load as similar as possible as the expected from Twilio when publishing a [Broadcast](https://github.com/DoSomething/gambit-conversations/wiki/Broadcasts) from Customer.io. This traffic will directly impact [Blink](https://github.com/DoSomething/blink), our Message Bus.

The script is a JS wrapper over [k6](https://k6.io/) - A very promising open source load testing tool. It is very flexible and powerful.

### k6 & What's inside the vucode directory?

k6 is written in [Go](https://golang.org/). It uses [goja](https://github.com/dop251/goja) as it's embedded JavaScript interpreter.

The `/vucode/index.js` file is **not** executed in [node](https://nodejs.org/en/), but interpreted inside the k6 module. "VU (Virtual User) code" is written in ES6 format and transpiled by [babel](https://babeljs.io/).

#### Some gotchas

- It's tempting to treat the VU code as the usual node script, but it isn't .
- The parser can give some cryptic errors at times. Unexpected EOF, [unintelligible errors](https://github.com/loadimpact/k6/issues/284), etc.
- Importing [browserified NPM](https://k6.readme.io/docs/modules#section-npm-modules) modules is a gamble. It can also slow down the script significantly.
- Importing [remote modules](https://docs.k6.io/v1.0/docs/modules#section-remote-modules) is also unpredictable (The module might work... or not) and slows down the script.

### Scenarios

scenario | flow | Description
--- | --- | ---
`broadcast` | C.io->B->C<br>------------- | Sends **1** requests to Blink, which relays the request to Twilio and finally, Conversations `/import-message` route.
`userResponse`* | T->B->C<br>------------- | Sends **1** request to Blink. Blink relays the request to Conversations `/receive-message` route.

>  (C.io) Customer.io. (T) Twilio. (B) Blink. (C) Conversations API.
>  * Assumes that is running parallel to a broadcast scenario (See more in **Getting Started**).


### Install (Mac)

1. `brew update`
2. `brew tap loadimpact/k6`
3. `brew install k6`
4. Navigate to the root directory of the script `/load-tests/broadcasts`.
5. `npm i` To install needed modules.
6. Update your `.env` file with correct variables. See the `.env.example` for guidance.

#### To graph metrics gathered by k6

1. `brew install influxdb`
2. `brew install grafana`

> Other ways to [install](https://docs.k6.io/docs/installation) k6.
> Instruction on how to use [influxdb + grafana](https://k6.readme.io/docs/influxdb-grafana).

### Getting Started
Inside the  `/broadcasts` directory.

1. `npm i`
2. `node mobile-nums-server.js`
3. `node index.js [OPTIONS]`

The `mobile-nums-server.js` is a WebSocket server that generates a new mobile number per `statusCallback` scenario. It is also used by the `userResponse` scenario to fetch "updated/imported" numbers to respond back.

#### Options

[Native options](https://k6.readme.io/docs/options) are passed to the k6 child process for load testing. Custom options are used by the script to add more functionality. Some custom options translate to native options internally (like **-I**).

Option | Description | native
--- | --- | --
**-u** | *Virtual Users*. A number specifying the number of VUs to run concurrently. | `T`
**-I** | *Influx*. Use influxDB to store the measurements in. | `F`
**-s** | *Scenario*. Which load test scenario to run. | `F`
**-n** | *Amount of phones*. Number of phones we will be using for this broadcast. Starts at `+15551111110`. Max is `+15559111110` (8 Million). | `F`
**--delay** | *Delay*. Delay the execution of the tests by x amount of seconds on each iteration. Used to add more flexibility when calibrating `rps`. | `F`
**--ng** | *Not Generator*. Don't use the mobile number generator. Use the env variable set mobile number for all tests | 'F'
**--rfp** | *Request Failure Percentage*. Percentage of all requests that will include the `requestFail=true` and `requestFailCount=<amount>` query parameters when posting to the broadcast webhook url. | 'F'
**--rfc** | *Request Failure Count*. Max amount of times the failure injection should be retried (in the request's final destination) | 'F'

> Not all k6 options are supported.
> --rfp and --rfc are implementation dependent at the final destination app. If logic is not implemented to consume headers set in Blink: `x-request-fail` and `x-request-fail-count`, then this options really will not mean anything to that app.

#### Examples

###### Case 1
- testing **broadcast** scenario [-s broadcast]
- **200** Virtual Users [-u 200]
- not using the number generator [--ng]
- Injecting request failure to 1% of all requests [--rfp 1]
- Instructing that the failures only get retried 24 times [--rfc 24]

##### Command
`node index.js -u 200 -n 50000 -s broadcast --rfp 1 --rfc 24 --ng`

##### Output
```

          /\      |‾‾|  /‾‾/  /‾/   
     /\  /  \     |  |_/  /  / /   
    /  \/    \    |      |  /  ‾‾\  
   /          \   |  |‾\  \ | (_) |
  / __________ \  |__|  \__\ \___/  Welcome to k6 v0.17.1!

  execution: local
     output: -
     script: /Users/rpacas/Desktop/repos/odscripts/load-tests/broadcasts/vucode/index.js (js)

   duration: 0s, iterations: 50000
        vus: 200, max: 200

    web ui: http://127.0.0.1:6565/

      done [==========================================================]     1m1.2s / 1m1.2s

    █ Test broadcast to Blink
    data_received.........: 184 kB (3.0 kB/s)
    data_sent.............: 346 kB (5.7 kB/s)
    group_duration........: avg=244.14ms max=3.13s med=220.7ms min=78.71ms p(90)=321.11ms p(95)=381.09ms
    http_req_blocked......: avg=3.9ms max=1.43s med=3.01µs min=940ns p(90)=4.79µs p(95)=6.39µs
    http_req_connecting...: avg=3.63ms max=1.43s med=0s min=0s p(90)=0s p(95)=0s
    http_req_duration.....: avg=239.89ms max=2.77s med=220.34ms min=78.4ms p(90)=318.58ms p(95)=375.5ms
    http_req_receiving....: avg=100.86µs max=154.54ms med=58.27µs min=13.78µs p(90)=98.49µs p(95)=116.32µs
    http_req_sending......: avg=33.38µs max=81.15ms med=26.43µs min=9µs p(90)=42.3µs p(95)=58.71µs
    http_req_waiting......: avg=239.76ms max=2.77s med=220.24ms min=78.23ms p(90)=318.15ms p(95)=375.19ms
    http_reqs.............: 50000 (819.672131147541/s)
    vus...................: 200
    vus_max...............: 200

k6ChildProcess exited with code 0
```

## Nice to have features

- Add [more] test scenarios.
- More cleanup.
- Add more load test scenarios.
- Make `userResponse` scenario more dynamic. Maybe use k6 stages?
