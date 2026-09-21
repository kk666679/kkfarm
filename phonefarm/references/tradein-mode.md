# Trade-in Mode — Android 16+

```bash
adb shell tradeinmode getstatus
adb shell tradeinmode getstatus --challenge CHALLENGE
adb shell tradeinmode evaluate
```

Returns IMEI, serial, brand, model, battery health state, cycle count,
part status, storage lifespan. Preconditions: factory reset, no cellular,
no connected account, debuggable build.
