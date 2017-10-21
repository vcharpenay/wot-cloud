'use strict'

const fs = require('fs');
const url = require('url');
const path = require('path');

const s2o = require('..' + path.sep + 'schema2owl.js');

const ctx = {
    // TODO extract OWL terms from the schema instead (#/properties, #/definitions, etc)
    '@vocab': 'http://swagger.io/v2/schema.json#',
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'subClassOf': {
        '@id': 'rdfs:subClassOf',
        '@type': '@vocab'
    },
    'label': 'rdfs:label',
    'comment': 'rdfs:comment'
};

function encode(name) {
    // output is percent-encoded
    return url.format(url.parse(name));
}

function locate(ref, json) {
    let refStack = ref.split('/');
    let r = refStack.shift();
    if (r === '#') {
        return refStack.reduce((node, idx) => node[idx], json);
    } else {
        console.error('Cannot locate object from remote JSON path');
        return undefined;
    }
}

function canonicalize(json, base) {
    if (json.definitions) {
        // identical to JSON Schema 'definitions' field
        Object.keys(json.definitions).forEach((name) => {
            let def = json.definitions[name];
            json.definitions[name] = s2o.canonicalize(def, base + '#/definitions/' + name);
        });
    }
    return json;
}

const operations = {
    'get': 'GetOperation',
    'post': 'PostOperation',
    'put': 'PutOperation'
};
function owlOperationType(op, opType, spec) {
    let type = {
        'subClassOf': []
    };
    
    let parent = operations[opType];
    if (parent) {
        type['subClassOf'].push(parent);
    } else {
        console.error('TODO: operation ' + opType);
    }

    if (op.description) {
        type['comment'] = op.description;
    }

    if (op.parameters) {
        // TODO
    }

    // 'responses' is mandatory
    let schema = op.responses[200].schema
    if (schema) {
        if (schema['$ref']) {
            schema = locate(schema['$ref'], spec);
        }

        type['subClassOf'].push({
            'onProperty': 'responses',
            'someValuesFrom': s2o.transform(schema)
        });
    }

    return type;
}

function owlType(spec) {
    // 'title' is mandatory
    let type = {
        '@id': encode(spec.info.title),
        'subClassOf': ['SwaggerAPI'],
        'label': spec.info.title,
    };

    // optional description of the class
    if (spec.info.description) {
        type['comment'] = spec.info.description;
    }

    // TODO take defaults into account (API level & path level)

    // 'paths' is mandatory
    Object.keys(spec.paths).forEach((res) => {
        let def = spec.paths[res];
        
        let path = {
            'subClassOf': ['Path']
        };

        Object.keys(def).forEach((op) => {
            // expected keys: get, post, put, ...
            path['subClassOf'].push({
                'onProperty': 'operations',
                'someValuesFrom': owlOperationType(def[op], op, spec)
            });
        });

        type['subClassOf'].push({
            'onProperty': 'paths',
            'someValuesFrom': path
        });
    });

    return type;
}

const dir = 'models';
const root = 'http://openconnectivity.org/iotdatamodels/schemas/';
fs.readdir(dir, (err, files) => {
    let allTypes = [];
    files.filter(f => f.endsWith('.swagger.json'))
        //  .filter((f, i) => i < 5) // TODO for test purposes
         .forEach(f => {
             let data = fs.readFileSync(dir + path.sep + f, 'UTF-8');
             let json = JSON.parse(data);
             let base = encode(root + f);
             let type = owlType(canonicalize(json, base));
             type['@context'] = [
                 ctx,
                 s2o.context,
                 { '@base': base }
             ];
             allTypes.push(type);
         });
    console.log(JSON.stringify(allTypes));
});