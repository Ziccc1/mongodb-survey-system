// Reference fixtures only: does not insert anything. load() from mongosh to inspect schemaExamples.
var schemaExamples = (() => {
  const ownerId = ObjectId('670000000000000000000001');
  const respondentId = ObjectId('670000000000000000000002');
  const surveyId = ObjectId('670000000000000000000010');
  const now = ISODate('2026-10-15T04:00:00Z');
  const user = (userId, username) => ({
    _id: userId, schemaVersion: 1, username, usernameKey: username.toLowerCase(),
    passwordHash: 'EXAMPLE_ONLY_NOT_A_REAL_PASSWORD_HASH', createdAt: now, updatedAt: now
  });
  const survey = {
    _id: surveyId, schemaVersion: 1, ownerId, publicId: 'sample-survey-001',
    title: '校园出行与活动调查', description: '题型和跳转配置示例',
    status: 'published', allowAnonymous: true, allowRepeat: false, expiresAt: null,
    definitionVersion: 1, revision: 1, structureLocked: false, submissionCount: 0,
    copiedFromId: null, firstPublishedAt: now, createdAt: now, updatedAt: now,
    questions: [
      { id: 'q1', type: 'single', title: '是否有自行车？', required: true,
        options: [{ id: 'yes', label: '有' }, { id: 'no', label: '没有' }],
        jumpRules: [{ id: 'r1', condition: { op: 'eq', optionId: 'no' }, targetQuestionId: 'q3' }] },
      { id: 'q2', type: 'text', title: '自行车品牌', required: true,
        validation: { minLength: 1, maxLength: 50 }, jumpRules: [] },
      { id: 'q3', type: 'multiple', title: '喜欢的运动（至少两项）', required: true,
        options: [{ id: 'basketball', label: '篮球' }, { id: 'swim', label: '游泳' },
          { id: 'run', label: '跑步' }], validation: { minChoices: 2, maxChoices: 3 },
        jumpRules: [
          { id: 'r2', condition: { op: 'containsAll', optionIds: ['basketball', 'swim'] }, targetQuestionId: 'q5' },
          { id: 'r3', condition: { op: 'containsAny', optionIds: ['basketball'] }, targetQuestionId: 'q4' }
        ] },
      { id: 'q4', type: 'text', title: '活动建议', required: false,
        validation: { minLength: 10, maxLength: 200 }, jumpRules: [] },
      { id: 'q5', type: 'number', title: '年龄', required: true,
        validation: { min: NumberDecimal('0'), max: NumberDecimal('120'), integerOnly: true },
        jumpRules: [{ id: 'r4', condition: { op: 'lt', number: NumberDecimal('18') }, targetQuestionId: 'q7' }] },
      { id: 'q6', type: 'number', title: '手机号', required: false,
        validation: { integerOnly: true }, jumpRules: [] },
      { id: 'q7', type: 'text', title: '其他意见', required: false, validation: {}, jumpRules: [] }
    ]
  };
  const response = {
    _id: ObjectId('670000000000000000000020'), schemaVersion: 1,
    surveyId, surveyDefinitionVersion: 1, respondentId,
    anonymous: true, repeatAllowed: false, requestId: 'example-request-001',
    payloadHash: '0'.repeat(64), // Placeholder, not the real hash of these answers.
    answers: [
      { questionId: 'q1', type: 'single', optionId: 'no' },
      { questionId: 'q3', type: 'multiple', optionIds: ['basketball', 'swim'] },
      { questionId: 'q5', type: 'number', number: NumberDecimal('17') }
    ], submittedAt: now
  };
  return { users: [user(ownerId, 'teacher_demo'), user(respondentId, 'student_demo')], survey, response };
})();
