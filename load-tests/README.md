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
`userResponse`* | T->B->C<br>------------- | Sends **1** request to Blink. Blink relays the request to Conversations `/receive-message` route.

>  (T) Twilio. (B) Blink. (C) Conversations API.
>  * Use only as a second running script in a separate terminal. After statusCallback. See more in **Getting Started**.


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
**-n** | *Amount of phones*. Number of phones we will be using for this broadcast. Starts at `+15551111110`. Max is `+15552111110`. | `F`
**--delay** | *Delay*. Delay the execution of the tests by x amount of seconds on each iteration. Used to add more flexibility when calibrating `rps`. **(not implemented yet)** | `F`

> Not all k6 options are supported.

#### Examples

###### Case 1
Load test **statusCallback** scenario with **5** Virtual Users, using **10** numbers.
##### Command
`node index.js -u 5 -n 10 -s statusCallback`

##### Output
```

          /\      |‾‾|  /‾‾/  /‾/   
     /\  /  \     |  |_/  /  / /   
    /  \/    \    |      |  /  ‾‾\  
   /          \   |  |‾\  \ | (_) |
  / __________ \  |__|  \__\ \___/  Welcome to k6 v0.17.1!

  execution: local
     output: -
     script: /Users/<username>/Desktop/repos/odscripts/load-tests/broadcasts/vucode/index.js (js)

   duration: 0s, iterations: 10
        vus: 5, max: 5

    web ui: http://127.0.0.1:6565/

      done [==========================================================]       2.7s / 2.7s

    █ Test statusCallbacks to Blink

      ✗ sendingStatusCallbackStatusUpdateQueued204
            100.00% (10/10)
      ✗ sendingStatusCallbackStatusUpdateSent204
            100.00% (10/10)
      ✗ sendingStatusCallbackStatusUpdateDelivered204
            100.00% (10/10)

    checks................: 0.00%
    data_received.........: 25 kB (13 kB/s)
    data_sent.............: 10 kB (5.1 kB/s)
    group_duration........: avg=1.36s max=1.73s med=1.36s min=985.95ms p(90)=1.73s p(95)=1.73s
    http_req_blocked......: avg=80.64ms max=486.46ms med=2.57µs min=1.29µs p(90)=485.08ms p(95)=485.28ms
    http_req_connecting...: avg=18.66ms max=120.39ms med=0s min=0s p(90)=112.86ms p(95)=113.86ms
    http_req_duration.....: avg=420.87ms max=719.26ms med=432.26ms min=206.6ms p(90)=710.84ms p(95)=718.99ms
    http_req_receiving....: avg=54.3µs max=106.61µs med=50.64µs min=27.8µs p(90)=94.56µs p(95)=97.67µs
    http_req_sending......: avg=46.43ms max=283.52ms med=23.77µs min=11.85µs p(90)=277.77ms p(95)=282.89ms
    http_req_waiting......: avg=374.38ms max=719.16ms med=305.38ms min=206.52ms p(90)=710.72ms p(95)=718.91ms
    http_reqs.............: 30 (15/s)
    vus...................: 5
    vus_max...............: 5
    ws_connecting.........: avg=6.05ms max=11.86ms med=5.84ms min=868.73µs p(90)=11.86ms p(95)=11.86ms
    ws_msgs_received......: 10 (5/s)
    ws_msgs_sent..........: 10 (5/s)
    ws_session_duration...: avg=8.91ms max=16.8ms med=8.78ms min=1.24ms p(90)=16.8ms p(95)=16.8ms
    ws_sessions...........: 10 (5/s)
```
###### Case 2
Load test **statusCallback** scenario with **2** Virtual Users, using **100** numbers, using **influxDB** to store metrics in a database called **test1**.
##### Command
`node index.js -u 2 -n 100 -s statusCallback -I test1`

##### Output

```

          /\      |‾‾|  /‾‾/  /‾/   
     /\  /  \     |  |_/  /  / /   
    /  \/    \    |      |  /  ‾‾\  
   /          \   |  |‾\  \ | (_) |
  / __________ \  |__|  \__\ \___/  Welcome to k6 v0.17.1!

  execution: local
     output: influxdb (localhost:8086)
     script: /Users/<username>/Desktop/repos/odscripts/load-tests/broadcasts/vucode/index.js (js)

   duration: 0s, iterations: 100
        vus: 2, max: 2

    web ui: http://127.0.0.1:6565/

      done [==========================================================]      53.8s / 53.8s

    █ Test statusCallbacks to Blink

      ✗ sendingStatusCallbackStatusUpdateQueued204
            100.00% (100/100)
      ✗ sendingStatusCallbackStatusUpdateSent204
            100.00% (100/100)
      ✗ sendingStatusCallbackStatusUpdateDelivered204
            100.00% (100/100)

    checks................: 0.00%
    data_received.........: 27 kB (511 B/s)
    data_sent.............: 24 kB (455 B/s)
    group_duration........: avg=1.07s max=3.13s med=993.29ms min=971.05ms p(90)=1.07s p(95)=1.64s
    http_req_blocked......: avg=3.88ms max=582.59ms med=3.53µs min=1.74µs p(90)=5.35µs p(95)=7.86µs
    http_req_connecting...: avg=698.17µs max=107.05ms med=0s min=0s p(90)=0s p(95)=0s
    http_req_duration.....: avg=356.01ms max=2.71s med=212.23ms min=202.15ms p(90)=582.13ms p(95)=619.99ms
    http_req_receiving....: avg=89.78µs max=2.04ms med=73.16µs min=42.55µs p(90)=130.06µs p(95)=148.08µs
    http_req_sending......: avg=1.92ms max=285.63ms med=29.89µs min=20.09µs p(90)=48.49µs p(95)=63.08µs
    http_req_waiting......: avg=354ms max=2.71s med=212.14ms min=202.06ms p(90)=581.89ms p(95)=619.9ms
    http_reqs.............: 300 (5.660377358490566/s)
    vus...................: 2
    vus_max...............: 2
    ws_connecting.........: avg=1.03ms max=3.72ms med=929.71µs min=616.88µs p(90)=1.27ms p(95)=1.8ms
    ws_msgs_received......: 100 (1.8867924528301887/s)
    ws_msgs_sent..........: 100 (1.8867924528301887/s)
    ws_session_duration...: avg=1.52ms max=4.83ms med=1.35ms min=969.39µs p(90)=1.92ms p(95)=2.59ms
    ws_sessions...........: 100 (1.8867924528301887/s)

```

## Nice to have features

- DRY and cleanup code.
- Add more load test scenarios.
- Make `userResponse` scenario more dynamic. Maybe use k6 stages?
