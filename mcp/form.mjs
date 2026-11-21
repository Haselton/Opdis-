import { draftSchema, prepareDraft } from './draft.mjs';

const form = document.getElementById('case-form');
const result = document.getElementById('draft-result');
const feedback = document.getElementById('feedback');
const download = document.getElementById('download');
const fields = document.getElementById('case-fields');
let downloadURL;
for (const suite of ['train', 'smoke']) {
  for (const number of [1, 2]) {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = (suite === 'train' ? 'Training case ' : 'Smoke case ') + number;
    fieldset.append(legend);
    for (const [key, label, limit] of [['prompt', 'Question', 1000], ['expected', 'Exact answer', 200]]) {
      const wrap = document.createElement('label');
      wrap.textContent = label;
      const input = document.createElement(key === 'prompt' ? 'textarea' : 'input');
      input.name = [suite, number, key].join('-');
      input.required = true;
      input.maxLength = limit;
      wrap.append(input);
      fieldset.append(wrap);
    }
    fields.append(fieldset);
  }
}
form.hidden = false;
function clearResult() {
  if (downloadURL) URL.revokeObjectURL(downloadURL);
  downloadURL = null;
  result.hidden = true;
  download.removeAttribute('href');
  feedback.textContent = '';
}
form.addEventListener('input', clearResult);
form.addEventListener('submit', event => {
  event.preventDefault();
  clearResult();
  const data = new FormData(form);
  const prefix = 'case-' + crypto.randomUUID().slice(0, 12);
  const suite = group => [1, 2].map(i => ({ id: prefix + '-' + group + '-' + i,
    prompt: data.get(group + '-' + i + '-prompt'), expected: data.get(group + '-' + i + '-expected') }));
  try {
    const input = draftSchema.parse({ author: data.get('author'), family: data.get('family'),
      rationale: data.get('rationale'), train: suite('train'), smoke: suite('smoke') });
    const text = JSON.stringify(prepareDraft(input), null, 2);
    document.getElementById('draft-preview').textContent = text;
    downloadURL = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    download.href = downloadURL;
    result.hidden = false;
    feedback.className = '';
    feedback.textContent = 'Four cases validated. Your draft is ready for review.';
  } catch (error) {
    feedback.className = 'error';
    feedback.textContent = error.issues ? 'Check that every field contains text within the stated limits.' : error.message;
  }
});
