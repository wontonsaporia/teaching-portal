const search = document.getElementById('search');
const subject = document.getElementById('subject');
const container = document.getElementById('materials');
const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ja');
function renderMaterials() {
  const words = normalize(search.value).trim().split(/\s+/).filter(Boolean);
  const materials = window.TEACHING_MATERIALS.filter(material => {
    const text = normalize([material.title, material.description, material.subjectLabel, material.grade, material.format, ...material.tags].join(' '));
    return (subject.value === 'all' || subject.value === material.subject) && words.every(word => text.includes(word));
  });
  container.replaceChildren();
  for (const material of materials) {
    const card = document.createElement('article'); card.className = 'card';
    for (const [tag, className, text] of [
      ['p', 'meta', `${material.subjectLabel} · ${material.grade} · ${material.format}`],
      ['h3', '', material.title], ['p', 'description', material.description],
      ['p', 'tags', material.tags.join(' / ')]
    ]) {
      const element = document.createElement(tag); element.className = className;
      element.textContent = text; card.append(element);
    }
    const link = document.createElement('a'); link.href = material.path;
    link.textContent = material.action; link.setAttribute('aria-label', `${material.title}：${material.action}`);
    if (material.external) { link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent += '（別タブ）'; }
    card.append(link); container.append(card);
  }
  document.getElementById('count').textContent = `${materials.length}件 / 全${window.TEACHING_MATERIALS.length}件`;
  document.getElementById('empty').hidden = materials.length !== 0;
}
search.addEventListener('input', renderMaterials);
subject.addEventListener('change', renderMaterials);
renderMaterials();
