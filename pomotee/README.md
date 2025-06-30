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

```json
{
  "date": "2025-06-20",
  // [startTime, duration of pomo(s) on pause/stop-next][], keep adding to
  "timeData": [["2025-06-19T13:38:17.997Z", 1300]],
  "pomoLength": 1320, // in seconds = 22 * 60
  "dayPomos": 0 // set when day is past for stats
}
```

Scenarios:

(1) click start + stop timer

(2) click start + auto-next pomo

(3) new day > bring WIP pomo

(4) resume from suspense > check status > update data to correct time
