import React from 'react';

/**
 * Performs a key comparison between two objects, deleting from the first where
 * the keys exist in the second
 *
 * Can be used to remove unwanted component prop values. For example:
 *
 * ```jsx
 * render() {
 *   const { children, className, ...props } = this.props;
 *
 *    return (
 *      <div
 *        {...objectKeyFilter(props, Item.propTypes)}
 *        className={classNames('dp-item', className)}
 *       >
 *        {children}
 *      </div>
 *    )
 * }
 * ```
 *
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {*}
 */
export function objectKeyFilter(obj1, obj2) {
  const obj2Keys = Object.keys(obj2);
  const newProps = Object.assign({}, obj1);
  Object.keys(newProps)
    .filter(key => obj2Keys.indexOf(key) !== -1)
    .forEach(key => delete newProps[key]);

  return newProps;
}

/**
 * Calls React.Children.map() recursively on the given children
 *
 * @param {*} children The children to map
 * @param {function} cb Called for each child
 * @returns {*}
 */
export function childrenRecursiveMap(children, cb) {
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.props.children) {
      child = React.cloneElement(child, { // eslint-disable-line no-param-reassign
        children: childrenRecursiveMap(child.props.children, cb)
      });
    }

    return cb(child);
  });
}
