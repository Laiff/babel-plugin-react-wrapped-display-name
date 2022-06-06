const React = require('react');

const Name = (_temp => {
  _temp.displayName = "Memo(Name)";
  return _temp;
})(React.memo(() => null));
