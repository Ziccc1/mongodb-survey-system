// Run in mongosh after the manual acceptance workflow. Read-only: no inserts,
// updates, deletes, collection changes, or counter repairs.
// var acceptancePrefix = 'AT-20261017-01'; load('.../inspect-acceptance.mongosh.js');
(() => {
  const prefix = typeof acceptancePrefix === 'string' ? acceptancePrefix : 'AT-20261017-01';
  if (!/^AT-\d{8}-\d{2}$/.test(prefix)) throw new Error('Use a prefix such as AT-20261017-01');
  if (db.getName() === 'admin' || db.getName() === 'local') throw new Error('Select the project application database first');
  const root = prefix.toLowerCase().replace(/-/g, '_');
  const titleMap = {
    M: `${prefix}-M-校园运动调查`, R: `${prefix}-R-禁止重复`,
    D: `${prefix}-D-截止测试`, E: `${prefix}-E-边界测试`,
  };
  const expected = {
    M: { status: 'closed', versions: 2, counts: [3, 1], total: 4 },
    R: { status: 'published', versions: 2, counts: [2, 0], total: 2 },
    D: { status: 'published', versions: 1, counts: [1], total: 1 },
    E: { status: 'published', versions: 1, counts: [0], total: 0 },
  };
  const names = ['users', 'surveys', 'survey_versions', 'responses'];
  let passed = 0; const failures = [];
  function check(label, ok, actual) {
    if (ok) { passed++; print(`PASS ${label}`); }
    else { failures.push(label); print(`FAIL ${label}${actual === undefined ? '' : `: ${JSON.stringify(actual)}`}`); }
  }
  const oid = value => !!value && value._bsontype === 'ObjectId';
  const decimal = value => !!value && value._bsontype === 'Decimal128';
  const same = (a, b) => String(a) === String(b);
  const num = value => Number(String(value));
  const setEqual = (a, b) => a.length === b.length && a.every(item => b.includes(item));
  print(`Read-only acceptance audit: ${prefix}; database=${db.getName()}`);
  const existing = db.getCollectionNames();
  for (const name of names) check(`collection ${name} exists`, existing.includes(name));
  if (!names.every(name => existing.includes(name))) throw new Error('Required collections missing; no data was changed');

  const users = db.users.find({ usernameKey: { $in: ['owner_a', 'owner_b', 'filler_x', 'filler_y'].map(role => `${root}_${role}`) } }).toArray();
  check('four acceptance accounts', users.length === 4, users.map(u => u.username));
  for (const u of users) {
    check(`user ${u.username}: ID, schema and dates`, oid(u._id) && num(u.schemaVersion) === 1 && u.createdAt instanceof Date && u.updatedAt instanceof Date);
    check(`user ${u.username}: encoded credential, not test plaintext`, typeof u.passwordHash === 'string' && u.passwordHash.startsWith('scrypt$') && u.passwordHash !== 'SurveyTest!2026');
  }
  const owner = users.find(u => u.usernameKey === `${root}_owner_a`);
  const x = users.find(u => u.usernameKey === `${root}_filler_x`);
  const y = users.find(u => u.usernameKey === `${root}_filler_y`);
  const selected = {};
  for (const [code, title] of Object.entries(titleMap)) {
    const docs = db.surveys.find({ title }).limit(3).toArray();
    check(`${code}: unique exact title`, docs.length === 1, docs.length);
    if (docs.length === 1) selected[code] = docs[0];
  }
  const surveyIds = Object.values(selected).map(s => s._id);
  const scopes = {
    users: { _id: { $in: users.map(u => u._id) } },
    surveys: { _id: { $in: surveyIds } },
    survey_versions: { surveyId: { $in: surveyIds } },
    responses: { surveyId: { $in: surveyIds } },
  };
  for (const name of names) {
    const info = db.getCollectionInfos({ name })[0];
    const options = info.options;
    check(`${name}: strict/error JSON Schema validator`, options.validationLevel === 'strict' && options.validationAction === 'error' && !!options.validator?.$jsonSchema);
    if (options.validator?.$jsonSchema) {
      const invalid = db.getCollection(name).countDocuments({ $and: [scopes[name], { $nor: [options.validator] }] });
      check(`${name}: acceptance documents satisfy installed validator`, invalid === 0, invalid);
    }
    const indexes = db.getCollection(name).getIndexes();
    print(`${name} indexes: ${JSON.stringify(indexes.map(i => ({ name: i.name, key: i.key, unique: !!i.unique, partial: i.partialFilterExpression ?? null })))}`);
    const required = {
      users: ['uq_username_key'], surveys: ['uq_survey_public_id', 'ix_owner_list'],
      survey_versions: ['uq_survey_version', 'uq_publication_request'],
      responses: ['uq_one_response_per_user', 'uq_submission_request', 'ix_survey_responses', 'ix_version_responses'],
    }[name];
    check(`${name}: expected named indexes`, required.every(n => indexes.some(i => i.name === n)));
    for (const index of indexes.filter(i => i.name.startsWith('uq_'))) check(`${name}/${index.name}: unique`, index.unique === true);
    if (name === 'responses') check('response repeat policy partial filter', indexes.find(i => i.name === 'uq_one_response_per_user')?.partialFilterExpression?.repeatAllowed === false);
  }

  for (const [code, survey] of Object.entries(selected)) {
    const e = expected[code];
    const versions = db.survey_versions.find({ surveyId: survey._id }).sort({ version: 1 }).toArray();
    const responses = db.responses.find({ surveyId: survey._id }).sort({ submittedAt: 1, _id: 1 }).limit(1001).toArray();
    if (responses.length > 1000) throw new Error('More than 1000 acceptance responses; inspect scope before continuing');
    check(`${code}: survey owner and BSON types`, oid(survey._id) && oid(survey.ownerId) && !!owner && same(survey.ownerId, owner._id) && survey.createdAt instanceof Date && survey.updatedAt instanceof Date && num(survey.schemaVersion) === 2);
    check(`${code}: final state`, survey.status === e.status, survey.status);
    check(`${code}: expected version count`, versions.length === e.versions, versions.length);
    check(`${code}: current pointer`, num(survey.currentPublishedVersion) === e.versions, survey.currentPublishedVersion);
    check(`${code}: actual and maintained cumulative count`, responses.length === e.total && num(survey.submissionCount) === responses.length, { actual: responses.length, maintained: survey.submissionCount });
    const current = responses.filter(r => same(r.surveyDefinitionVersion, survey.currentPublishedVersion)).length;
    check(`${code}: maintained current count`, num(survey.currentVersionSubmissionCount) === current, { actual: current, maintained: survey.currentVersionSubmissionCount });
    if (code === 'D') check('D: deadline is stored as Date and expired', survey.expiresAt instanceof Date && survey.expiresAt.getTime() <= Date.now());
    for (let index = 0; index < e.counts.length; index++) {
      const count = responses.filter(r => num(r.surveyDefinitionVersion) === index + 1).length;
      check(`${code}: v${index + 1} response count`, count === e.counts[index], count);
    }
    for (const v of versions) {
      check(`${code}/v${v.version}: snapshot identity/dates and no mutable count`, oid(v._id) && same(v.surveyId, survey._id) && v.publishedAt instanceof Date && oid(v.publishedBy) && num(v.schemaVersion) === 1 && !('submissionCount' in v) && !('currentVersionSubmissionCount' in v));
      const qs = v.definition.questions;
      check(`${code}/v${v.version}: unique question IDs`, new Set(qs.map(q => q.id)).size === qs.length);
      for (const q of qs) {
        if (q.type === 'number') check(`${code}/v${v.version}/${q.title}: decimal bounds`, ['min', 'max'].every(k => q.validation[k] === undefined || decimal(q.validation[k])));
        for (const r of q.jumpRules) {
          check(`${code}/v${v.version}/${q.title}: forward rule reference`, qs.findIndex(t => t.id === r.targetQuestionId) > qs.findIndex(t => t.id === q.id));
          if (q.type === 'number') check(`${code}/v${v.version}/${q.title}: decimal rule threshold`, decimal(r.condition.number));
        }
      }
    }
    for (const response of responses) {
      const v = versions.find(v => same(v.version, response.surveyDefinitionVersion));
      check(`${code}: response ${response._id} has snapshot and BSON identity/time`, !!v && oid(response._id) && oid(response.respondentId) && response.submittedAt instanceof Date && num(response.schemaVersion) === 2);
      check(`${code}: response ${response._id} respondent exists`, db.users.countDocuments({ _id: response.respondentId }) === 1);
      check(`${code}: response ${response._id} unique per-question answers`, new Set(response.answers.map(a => a.questionId)).size === response.answers.length);
      if (!v) continue;
      check(`${code}: response ${response._id} frozen repeat/anonymous policy`, response.repeatAllowed === v.policySnapshot.allowRepeat && (!response.anonymous || v.policySnapshot.allowAnonymous));
      for (const a of response.answers) {
        const q = v.definition.questions.find(q => q.id === a.questionId);
        check(`${code}: answer reference/type ${a.questionId}`, !!q && q.type === a.type);
        if (!q) continue;
        if (a.type === 'single') check(`${code}: single option reference`, q.options.some(o => o.id === a.optionId));
        if (a.type === 'multiple') check(`${code}: multiple unique option references`, new Set(a.optionIds).size === a.optionIds.length && a.optionIds.every(id => q.options.some(o => o.id === id)));
        if (a.type === 'number') check(`${code}: answer number is Decimal128`, decimal(a.number));
      }
    }
    print(`${code}: ${JSON.stringify({ surveyId: String(survey._id), publicId: survey.publicId, versions: versions.map(v => num(v.version)), counts: { cumulative: responses.length, current } })}`);
  }

  const m = selected.M;
  if (m) {
    const versions = db.survey_versions.find({ surveyId: m._id }).sort({ version: 1 }).toArray();
    const v1 = versions.find(v => num(v.version) === 1), v2 = versions.find(v => num(v.version) === 2);
    if (v1 && v2) {
      const q1 = v1.definition.questions, q2 = v2.definition.questions;
      check('M: v1 has12 questions, v2 has13', q1.length === 12 && q2.length === 13, [q1.length, q2.length]);
      check('M: historical text is not overwritten', q1[2]?.title === '你对运动设施有什么建议？' && q2[2]?.title === '你对运动设施维护有什么建议？');
      check('M: historical option label and stable ID retained', q1[1]?.options[1]?.label === '游泳' && q2[1]?.options[1]?.label === '游泳（含训练）' && q1[1].options[1].id === q2[1].options[1].id);
      check('M: old version has no Q13', !q1.some(q => q.title === '第二版补充') && q2[12]?.title === '第二版补充');
      const r1 = db.responses.find({ surveyId: m._id, surveyDefinitionVersion: 1 }).toArray();
      const groups = db.responses.aggregate([
        { $match: { surveyId: m._id, surveyDefinitionVersion: 1 } }, { $unwind: '$answers' },
        { $group: { _id: '$answers.questionId', answered: { $sum: 1 }, average: { $avg: { $cond: [{ $eq: ['$answers.type', 'number'] }, '$answers.number', null] } } } },
      ]).toArray();
      const expectedAnswered = [3, 2, 1, 3, 2, 1, 1, 3, 2, 2, 3, 3];
      q1.forEach((q, i) => check(`M/v1 Q${i + 1}: answered count`, (groups.find(g => g._id === q.id)?.answered ?? 0) === expectedAnswered[i]));
      const optionExpected = { 0: [2, 1], 1: [2, 1, 1, 0], 7: [2, 1, 0], 8: [1, 2, 1], 11: [2, 1] };
      for (const [index, expectedCounts] of Object.entries(optionExpected)) {
        const q = q1[Number(index)];
        const counts = q.options.map(o => r1.filter(r => r.answers.some(a => a.questionId === q.id && (a.type === 'single' ? a.optionId === o.id : a.type === 'multiple' && a.optionIds.includes(o.id)))).length);
        check(`M/v1 Q${Number(index) + 1}: option counts`, JSON.stringify(counts) === JSON.stringify(expectedCounts), counts);
      }
      for (const [index, expectedMean] of [[3, 4 / 3], [4, 21], [9, 4]]) {
        const group = groups.find(g => g._id === q1[index].id);
        check(`M/v1 Q${index + 1}: aggregate mean`, !!group?.average && Math.abs(Number(group.average.toString()) - expectedMean) < 1e-10, group?.average?.toString());
      }
      const phoneAnswers = r1.flatMap(r => r.answers.filter(a => a.questionId === q1[5].id));
      check('M/v1: exact phone Decimal128', phoneAnswers.length === 1 && decimal(phoneAnswers[0].number) && phoneAnswers[0].number.toString() === '13800138000');
      check('M/v1: X submitted twice, Y once', !!x && !!y && r1.filter(r => same(r.respondentId, x._id)).length === 2 && r1.filter(r => same(r.respondentId, y._id)).length === 1);
      const a = r1.find(r => r.answers.some(a => a.questionId === q1[3].id && a.number?.toString() === '2.5'));
      const b = r1.find(r => r.answers.some(a => a.questionId === q1[3].id && a.number?.toString() === '1.5'));
      const c = r1.find(r => r.answers.some(a => a.questionId === q1[3].id && a.number?.toString() === '0'));
      if (a && b && c) {
        check('M/v1: anonymous flags A/B/C', a.anonymous === true && b.anonymous === false && c.anonymous === true);
        check('M/v1: answer A has no skipped Q3', !a.answers.some(a => a.questionId === q1[2].id));
        check('M/v1: answer C has no skipped Q2/Q3/Q5', [1, 2, 4].every(i => !c.answers.some(a => a.questionId === q1[i].id)));
        check('M/v1: B retains text; optional Q7 only in B', b.answers.find(a => a.questionId === q1[2].id)?.text === '建议增加夜间照明' && b.answers.find(a => a.questionId === q1[6].id)?.text === '增加夜间开放');
      } else check('M/v1: A/B/C fixed submissions identifiable', false);
      const d = db.responses.findOne({ surveyId: m._id, surveyDefinitionVersion: 2 });
      if (d) check('M/v2: D final answers and no skipped/empty values', setEqual(d.answers.map(a => a.questionId), [0, 3, 7, 10, 11, 12].map(i => q2[i].id)) && d.answers.find(a => a.questionId === q2[3].id)?.number?.toString() === '0' && d.answers.find(a => a.questionId === q2[12].id)?.text === '仅第二版新增');
    } else check('M: both snapshots exist for historical audit', false);
  }
  print(`Audit finished: ${passed} passed, ${failures.length} failed. This checks stored acceptance data, not all possible requests or database privileges.`);
  if (failures.length) throw new Error(`Acceptance audit failed: ${failures.join('; ')}`);
})();
