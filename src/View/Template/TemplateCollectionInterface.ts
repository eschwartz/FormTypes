///ts:ref=underscore.d.ts
/// <reference path="../../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import underscore = require('underscore');
import TemplateInterface = require('./TemplateInterface');
interface TemplateCollectionInterface extends _.Dictionary<TemplateInterface>  {
}

export = TemplateCollectionInterface;