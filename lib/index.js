const defaultWrappersConfig = {
  memo: ['React', wrapped => `Memo(${wrapped})`],
  forwardRef: ['React', wrapped => `ForwardRef(${wrapped})`],
};


const normalizeOptions = options => ({
  wrappers:
    typeof options.wrappers === 'undefined'
      ? true
      : Boolean(options.wrappers),
  wrappersConfig:
    Object.assign({}, defaultWrappersConfig, options.wrappersConfig)
    || defaultWrappersConfig,
});

const findCandidateNameForExpression = (path) => {
  let id;
  path.find((currentPath) => {
    if (currentPath.isAssignmentExpression()) {
      id = currentPath.node.left;
    } else if (currentPath.isObjectProperty()) {
      id = currentPath.node.key;
    } else if (currentPath.isVariableDeclarator()) {
      // eslint-disable-next-line prefer-destructuring
      id = currentPath.node.id;
    } else if (currentPath.isStatement()) {
      return true;
    }

    return Boolean(id);
  });
  return id;
};

module.exports = function displayNamePlugin(babel, options = {}) {
  const {
    wrappers,
    wrappersConfig,
  } = normalizeOptions(options);

  const { types } = babel;

  const [wrapperCreators, importNames] = Object.entries(wrappersConfig)
    .reduce(
      ([accWrapperCreators, accImportNames], [specifier, [importName]]) => [
        accWrapperCreators.concat(specifier),
        accImportNames.concat(importName),
      ],
      [[], []],
    )
    .map(items => new Set(items));

  const setWrapperNameAfter = (wrapper, path, state, nameNodeId, t) => {
    const displayName = wrappersConfig[wrapper][1](nameNodeId.name);

    let args;
    path.find((currentPath) => {
      if (currentPath.isCallExpression()) {
        args = currentPath.node.arguments;
        return true;
      }
      return false;
    });

    if (args && displayName) {
      const tempId = path.scope.generateUidIdentifier();
      path.replaceWith(
        t.callExpression(
          t.arrowFunctionExpression(
            [t.cloneNode(tempId)],
            t.blockStatement([
              t.expressionStatement(
                t.assignmentExpression(
                  '=',
                  t.memberExpression(t.cloneNode(tempId), t.identifier('displayName')),
                  t.stringLiteral(displayName),
                ),
              ),
              t.returnStatement(t.cloneNode(tempId)),
            ]),
          ),
          [path.node],
        ),
      );
      path.skip();
    }
  };

  return {
    name: 'babel-plugin-react-wrapped-display-name',
    visitor: {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        if (importNames.has(source)) {
          //
        }
      },

      CallExpression(path, state) {
        if (types.isIdentifier(path.node.callee)) {
          if (wrappers && wrapperCreators.has(path.node.callee.name)) {
            const id = findCandidateNameForExpression(path);
            if (id) {
              setWrapperNameAfter(
                path.node.callee.name,
                path,
                state,
                id,
                babel.types,
              );
            }
          }
        }
        if (types.isMemberExpression(path.node.callee)) {
          if (wrappers && wrapperCreators.has(path.node.callee.property.name)) {
            const id = findCandidateNameForExpression(path);
            if (id) {
              setWrapperNameAfter(
                path.node.callee.property.name,
                path,
                state,
                id,
                babel.types,
              );
            }
          }
        }
      },
    },
  };
};
