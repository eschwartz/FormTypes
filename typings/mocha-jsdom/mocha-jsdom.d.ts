interface jsdom {
  ():void;
}

declare module 'mocha-jsdom' {
  export = jsdom;
}
