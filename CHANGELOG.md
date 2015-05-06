# 1.2.0

- Refactor child-closing behavior.
  Fixes issues with attempting to close
  not-rendered children, and separates concerns, some.
  
  Note that closing a view no longer removes it's from
  the parent view -- meaning that it will still provide
  data to parent GroupTypes.
  If you want to fully remove a child, you'll need to
  call `parentForm.removeChild()`, instead of just `child.close()`.

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