# 1.1.1

- Fix CheckboxType template (was bad markup)

# 1.1.0

New Form Types:

- MultiChoiceType
- CheckboxType

See /examples/basic.html for example usage.

# 1.0.0

Initial release

Core features:

- HTML form generated from
  configurable FormType objects
- Base `AbstractFormType` and `FieldFormType` classes, which can be easily extended.
- FormType implementations
    - `FormTypes.FormType`
    - `FormTypes.TextType`
    - `FormTypes.ChoiceType`
- FormTypes can accept custom templates
- FormTypes may have child FormTypes.
- FormType#get/setData(), with propagation through to children.
- FormType 'change' events
- FormType 'change:[child]' events