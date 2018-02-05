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
3. `node index.js [OPTIONS]`

#### Options

[Native options](https://k6.readme.io/docs/options) are passed to the k6 child process for load testing. Custom options are used by the script to add more functionality. Some custom options translate to native options internally (like **-I**).

Option | Description | native
--- | --- | --
**-u** | *Virtual Users*. A number specifying the number of VUs to run concurrently. | `T`
**-I** | *Influx*. Use influxDB to store the measurements in. | `F`
**-s** | *Scenario*. Which load test scenario to run. | `F`
**-n** | *Amount of requests*. Number of requests to send in this test. | `F`
**--delay** | *Delay*. Delay the execution of the tests by x amount of seconds on each iteration. Used to add more flexibility when calibrating `rps`. | `F`
**--rfp** | *Request Failure Percentage*. Percentage of all requests that will include the `requestFail=true` and `requestFailCount=<see --rfc>` query parameters when posting to the broadcast webhook url. | `F`
**--rfc** | *Request Failure Count*. Max amount of times the failure injection should be retried (in the request's final destination) | `F`

> Not all k6 options are supported.
> --rfp and --rfc are implementation dependent.

#### Examples

###### Case 1
- testing **broadcast** scenario [-s broadcast]
- **1** Virtual Users [-u 1]
- **1** Iteration [-n 1]

##### Command
`node index.js -u 1 -n 1 -s broadcast`

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

duration: 0s, iterations: 1
vus: 1, max: 1

web ui: http://127.0.0.1:6565/

done [==========================================================]      200ms / 200ms

█ Test broadcast to Blink
data_received.........: 306 B
data_sent.............: 346 B
group_duration........: avg=281.65ms max=281.65ms med=281.65ms min=281.65ms p(90)=281.65ms p(95)=281.65ms
http_req_blocked......: avg=176.08ms max=176.08ms med=176.08ms min=176.08ms p(90)=176.08ms p(95)=176.08ms
http_req_connecting...: avg=88.42ms max=88.42ms med=88.42ms min=88.42ms p(90)=88.42ms p(95)=88.42ms
http_req_duration.....: avg=105.11ms max=105.11ms med=105.11ms min=105.11ms p(90)=105.11ms p(95)=105.11ms
http_req_receiving....: avg=111.96µs max=111.96µs med=111.96µs min=111.96µs p(90)=111.96µs p(95)=111.96µs
http_req_sending......: avg=405.77µs max=405.77µs med=405.77µs min=405.77µs p(90)=405.77µs p(95)=405.77µs
http_req_waiting......: avg=104.59ms max=104.59ms med=104.59ms min=104.59ms p(90)=104.59ms p(95)=104.59ms
http_reqs.............: 1
vus...................: 1
vus_max...............: 1

k6ChildProcess exited with code 0
```

## Nice to have features

- Add more test scenarios for broadcast.
- Add more load test scripts.
- Implement new `userResponse` scenario. (Note to self: explore k6 stages)
