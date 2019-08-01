const {
  memo
} = require('react');

const Outer = () => {
  const Name = memo(() => null);
};
