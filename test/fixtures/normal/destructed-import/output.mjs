import { memo } from 'react';

const Name = (_temp => {
  _temp.displayName = "Memo(Name)";
  return _temp;
})(memo(() => null));