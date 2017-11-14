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
| [/onto](onto) | all ontology axioms (Turtle format) |
| [/onem2m](onem2m) | model transformation script and data for oneM2M (JavaScript, XML, Text) |
| [/ipso](ipso) | model transformation script and data for IPSO (JavaScript, XML) |
| [/oneiota](oneiota) | model transformation script and data for OCF/oneIoTa (JavaScript, JSON) |
| [/experiments/lexica](experiments/lexica) | lexica (sets of words) extracted from the WoT cloud and each industrial standard (CSV format) |
| [/experiments/similarities](/experiments/similarities) | semantic similarity measurements between industrial standards (CSV format) |
