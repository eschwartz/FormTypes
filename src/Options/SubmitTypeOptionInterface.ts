import FormTypeOptionsInterface = require('./FormTypeOptionsInterface');

interface SubmitTypeOptionInterface extends FormTypeOptionsInterface {
  label?:string;
}

export = SubmitTypeOptionInterface;