'use strict'

const url = require('url');

const ctx = {
    'owl': 'http://www.w3.org/2002/07/owl#',
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'xsd': 'http://www.w3.org/2001/XMLSchema#',
    'boolean': 'xsd:boolean',
    'integer': 'xsd:integer',
    // TODO fix this: JSON-LD type coercion leads to
    // inconsistencies in datatype restrictions
    'number': 'xsd:integer',
    'string': 'xsd:string',
    'label': 'rdfs:label',
    'comment': 'rdfs:comment',
    'Ontology': 'owl:Ontology',
    'Datatype': 'rdfs:Datatype',
    'Class': 'owl:Class',
    'DatatypeProperty': 'owl:DatatypeProperty',
    'ObjectProperty': 'owl:ObjectProperty',
    'Restriction': 'owl:Restriction',
    'imports': {
        '@id': 'owl:imports',
        '@type': '@vocab'
    },
    'subClassOf': {
        '@id': 'rdfs:subClassOf',
        '@type': '@vocab'
    },
    'allOf': {
        '@id': 'owl:intersectionOf',
        '@type': '@vocab',
        '@container': '@list'
    },
    // TODO JSON Schema's oneOf (vs. anyOf?)
    'anyOf': {
        '@id': 'owl:unionOf',
        '@type': '@vocab',
        '@container': '@list'
    },
    // TODO enum values -> literals or indivs ?
    'enum': {
        '@id': 'owl:oneOf',
        '@container': '@list'
    },
    'oneOf': {
        '@id': 'owl:oneOf',
        '@type': '@vocab',
        '@container': '@list'
    },
    'withRestrictions': {
        '@id': 'owl:withRestrictions',
        '@type': '@vocab',
        '@container': '@list'
    },
    'equivalentClass': {
        '@id': 'owl:equivalentClass',
        '@type': '@vocab'
    },
    'onDatatype': {
        '@id': 'owl:onDatatype',
        '@type': '@vocab'
    },
    'onProperty': {
        '@id': 'owl:onProperty',
        '@type': '@vocab'
    },
    'allValuesFrom': {
        '@id': 'owl:allValuesFrom',
        '@type': '@vocab'
    },
    'someValuesFrom': {
        '@id': 'owl:someValuesFrom',
        '@type': '@vocab'
    },
    'minimum': {
        '@id': 'xsd:minInclusive'
    },
    'maximum': {
        '@id': 'xsd:maxInclusive'
    },
    'exclusiveMinimum': {
        '@id': 'xsd:minExclusive'
    },
    'exclusiveMaximum': {
        '@id': 'xsd:maxExclusive'
    },
    'minLength': {
        '@id': 'xsd:minLength'
    },
    'maxLength': {
        '@id': 'xsd:maxLength'
    },
    'pattern': {
        '@id': 'xsd:pattern'
    }
}

function encode(name) {
    // output is percent-encoded
    // TODO remove dependency to url
    return url.format(url.parse(name));
}

function canonicalize(json, root, stack, base) {
    if (json['$ref']) {
        let refStack = json['$ref'].split('/');
        let r = refStack.shift(); // remove root
        if (r === '#') { // local definition
            let ref = refStack.reduce((node, idx) => node[idx], root);
            return canonicalize(ref, root, refStack, base);
        } else {
            // FIXME not following RFC 3986 (Section 5)
            let refBase = base.substring(0, base.lastIndexOf('/') + 1);
            return { 'id': refBase + json['$ref'] };
        }
    } else {
        if (!json.id) {
            json.id = stack.reduce((path, idx) => path + '/' + idx, base);
        }

        if (json.anyOf) {
            stack.push('anyOf');
            json.anyOf.forEach((def, i) => {
                stack.push(i);
                json.anyOf[i] = canonicalize(def, root, stack, base);
                stack.pop();
            });
            stack.pop();
        } else if (json.allOf) {
            stack.push('allOf');
            json.allOf.forEach((def, i) => {
                stack.push(i);
                json.allOf[i] = canonicalize(def, root, stack, base);
                stack.pop();
            });
            stack.pop();
        } else if (json.items) {
            stack.push('items');
            json.items = canonicalize(json.items, root, stack, base);
            stack.pop();
        } else if (json.properties) {
            Object.keys(json.properties).forEach(p => {
                stack.push(p);
                let def = json.properties[p];
                def = canonicalize(def, root, stack, base);
                stack.pop();
            });
        }
        return json;
    }
}

// TODO null should neither be a datatype, nor a class
const isClass = (def) => def === null || def['@type'] === 'Class' || def['@type'] === 'Restriction';
const isDatatype = (def) => def === null || def['@type'] === 'Datatype';

const facets = [
    'minimum',
    'maximum',
    'exclusiveMinimum',
    'exclusiveMaximum',
    'minLength',
    'maxLength',
    'pattern'
];

