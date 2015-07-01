///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import _ = require('underscore');

interface WhenInConf {
  [index:string]: (val:any) => void;
}
function whenIn(target, conf:WhenInConf) {
  _.each(conf, (cb, key) => {
    if (key in target) {
      cb(target[key]);
    }
  });
}

export = whenIn;