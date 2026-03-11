module.exports = function (fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // List of framer-motion props to remove
    const propsToRemove = ['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'whileFocus', 'whileDrag', 'whileInView', 'drag', 'dragConstraints', 'dragElastic', 'dragMomentum', 'layout', 'layoutId', 'variants', 'viewport', 'onViewportEnter', 'onViewportLeave'];

    // Remove these props from all JSX elements
    root.find(j.JSXElement).forEach(path => {
        if (!path.node.openingElement.attributes) return;
        path.node.openingElement.attributes = path.node.openingElement.attributes.filter(attr => {
            if (attr.type === 'JSXAttribute' && attr.name && propsToRemove.includes(attr.name.name)) {
                return false;
            }
            return true;
        });
    });

    // Remove hooks calls for framer-motion like useScroll, useTransform, useSpring, useMotionValue
    const hooksToRemove = ['useScroll', 'useTransform', 'useSpring', 'useMotionValue', 'useAnimation', 'useInView'];
    root.find(j.VariableDeclarator).forEach(path => {
        if (path.node.init && path.node.init.type === 'CallExpression' && path.node.init.callee.name && hooksToRemove.includes(path.node.init.callee.name)) {
            // Remove the whole variable declaration
            j(path.parent).remove();
        }
    });

    // Remove standalone hook calls (e.g. useScroll()) without variable assignment
    root.find(j.CallExpression).forEach(path => {
        if (path.node.callee && path.node.callee.name && hooksToRemove.includes(path.node.callee.name)) {
            j(path.parent).remove();
        }
    });

    return root.toSource();
};
