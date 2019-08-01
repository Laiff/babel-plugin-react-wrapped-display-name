const {
  memo
} = require('react');

const Name = memo(() => null);
Name.displayName = "Memo(Name)";
