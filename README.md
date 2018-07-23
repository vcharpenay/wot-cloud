# WoT Cloud Ontologies & Experiments

The WoT cloud is a set of standard Web ontologies for the Web of Things (WoT), consistently aligned with each other. It includes:
 - the [Semantic Sensor Network (SSN) and the Sensor, Observation, Sample, and Actuator (SOSA) ontologies](https://www.w3.org/TR/vocab-ssn/)
 - the [Smart Appliance REFerence (SAREF) ontology](http://ontology.tno.nl/saref/)
 - the [Ontology of units of Measure (OM)](http://www.wurvoc.org/vocabularies/om-1.8/)
 
These ontologies have been used as a reference model for semantic alignment with industrial standards, like
[IPSO/LWM2M](https://www.ipso-alliance.org/), [OCF](https://openconnectivity.org/) and [oneM2M](http://onem2m.org/).

## Structure of the repository

| Path | Description |
| ---- | ----------- |
| [/edoal](edoal) | all entity-level alignments (RDF/XML format, using the [EDOAL](http://alignapi.gforge.inria.fr/edoal.html) vocabulary) |
| [/shacl](shacl) | all SPARQL rules (Turtle format, using the [SHACL](https://www.w3.org/TR/shacl/) vocabulary) |
| [/owl](owl) | all ontology axioms (Turtle format) |
| [/models/onem2m](models/onem2m) | model transformation script and data for oneM2M (JavaScript, XML, Text) |
| [/models/ipso](models/ipso) | model transformation script and data for IPSO (JavaScript, XML) |
| [/models/oneiota](models/oneiota) | model transformation script and data for OCF/oneIoTa (JavaScript, JSON) |
| [/experiments/lexica](experiments/lexica) | lexica (sets of words) extracted from the WoT cloud and each industrial standard (CSV format) |
| [/experiments/similarities](/experiments/similarities) | semantic similarity measurements between industrial standards (CSV format) |

## User interface

Go to https://vcharpenay.github.io/wot-cloud/ to search for concepts in the Web of Things cloud.