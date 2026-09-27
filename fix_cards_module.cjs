const fs = require('fs');

let jsxPath = 'src/pages/painel/PainelCards.jsx';
let jsx = fs.readFileSync(jsxPath, 'utf8');

if (!jsx.includes('import styles from')) {
  // 1. Rename CSS import
  jsx = jsx.replace(
    /import ['"]\.\/PainelCards\.css['"]/,
    `import styles from './PainelCards.module.css';\nconst cx = (...classes) => classes.filter(Boolean).map(c => styles[c] || c).join(' ');`
  );

  // 2. Replace static classNames: className="foo bar" -> className={cx("foo", "bar")}
  jsx = jsx.replace(/className="([^"]+)"/g, (match, classes) => {
    const parts = classes.split(' ').filter(Boolean);
    const args = parts.map(p => `'${p}'`).join(', ');
    return `className={cx(${args})}`;
  });

  // 3. Replace simple template literals: className={`foo ${bar}`} -> className={cx('foo', bar)}
  jsx = jsx.replace(/className=\{`([^`]+)`\}/g, (match, template) => {
    const parts = [];
    let currentPart = '';
    let inVar = false;
    for (let i = 0; i < template.length; i++) {
      if (template[i] === '$' && template[i+1] === '{') {
        if (currentPart.trim()) parts.push(`'${currentPart.trim()}'`);
        currentPart = '';
        inVar = true;
        i++;
      } else if (template[i] === '}' && inVar) {
        parts.push(currentPart.trim());
        currentPart = '';
        inVar = false;
      } else {
        currentPart += template[i];
      }
    }
    if (currentPart.trim()) parts.push(`'${currentPart.trim()}'`);
    return `className={cx(${parts.join(', ')})}`;
  });

  fs.writeFileSync(jsxPath, jsx, 'utf8');
}
console.log('Restored module css refactor');
