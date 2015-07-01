///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
interface FormErrorsInterface {
  // Errors for this form
  form?: string[];
  // Errors for child forms, indexed by child name
  fields?: _.Dictionary<FormErrorsInterface>
}
export = FormErrorsInterface;