// Run only in an empty disposable test database, from the project root.
// Creates fixtures and leaves them for inspection. Does not drop collections/databases.
if (!db.getName().startsWith('survey_schema_check_')) throw new Error('Use a survey_schema_check_ test database.');
if (db.getCollectionNames().length) throw new Error('Verification requires an empty database.');
load('database/init-schema.js');
load('database/examples.js');
let passed = 0;
function check(label, condition) {
  if (!condition) throw new Error(`FAIL: ${label}`);
  passed++; print(`PASS: ${label}`);
}
function rejects(label, code, action) {
  let caught;
  try { action(); } catch (error) { caught = error; }
  check(label, caught && caught.code === code);
}
db.users.insertMany(schemaExamples.users);
db.surveys.insertOne(schemaExamples.survey);
db.responses.insertOne(schemaExamples.response);
check('valid fixtures accepted', db.responses.countDocuments({}) === 1);
load('database/init-schema.js');
check('initialization can run twice', db.responses.countDocuments({}) === 1);
rejects('normalized username unique', 11000, () => db.users.insertOne({
  ...schemaExamples.users[0], _id: new ObjectId()
}));
rejects('single submission partial unique index', 11000, () => db.responses.insertOne({
  ...schemaExamples.response, _id: new ObjectId(), requestId: 'second'
}));
const repeatSurvey = { ...schemaExamples.survey, _id: new ObjectId(), publicId: 'repeat-demo', allowRepeat: true };
db.surveys.insertOne(repeatSurvey);
const repeated = { ...schemaExamples.response, _id: new ObjectId(), surveyId: repeatSurvey._id, repeatAllowed: true };
db.responses.insertOne(repeated);
db.responses.insertOne({ ...repeated, _id: new ObjectId(), requestId: 'second' });
check('repeat-enabled accepts distinct requests', db.responses.countDocuments({ surveyId: repeatSurvey._id }) === 2);
rejects('request retries cannot create duplicates', 11000, () => db.responses.insertOne({ ...repeated, _id: new ObjectId() }));
rejects('repeat policy snapshot required', 121, () => {
  const invalid = { ...schemaExamples.response, _id: new ObjectId() }; delete invalid.repeatAllowed;
  db.responses.insertOne(invalid);
});
rejects('numeric string rejected', 121, () => db.responses.insertOne({
  ...repeated, _id: new ObjectId(), requestId: 'bad-number',
  answers: [{ questionId: 'q5', type: 'number', number: '17' }]
}));
rejects('duplicate multiple-choice option rejected', 121, () => db.responses.insertOne({
  ...repeated, _id: new ObjectId(), requestId: 'bad-options',
  answers: [{ questionId: 'q3', type: 'multiple', optionIds: ['swim', 'swim'] }]
}));
rejects('answer type and payload must agree', 121, () => db.responses.insertOne({
  ...repeated, _id: new ObjectId(), requestId: 'bad-type',
  answers: [{ questionId: 'q5', type: 'number', text: '17' }]
}));
const stats = db.responses.aggregate([
  { $match: { surveyId: schemaExamples.survey._id } }, { $unwind: '$answers' },
  { $match: { 'answers.questionId': 'q5', 'answers.type': 'number' } },
  { $group: { _id: null, average: { $avg: '$answers.number' }, count: { $sum: 1 } } }
]).toArray();
check('decimal average uses stored answers', stats.length === 1 && stats[0].average.toString() === '17' && stats[0].count === 1);
check('anonymous fixture retains internal identity', !!db.responses.findOne({ _id: schemaExamples.response._id }).respondentId);
print(`Verification complete: ${passed} checks. Fixtures retained in ${db.getName()}.`);
