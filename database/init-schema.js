// mongosh <URI>/<database> --file database/init-schema.js
// Only creates missing collections and indexes. Never drops data or rewrites existing validators.
(() => {
  const str = { bsonType: 'string', minLength: 1 };
  const id = { bsonType: 'objectId' };
  const date = { bsonType: 'date' };
  const bool = { bsonType: 'bool' };
  const integer = { bsonType: ['int', 'long'], minimum: 0 };
  const decimal = { bsonType: 'decimal' };
  const object = (properties, required = Object.keys(properties)) => ({
    bsonType: 'object', additionalProperties: false,
    ...(required.length ? { required } : {}), properties
  });
  const stringArray = { bsonType: 'array', items: str, uniqueItems: true };
  const option = object({ id: str, label: str });
  const rule = object({
    id: str,
    condition: { oneOf: [
      object({ op: { enum: ['eq'] }, optionId: str }),
      object({ op: { enum: ['containsAny', 'containsAll'] }, optionIds: { ...stringArray, minItems: 1 } }),
      object({ op: { enum: ['eq', 'lt', 'lte', 'gt', 'gte'] }, number: decimal })
    ] },
    targetQuestionId: str
  });
  const commonQuestion = {
    id: str, title: str, required: bool,
    jumpRules: { bsonType: 'array', items: rule }
  };
  const question = { oneOf: [
    object({ ...commonQuestion, type: { enum: ['single'] },
      options: { bsonType: 'array', minItems: 2, items: option } }),
    object({ ...commonQuestion, type: { enum: ['multiple'] },
      options: { bsonType: 'array', minItems: 2, items: option },
      validation: object({ minChoices: integer, maxChoices: integer }, []) }),
    object({ ...commonQuestion, type: { enum: ['text'] },
      validation: object({ minLength: integer, maxLength: integer }, []) }),
    object({ ...commonQuestion, type: { enum: ['number'] },
      validation: object({ min: decimal, max: decimal, integerOnly: bool }, ['integerOnly']) })
  ] };
  const answer = { oneOf: [
    object({ questionId: str, type: { enum: ['single'] }, optionId: str }),
    object({ questionId: str, type: { enum: ['multiple'] }, optionIds: { ...stringArray, minItems: 1 } }),
    object({ questionId: str, type: { enum: ['text'] }, text: str }),
    object({ questionId: str, type: { enum: ['number'] }, number: decimal })
  ] };
  const schemas = {
    users: object({
      _id: id, schemaVersion: { enum: [1] }, username: str, usernameKey: str,
      passwordHash: str, createdAt: date, updatedAt: date
    }),
    surveys: object({
      _id: id, schemaVersion: { enum: [1] }, ownerId: id, publicId: str,
      title: str, description: { bsonType: 'string' },
      status: { enum: ['draft', 'published', 'paused', 'closed'] },
      allowAnonymous: bool, allowRepeat: bool,
      expiresAt: { bsonType: ['date', 'null'] },
      definitionVersion: { ...integer, minimum: 1 }, revision: integer,
      structureLocked: bool, submissionCount: integer,
      questions: { bsonType: 'array', items: question },
      copiedFromId: { bsonType: ['objectId', 'null'] },
      firstPublishedAt: { bsonType: ['date', 'null'] }, createdAt: date, updatedAt: date
    }),
    responses: object({
      _id: id, schemaVersion: { enum: [1] }, surveyId: id,
      surveyDefinitionVersion: { ...integer, minimum: 1 },
      respondentId: id, anonymous: bool, repeatAllowed: bool,
      requestId: str, payloadHash: { bsonType: 'string', pattern: '^[0-9a-f]{64}$' },
      answers: { bsonType: 'array', items: answer },
      submittedAt: date
    })
  };
  const existing = db.getCollectionNames();
  for (const [name, schema] of Object.entries(schemas)) {
    if (!existing.includes(name)) {
      db.createCollection(name, {
        validator: { $jsonSchema: schema }, validationLevel: 'strict', validationAction: 'error'
      });
    } else {
      const actual = db.getCollectionInfos({ name })[0].options;
      if (EJSON.stringify(actual.validator) !== EJSON.stringify({ $jsonSchema: schema }) ||
          actual.validationLevel !== 'strict' || actual.validationAction !== 'error') {
        throw new Error(`Existing ${name} validator differs; use a reviewed migration instead.`);
      }
    }
  }
  db.users.createIndex({ usernameKey: 1 }, { unique: true, name: 'uq_username_key' });
  db.surveys.createIndex({ publicId: 1 }, { unique: true, name: 'uq_survey_public_id' });
  db.surveys.createIndex({ ownerId: 1, createdAt: -1, _id: -1 }, { name: 'ix_owner_list' });
  db.responses.createIndex({ surveyId: 1, submittedAt: -1, _id: -1 }, { name: 'ix_survey_responses' });
  db.responses.createIndex({ surveyId: 1, respondentId: 1 }, {
    unique: true, partialFilterExpression: { repeatAllowed: false }, name: 'uq_one_response_per_user'
  });
  db.responses.createIndex({ surveyId: 1, respondentId: 1, requestId: 1 }, {
    unique: true, name: 'uq_submission_request'
  });
  print(`Schema and indexes ready in ${db.getName()}. No sample data inserted.`);
})();