const owl = {
    'dataIntersectionOf': (defs) => ({
        '@type': 'Datatype',
        'equivalentClass': {
            '@type': 'Datatype',
            'allOf': defs
        }
    }),
    'dataUnionOf': (defs) => ({
        '@type': 'Datatype',
        'equivalentClass': {
            '@type': 'Datatype',
            'anyOf': defs
        }
    }),
    'dataOneOf': (values) => ({
        '@type': 'Datatype',
        'equivalentClass': {
            '@type': 'Datatype',
            'enum': values
        }
    }),
    'datatypeDefinition': (datatype) => ({
        '@type': 'Datatype',
        'equivalentClass': datatype
    }),
    'datatypeRestriction': (datatype, restrictions) => ({
        '@type': 'Datatype',
        'equivalentClass': {
            '@type': 'Datatype',
            'onDatatype': datatype,
            'withRestrictions': restrictions
        }
    }),
    'objectIntersectionOf': (defs) => ({
        '@type': 'Class',
        'allOf': defs
    }),
    'objectUnionOf': (defs) => ({
        '@type': 'Class',
        'anyOf': defs
    }),
    'objectSomeValuesFrom': (prop, def) => ({
        '@type': 'Restriction',
        'onProperty': {
            '@id': prop,
            '@type': 'ObjectProperty',
            'label': prop
        },
        'someValuesFrom': def
    }),
    'objectAllValuesFrom': (prop, def) => ({
        '@type': 'Restriction',
        'onProperty': {
            '@id': prop,
            '@type': 'ObjectProperty',
            'label': prop
        },
        'allValuesFrom': def
    }),
    'objectOneOf': null, // TODO
    'objectHasValue': null, // TODO
    'dataSomeValuesFrom': (prop, def) => ({
        '@type': 'Restriction',
        'onProperty': {
            '@id': prop,
            '@type': 'DatatypeProperty',
            'label': prop
        },
        'someValuesFrom': def
    }),
    'dataAllValuesFrom': (prop, def) => ({
        '@type': 'Restriction',
        'onProperty': {
            '@id': prop,
            '@type': 'DatatypeProperty',
            'label': prop
        },
        'allValuesFrom': def
    }),
    'dataHasValue': null // TODO
};

function dataOrObjectIntersectionOf(schema) {
    let defs = schema.allOf.map(classOrDatatype);
    
    if (defs.some(isDatatype)) {
        return owl.dataIntersectionOf(defs);
    } else {
        return owl.objectIntersectionOf(defs);
    }
}

function dataOrObjectUnionOf(schema) {
    let defs = schema.anyOf.map(classOrDatatype);

    if (defs.every(isDatatype)) {
        return owl.dataUnionOf(defs);
    } else {
        return owl.objectUnionOf(defs);
    }
}

function datatypeDefinitionOrRestriction(schema) {
    let restrictions = [];
    facets.forEach((f) => {
        if (schema[f]) {
            restrictions.push({ [f]: schema[f] });
        }
    });

    // if (restrictions.length > 0) {
    //     return owl.datatypeRestriction(schema.type, restrictions);
    // } else {
        return owl.datatypeDefinition(schema.type);
    // }
}

function dataOrObjectAllValuesFrom(name, schema) {
    let filler = classOrDatatype(schema);

    if (isDatatype(filler)) {
        return owl.dataAllValuesFrom(name, filler);
    } else {
        return owl.objectAllValuesFrom(name, filler);
    }
}

function dataOrObjectSomeValuesFrom(name, schema) {
    let filler = classOrDatatype(schema);

    if (isDatatype(filler)) {
        return owl.dataSomeValuesFrom(name, filler);
    } else {
        return owl.objectSomeValuesFrom(name, filler);
    }
}

/**
 * Algorithm entry point
 */
function classOrDatatype(schema) {
    let def = {}; // OWL class or datatype

    if (schema.enum) {
        def = owl.dataOneOf(schema.enum);
    } else if (schema.anyOf) {
        def = dataOrObjectUnionOf(schema);
    } else if (schema.allOf) {
        def = dataOrObjectIntersectionOf(schema);
    } else if (schema.oneOf) {
        return null; // TODO
    } else {
        switch (schema.type) {
            case 'boolean':
                def = owl.datatypeDefinition(schema.type);
                break;
            case 'number':
            case 'integer':
            case 'string':
                def = datatypeDefinitionOrRestriction(schema);
                break;
            case 'array':
                // TODO include minItems, maxItems
                if (schema.items) {
                    def = classOrDatatype(schema.items);
                } else {
                    return null; // unknown def
                }
                break;
            case 'object':
                if (schema.properties) {
                    let names = Object.keys(schema.properties);
                    let defs = names.map(name => {
                        let value = schema.properties[name];
                        return dataOrObjectAllValuesFrom(name, value);
                    });

                    if (schema.required) {
                        defs = defs.concat(schema.required.map(name => {
                            let value = schema.properties[name];
                            return dataOrObjectSomeValuesFrom(name, value);
                        }));
                    }
                    
                    def = owl.objectIntersectionOf(defs);
                } else {
                    return null; // unknown def
                }
                break;
        }
    }

    def['@id'] = schema.id;
    if (schema.description) {
        def['comment'] = schema.description;
    }
    return def;
}

exports.context = ctx;
exports.transform = classOrDatatype;
exports.canonicalize = function(json, base) {
    // recursive call
    return canonicalize(json, json, [], base);
}