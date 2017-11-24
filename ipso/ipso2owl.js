let fs = require('fs');
let slash = require('path').sep;
let cheerio = require('cheerio');

const ctx = {
    '@vocab': 'http://openmobilealliance.org/tech/profiles/LWM2M#',
    'xsd': 'http://www.w3.org/2001/XMLSchema#',
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'rdfs:subClassOf': { '@type': '@vocab' },
    'owl': 'http://www.w3.org/2002/07/owl#',
    'owl:imports': { '@type': '@vocab' },
    'owl:onProperty': { '@type': '@vocab' },
    'owl:onClass': { '@type': '@vocab' },
    'owl:allValuesFrom': { '@type': '@vocab' },
    'owl:someValuesFrom': { '@type': '@vocab' },
    'owl:hasValue': { '@type': '@vocab' }
};

let jsonld = {
    '@context': ctx,
    '@graph': [
        {
            '@type': 'owl:Ontology',
            'owl:imports': 'http://openmobilealliance.org/tech/profiles/LWM2M'
        }
    ]
};

// reusable resources indexed by ID
let resources = {};

const dir = 'models' + slash + 'reg' + slash + 'xml';
let isext = f => f.replace('.xml', '') >= 2048; // non-OMA object IDs >= 2048
fs.readdirSync(dir).filter(isext).forEach(filename => {
    const doc = fs.readFileSync(dir + '\\' + filename, 'utf-8');
    let $ = cheerio.load(doc);

    $('Object').each((index, o) => {
        let def = {
            '@id': $(o).children('ObjectURN').text(),
            'rdfs:subClassOf': ['IPSOObject'],
            'name': $(o).children('Name').text(),
            'rdfs:label': $(o).children('Name').text(),
            'objectID': $(o).children('ObjectID').text(),
            'description1': $(o).children('Description1').text(),
            'description2': $(o).children('Description2').text(),
            // 'multipleInstances': $(o).children('MultipleInstances').text(),
            // 'mandatory': $(o).children('Mandatory').text(),
        };

        $(o).find('Resources Item').each((index, i) => {
            let id = $(i).attr('id');

            if (!resources[id]) {
                let res = {
                    // note: no URN for resources in LWM2M
                    '@id': 'urn:oma:lwm2m:oma:res:' + id,
                    'rdfs:subClassOf': [
                        'IPSOResource',
                        {
                            '@type': 'owl:Restriction',
                            'owl:onProperty': 'resourceValue',
                            'owl:allValuesFrom': $(i).children('Type').text()
                            // TODO RangeEnumeration (datatype restriction)
                        },
                        {
                            '@type': 'owl:Restriction',
                            'owl:onProperty': 'operation',
                            'owl:hasValue': $(i).children('Operations').text()
                        }
                        // TODO Units (follows UCUM spec?)
                    ],
                    'resourceID': id,
                    'name': $(i).children('Name').text(),
                    'rdfs:label': $(i).children('Name').text(),
                    'description': $(i).children('Description').text()
                }

                resources[id] = res;
                jsonld['@graph'].push(res);
            }

            def['rdfs:subClassOf'].push({
                '@type': 'owl:Restriction',
                'owl:onProperty': 'resource',
                'owl:allValuesFrom': resources[id]
            });

            // existential restriction
            if ($(i).children('Mandatory').text() === 'Mandatory') {
                def['rdfs:subClassOf'].push({
                    '@type': 'owl:Restriction',
                    'owl:onProperty': 'resource',
                    'owl:someValuesFrom': resources[id]
                });
            }

            // cardinality constraint (max 1 resource-relation)
            if ($(i).children('MultipleInstances').text() == 'Single') {
                def['rdfs:subClassOf'].push({
                    '@type': 'owl:Restriction',
                    'owl:onProperty': 'resource',
                    'owl:onClass': resources[id],
                    'owl:maxQualifiedCardinality': {
                        '@value': 1,
                        '@type': 'xsd:nonNegativeInteger'
                    }
                });
            }
        });

        // FIXME not all resources are reusable
        // Multiple Resource, Mandatory, Description can be different (p. 46)

        jsonld['@graph'].push(def);
    });
});

console.log(JSON.stringify(jsonld));