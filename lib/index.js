const defaultWrappersConfig = {
  memo: ["React", wrapped => `Memo(${wrapped})`],
  forwardRef: ["React", wrapped => `ForwardRef(${wrapped})`]
};


const normalizeOptions = options => ({
  wrappers:
    typeof options.wrappers === "undefined"
      ? true
      : Boolean(options.wrappers),
  wrappersConfig:
    Object.assign({}, defaultWrappersConfig, options.wrappersConfig) ||
    defaultWrappersConfig
});

const findContainer = (path, t) => Boolean(path.node.body) ?
  path : findContainer(path.parentPath, t);

const findCandidateNameForExpression = path => {
  let id;
  path.find(path => {
    if (path.isAssignmentExpression()) {
      id = path.node.left;
    } else if (path.isObjectProperty()) {
      id = path.node.key;
    } else if (path.isVariableDeclarator()) {
      id = path.node.id;
    } else if (path.isStatement()) {
      return true;
    }

    if (id) return true;
  });
  return id;
};

module.exports = function(babel, options = {}) {
  const {
    wrappers,
    wrappersConfig
  } = normalizeOptions(options);

  const { types: t } = babel;

  const [wrapperCreators, importNames] = Object.entries(wrappersConfig)
    .reduce(
      ([accWrapperCreators, accImportNames], [specifier, [importName]]) => [
        accWrapperCreators.concat(specifier),
        accImportNames.concat(importName)
      ],
      [[], []]
    )
    .map(items => new Set(items));

  const setWrapperNameAfter = (wrapper, path, state, nameNodeId, t) => {
    const displayName = wrappersConfig[wrapper][1](nameNodeId.name);

    let args;
    let loc;
    path.find(path => {
      if (path.isCallExpression()) {
        args = path.node.arguments;
        loc = path.node.loc.start;
        return true;
      }
    });

    if (args && displayName) {
      const nodes = t.expressionStatement(
        t.assignmentExpression(
          "=",
          t.memberExpression(nameNodeId, t.identifier("displayName")),
          t.stringLiteral(displayName)
        )
      );
      findContainer(path, t).pushContainer("body", nodes);
    }
  };

  return {
    name: "babel-plugin-react-wrapped-display-name",
    visitor: {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const specifiers = path.node.specifiers;
        if (importNames.has(source)) {
          for (const { name, wrapper } of specifiers
            .filter(s => s.imported)
            .map(specifier => ({
              name: specifier.local.name,
              wrapper: wrapperCreators.has(specifier.imported.name)
            }))) {
          }
        }
      },

      CallExpression(path, state) {
        if (t.isIdentifier(path.node.callee)) {
          if (wrappers && wrapperCreators.has(path.node.callee.name)) {
            const id = findCandidateNameForExpression(path);
            if (id) {
              setWrapperNameAfter(
                path.node.callee.name,
                path,
                state,
                id,
                babel.types
              );
            }
          }
        }
        if (t.isMemberExpression(path.node.callee)) {
          if (wrappers && wrapperCreators.has(path.node.callee.property.name)) {
            const id = findCandidateNameForExpression(path);
            if (id) {
              setWrapperNameAfter(
                path.node.callee.property.name,
                path,
                state,
                id,
                babel.types
              );
            }
          }
        }
      }
    }
  };
};
