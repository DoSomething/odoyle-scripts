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
--- | ---
`statusCallback` | T->B->C<br>------------- | Sends **3** requests to Blink. One per status change in Twilio (queued, sent, delivered). Blink's worker relays the request with `delivered` status to Conversations `/import-message` route. The rest are skipped.
`userResponse` | T->B->C<br>------------- | Sends **1** request to Blink. Blink relays the request to Conversations `/receive-message` route.

>  (T) Twilio. (B) Blink. (C) Conversations API.


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
2. `node index.js [OPTIONS]`

#### Options

[Native options](https://k6.readme.io/docs/options) are passed to the k6 child process for load testing. Custom options are used by the script to add more functionality. Some custom options translate to native options internally (like **-I**).

Option | Description | native
--- | --- | --
**-u** | *Virtual Users*. A number specifying the number of VUs to run concurrently. | `T`
**-I** | *Influx*. Use influxDB to store the measurements in. | `F`
**-s** | *Scenario*. Which load test scenario to run. | `F`
**-n** | *Amount of phones*. Number of phones we will be using for this broadcast. Starts at `+15551111110`. Max is `+15552111110`. | `F`
**--delay** | *Delay*. Delay the execution of the tests by x amount of seconds on each iteration. Used to add more flexibility when calibrating `rps`. **(not fully implemented yet)** | `F`

> Not all k6 options are supported.

#### Examples

###### Case 1
Load test **statusCallback** scenario with **5** Virtual Users, using **10** numbers.
##### Command
`node index.js -u 5 -n 10 -s statusCallback`

##### Output
```
TBD
```
###### Case 2
Load test **statusCallback** scenario with **2** Virtual Users, using **100** numbers, using influxDB to store metrics.
##### Command
`node index.js -u 2 -n 100 -I -s statusCallback`

##### Output

```
TBD
```

## Nice to have features

- Add more load test scenarios.
