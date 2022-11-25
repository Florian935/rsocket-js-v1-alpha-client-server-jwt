# Breaking change

Since the Angular 15, you have to manually create the `polyfills.ts` file with the import of `zone.js` and `buffer` library in order to work with
rsocket-js client library.

Before all, run `npm i buffer`

Also, you have to add this in your `angular.json` file under **_projects > client > architect > build > options_**:

```
"polyfills": "src/polyfills.ts"
```

And finally, you have to add `"src/polyfills.ts"` in your `ts.config.app.json` file in the `files` array.
