const {
  memo
} = require('react');

const Outer = () => {
  const Name = (_temp => {
    _temp.displayName = "Memo(Name)";
    return _temp;
  })(memo(() => null));
};

