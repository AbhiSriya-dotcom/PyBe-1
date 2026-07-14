const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  chapter: { type: Number, required: true },
  title: { type: String, required: true },
  concept: { type: String, default: '' },
  instructions: { type: String, required: true },
  whyThisMatters: { type: String, required: true },
  template: { type: String, default: '' },
  targetOutput: { type: String, required: true },
  errorTips: { type: String, default: '' },
  quizQuestions: { type: Array, default: [] },
  promptChallenge: { type: Object, default: {} }
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
