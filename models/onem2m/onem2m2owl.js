const fs = require('fs');

const defined = [];

function inputOrOutputClass(type) {
	let [prefix, name] = type.split(/:/);
	let id = 'base:' + name + 'InputOrOutput';
	
	if (defined.indexOf(id) > -1) {
		return {
			'@id': id
		};
	}
	
	defined.push(id);
	return {
		// TODO more accurate @id?
		'@id': id,
		'rdfs:subClassOf': {
			'@type': 'owl:Restriction',
			'owl:onProperty': 'base:hasDataTypeAndRange',
			'owl:hasValue': {
				// TODO datatype IRI represented as IRI (problem in ontology)...
				'@value': type
			}
		}
	}
}

function actionClass(row) {
	let [str, ret, name, arg] = row.match(/^(\w+) (\w+) (\w+) (true|false) (.*)$/);
	
	let def = {
		'rdfs:label': name,
		'rdfs:subClassOf': ['sdt:Action']
	};
	
	if (ret != 'none') {
		def['rdfs:subClassOf'].push({
			'@type': 'owl:Restriction',
			'owl:onProperty': 'base:hasOutput',
			'owl:someValuesFrom': id + '.' + ret
		});
	}
	
	if (arg != 'none') {
		def['rdfs:subClassOf'].push({
			'@type': 'owl:Restriction',
			'owl:onProperty': 'base:hasInput',
			'owl:someValuesFrom': id + '.' + arg
		});
	}
	
	return def;
}

function dataPointClass(row) {
	let [str, name, type, r, w] = row.match(/^(\w+) (.+) (true|false) (true|false) (true|false) (.*)$/);
	
	let def = {
		'rdfs:label': name,
		'rdfs:seeAlso': {
			// datatype property used in payload
			'@id': 'haim:' + name,
			'@type': 'owl:DatatypeProperty'
		},
		'rdfs:subClassOf': ['sdt:DataPoint']
	}
	
	let multiple = false;
	if (type.startsWith('list of ')) {
		multiple = true; // TODO use it?
		type = type.substring(8);
	}
	
	if (r === 'true') {
		def['rdfs:subClassOf'].push({
			'@type': 'owl:Restriction',
			'owl:onProperty': 'base:hasOutput',
			'owl:allValuesFrom': inputOrOutputClass(type)
		});
	}
	
	if (w === 'true') {
		def['rdfs:subClassOf'].push({
			'@type': 'owl:Restriction',
			'owl:onProperty': 'base:hasInput',
			'owl:allValuesFrom': inputOrOutputClass(type)
		});
	}
	
	return def;
}

function propertyClass(row) {
	let [str, name, type] = row.match(/^(\w+) (.+) (true|false) (.*)$/);
	
	let def = {
		'rdfs:label': name,
		'rdfs:subClassOf': ['sdt:Property']
	}
	
	// TODO not an operation?
	// TODO relate property to datatype?
	
	return def;
}

function operationRestrictions(id, txt) {
	let restrictions = [];
	
	txt.match(/Table 5.3.\d+-\d: [\w ]+\r\n(.+\r\n)+/g).forEach(t => {
		let [title, header, ...rows] = t.split(/\r\n/);
		
		let xClass = null;
		if (title.match(/Actions of/)) xClass = actionClass;
		else if (title.match(/DataPoints of/)) xClass = dataPointClass;
		else if (title.match(/Properties of/)) xClass = propertyClass;
		else return; // error case
		
		rows.filter(r => r.length > 0).forEach(r => {
			let [str, x, opt, doc] = r.match(/(.*) (true|false) (.*)$/);
			
			let def = xClass(r);
			def['@id'] = id + '.' + def['rdfs:label'];
			def['rdfs:comment'] = doc;
	
			restrictions.push({
				'@type': 'owl:Restriction',
				'owl:onProperty': 'base:hasOperation',
				'owl:allValuesFrom': def
			});

			if (opt === 'false') {
				restrictions.push({
					'@type': 'owl:Restriction',
					'owl:onProperty': 'base:hasOperation',
					'owl:someValuesFrom': {
						'@id': def['@id']
					}
				});
			}
		});
	});
	
	return restrictions;
}

// TODO enumerated datatypes

function moduleClass(txt) {
	let [str, title, desc] = txt.match(/5.3.\d+ (\w+)\r\n(.*)\r\n/);
	
	let def = {
		'@id': 'urn:org.onem2m.home.moduleclass.' + title,
		'rdfs:label': title,
		'rdfs:comment': desc
	};
	
	let restrictions = operationRestrictions(def['@id'], txt);
	def['rdfs:subClassOf'] = ['sdt:ModuleClass'].concat(restrictions);
	
	return def;
}

const txt = fs.readFileSync('descriptions.txt', 'utf-8');

let titles = txt.match(/5.3.\d+ (\w+)\r\n/g);
let sections = [];
for (let i = 0; i < titles.length; i++) {
	let beginning = txt.indexOf(titles[i]);
	let end = i + 1 < titles.length ? txt.indexOf(titles[i + 1]) : txt.length;
	sections.push(txt.substring(beginning, end));
}

let jsonld = {
	'@context': {
		'xsd': 'http://www.w3.org/2001/XMLSchema#',
		'xs': 'http://www.w3.org/2001/XMLSchema#',
		'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
		'rdfs:subClassOf': { '@type': '@vocab' },
		'owl': 'http://www.w3.org/2002/07/owl#',
		'base': 'http://www.onem2m.org/ontology/Base_Ontology#',
		'sdt': 'http://www.onem2m.org/ontology/SDT#',
		'haim': 'http://www.onem2m.org/ontology/HAIM#', // TODO proper ns
		'hd': 'http://www.onem2m.org/ontology/HD#',
		'owl:imports': { '@type': '@vocab' },
		'owl:onProperty': { '@type': '@vocab' },
		'owl:allValuesFrom': { '@type': '@vocab' },
		'owl:someValuesFrom': { '@type': '@vocab' }
	},
	'@graph': [{
		'@type': 'owl:Ontology',
		'owl:imports': 'base:'
	}].concat(sections.map(moduleClass))
}

console.log(JSON.stringify(jsonld));