# Load tester
Contains load testing scripts. Each script can be implemented independent of the others. They don't share modules or philosophy. This is just a repo for scripts that will load test services.

# Load test scripts

## Broadcasts [script](./load-tests/broadcasts)
Load testing broadcasts consist on attempting to generate the same traffic we expect from Twilio when publishing a [Broadcast](https://github.com/DoSomething/gambit-conversations/wiki/Broadcasts) from Customer.io. This traffic will directly impact out Message Bus [Blink](https://github.com/DoSomething/blink).

This script is a JS wrapper over [k6](https://k6.io/) - A very promising open source load testing tool. It is very flexible and powerful. The features currently implemented in the wrapper are basic and don't use the vast amount of other capabilities built into k6.

### k6 & What's inside the vucode directory?

k6 is written in [Go](https://golang.org/). It uses [goja](https://github.com/dop251/goja) as it's embedded JavaScript interpreter.

The `/vucode/index.js` file is **not** executed in [node](https://nodejs.org/en/), but interpreted inside the k6 module. "VU (Virtual User) code" is written in ES6 format and transpiled by [babel](https://babeljs.io/).

#### Some gotchas

- It's tempting to treat the VU code as the usual node script, but it isn't .
- The parser can give some cryptic syntax errors if you are not careful with how you write your JS code. Unexpected EOF, etc.
- Can't just import any NPM modules easily. You can, [using browserify](https://k6.readme.io/docs/modules#section-npm-modules), but it doesn't work with all packages, plus it slows down the script significantly.
- **You can** import your own [ES6 modules](https://docs.k6.io/v1.0/docs/modules#section-es6-modules) and [remote modules](https://docs.k6.io/v1.0/docs/modules#section-remote-modules) (slow) though.
- When importing your own modules, you have to declare the extension `.js`.


### How to setup
There are many ways to get k6 installed. The steps here work for `Mac` dev environment using `homebrew` which is compatible with this wrapper.

1. `brew update`
2. `brew tap loadimpact/k6`
3. `brew install k6`
4. Navigate to the root directory of the script `/load-tests/broadcasts`.
5. `npm i` To install needed modules.
6. Update your `.env` file with correct variables. See the `.env.example` for guidance.

#### To graph metrics gathered by k6.**

1. `brew install influxdb`
2. `brew install grafana`

> Instruction on how to use [influxdb + grafana](https://k6.readme.io/docs/influxdb-grafana).
> ** Not supported in this script, yet.

### How to use
While in the root directory of the broadcast script `/load-tests/broadcasts`.

1. `node index.js [OPTIONS]`

#### Options
Options passed to the k6 child process for load testing. More info on what they mean can be found in the [k6 docs - options](https://k6.readme.io/docs/options).

Option | Description
--- | ---
**-d** | *Duration*. A string specifying the total duration a test run should be run for.
**-i** | *Iterations*. A number specifying a fixed number of iterations to execute of the script.
**-u** | *Virtual Users*. A number specifying the number of VUs to run concurrently.

> Not all options are supported. Likewise, only short options are supported.
> **-d**: good. **--duration**: Not supported.

#### Examples

###### Case 1
Load test with **5** Virtual User for a duration of **10** seconds.
##### Comand
`node index.js -u 5 -d 10s`

##### Output
```
          /\      |‾‾|  /‾‾/  /‾/   
     /\  /  \     |  |_/  /  / /   
    /  \/    \    |      |  /  ‾‾\  
   /          \   |  |‾\  \ | (_) |
  / __________ \  |__|  \__\ \___/  Welcome to k6 v0.17.1!

  execution: local
     output: -
     script: /Users/rpacas/Desktop/repos/odscripts/load-tester/load-tests/broadcasts/vucode/index.js (js)

   duration: 10s, iterations: 0
        vus: 5, max: 5

    web ui: http://127.0.0.1:6565/

    ✓ gettingSettingsStatus200
    ✓ sendingStatusCallbackStatusUpdateQueued204
    ✓ sendingStatusCallbackStatusUpdateSent204
    ✓ sendingStatusCallbackStatusUpdateDelivered204

    checks................: 100.00%
    data_received.........: 25 kB (2.5 kB/s)
    data_sent.............: 11 kB (1.1 kB/s)
    http_req_blocked......: avg=56.3ms max=453.79ms med=3.45µs min=1.58µs p(90)=292.34ms p(95)=444.91ms
    http_req_connecting...: avg=14.88ms max=101.71ms med=0s min=0s p(90)=94.46ms p(95)=100.91ms

    http_req_duration.....: avg=130.97ms max=552.95ms med=97.13ms min=88.51ms p(90)=115.98ms p(95)=514.07ms
    http_req_receiving....: avg=56.43µs max=121.99µs med=48.42µs min=25.98µs p(90)=89.4µs p(95)=99.04µs
    http_req_sending......: avg=19.73ms max=258.93ms med=28.77µs min=13.15µs p(90)=93.62µs p(95)=255.36ms
    http_req_waiting......: avg=111.18ms max=293.96ms med=97.04ms min=88.44ms p(90)=115.84ms p(95)=260.38ms
    http_reqs.............: 65 (6.5/s)
    vus...................: 5
    vus_max...............: 5
```
###### Case 2
Load test with **2** Virtual User for **10** iterations.
##### Comand
`node index.js -u 2 -i 10`

##### Output

```
          /\      |‾‾|  /‾‾/  /‾/   
     /\  /  \     |  |_/  /  / /   
    /  \/    \    |      |  /  ‾‾\  
   /          \   |  |‾\  \ | (_) |
  / __________ \  |__|  \__\ \___/  Welcome to k6 v0.17.1!

  execution: local
     output: -
     script: /Users/rpacas/Desktop/repos/odscripts/load-tester/load-tests/broadcasts/vucode/index.js (js)

   duration: 0s, iterations: 10

        vus: 2, max: 2

    web ui: http://127.0.0.1:6565/

    ✓ sendingStatusCallbackStatusUpdateSent204

    ✓ sendingStatusCallbackStatusUpdateDelivered204
    ✓ gettingSettingsStatus200
    ✓ sendingStatusCallbackStatusUpdateQueued204

    checks................: 100.00%
    data_received.........: 9.9 kB (705 B/s)
    data_sent.............: 4.4 kB (311 B/s)
    http_req_blocked......: avg=37.37ms max=428.9ms med=3.03µs min=1.54µs p(90)=168.96ms p(95)=423.55ms
    http_req_connecting...: avg=11.32ms max=93.45ms med=0s min=0s p(90)=87.53ms p(95)=93.38ms
    http_req_duration.....: avg=117.35ms max=432.93ms med=95.33ms min=90.27ms p(90)=107.6ms p(95)=427.16ms
    http_req_receiving....: avg=98.35µs max=1.47ms med=46.37µs min=25.21µs p(90)=88.65µs p(95)=118.65µs
    http_req_sending......: avg=15.83ms max=253.96ms med=25.44µs min=15.34µs p(90)=88.37µs p(95)=251.82ms
    http_req_waiting......: avg=101.41ms max=178.86ms med=95.2ms min=90.21ms p(90)=107.42ms p(95)=175.24ms

    http_reqs.............: 32 (2.2857142857142856/s)
    vus...................: 2
    vus_max...............: 2
```

## Nice to have features

- Support for long options.
- Adding load test "recipies", selectable via options.
- Support for [influxDB](https://docs.influxdata.com/influxdb/v1.3/introduction/getting_started/) integration for data persistence and visualization in [Grafana](http://docs.grafana.org/).
