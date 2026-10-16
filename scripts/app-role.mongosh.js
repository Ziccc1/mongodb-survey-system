// Optional admin provisioning template. Defining a role does not enable mongod authentication.
// Set the intended app DB before loading this file. Never run against unknown old databases.
if(!/^project1_(app_v2|test_[a-zA-Z0-9_]+)$/.test(db.getName()))throw Error('Project database required');
const role={role:'project1_application',privileges:[
  {resource:{db:db.getName(),collection:''},actions:['listCollections']},
  ...['users','surveys','responses','survey_versions'].map(collection=>({resource:{db:db.getName(),collection},actions:['listIndexes','find','insert',...(collection==='surveys'?['update']:[])]})),
],roles:[]};
const existing=db.getRole(role.role);
if(existing)throw Error('Role already exists: inspect instead of overwriting privileges');
db.createRole(role);
print('Role defined. Configure separate app credentials and enable authentication before claiming enforcement. Initialization uses a separate administrative identity.');
