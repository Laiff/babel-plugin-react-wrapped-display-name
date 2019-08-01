const {
  memo
} = require('react');

const Outer = () => {
  const Name = memo(() => null);
  Name.displayName = "Memo(Name)";
};

