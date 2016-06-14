'use strict';

function propsDiff(propsArray) {
    if (propsArray.length === 1) {
        var changeType = propsArray[0].changeType;
        if (changeType === 'added') {
            return getAdded(propsArray[0]);
        } else if (changeType === 'deleted') {
            return getDeleted(propsArray[0]);
        } else {
            throw new Error('only 1 element but neither added nor deleted');
        }
    } else {
        var modifiedOld = getOld(propsArray);
        var modifiedNew = getNew(propsArray);
        return getDiff(modifiedOld, modifiedNew);
    }
}

function getDiff(oldProps, newProps) {
    var ret = {};
    for (var prop in newProps) {
        ret[prop] = {};
        if (!oldProps.hasOwnProperty(prop)) {
            ret[prop]['added'] = newProps[prop];
        } else {
            var oldValue = oldProps[prop];
            var newValue = newProps[prop];
            if (oldValue === newValue) {
                ret[prop]['unchanged'] = newValue;
            } else {
                ret[prop]['modifiedOld'] = oldValue;
                ret[prop]['modifiedNew'] = newValue;
            }
        }
    }
    for (var oldProp in oldProps) {
        if (!ret.hasOwnProperty(oldProp)) {
            ret[oldProp] = {
                'deleted': oldProps[oldProp]
            };
        }
    }
    return ret;
}

function getAdded(props) {
    var ret = {};
    for (var prop in props) {
        ret[prop] = {
            'added': props[prop]
        };
    }
    return ret;
}

function getDeleted(props) {
    var ret = {};
    for (var prop in props) {
        ret[prop] = {
            'deleted': props[prop]
        };
    }
    return ret;
}

function getOld(propsArray) {
    for (var i = 0; i < propsArray.length; i++) {
        if (propsArray[i].changeType === 'modifiedOld') {
            return propsArray[i];
        }
    }
    return null;
}

function getNew(propsArray) {
    for (var i = 0; i < propsArray.length; i++) {
        if (propsArray[i].changeType === 'modifiedNew') {
            return propsArray[i];
        }
    }
    return null;
}

module.exports = propsDiff;
