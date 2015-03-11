interface Element {
  matches(selector:string):boolean;
  webkitMatchesSelector(selector:string):boolean;
  mozMatchesSelector(selector:string):boolean
}
