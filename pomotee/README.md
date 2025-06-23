# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## thought dump

```json
{
  "date": "2025-06-20",
  "current": {
    "startTime": "2025-06-19T13:38:17.997Z",
    "endTime": "2025-06-19T14:00:17.997Z", // time at pause or end of pomo(s)
    "pomoLengthMin": 22, // can change between pomos
    "pomoLengthSec": 1320, // 22 * 60
    "pomoProgress": 1300, // seconds, pomo time elapsed, opposite of timer count down
    "totalPomos": 0 // ideally 1, but can be multiple, int only = 1, 2, 3, ...
  },
  "done": [],
  "dayPomos": 1
}
```

- since you have the `pomoLengthMin` and `startTime` everything is calculated against this
- from `now` you can work out if pomo in progress, done, or multi-done
- then set `endTime`

- ideally, `totalPomos` should be 1, then new pomo object
- data move: current -> done, new pomo -> current

- however, in a silent pause, check `pomoLengthMin` and `startTime`
- calc `pomoProgress` = multiple pomos, eg: 4000 = 3.23
- set `totalPomos` as 3, move this pomo (object) to `done`
- make new pomo with `startTime` .23 \* 1320 (`pomoLengthSec`) `now` ago -> `current` pomo

- get total day pomos by iterating over all `done` pomos and count `totalPomos`

- on new day, you have 3 situations
- (1) prev day, no current pomo -> today, new current pomo
- (2) prev day, pomo in progress -> create new current pomo with progress (+ today `startTime`)
- (3) prev day, multi pomo progress -> do (2) + move pomo to done with int pomo count

- each time we move pomos to done, update the `dayPomos`

- all actions: start, pause, etc save to storage

- interval: 10s -> read from storage, do calc vs `now` -> write to storage
- interval: 1s -> update state -> update timer

Scenarios:

(1) click start + stop timer

(2) click start + auto-next pomo

(3) new day > bring WIP pomo

(4) resume from suspense > check status > update data to correct time
