const fs = require('fs');

function migrateFileToCssModule(jsxPath, cssPath) {
  if (!fs.existsSync(jsxPath)) return;
  let jsx = fs.readFileSync(jsxPath, 'utf8');
  
  // 1. Rename CSS import
  const cssFileName = cssPath.split('/').pop();
  const moduleCssFileName = cssFileName.replace('.css', '.module.css');
  
  jsx = jsx.replace(
    new RegExp(`import ['"]./${cssFileName}['"]`),
    `import styles from './${moduleCssFileName}';\nconst cx = (...classes) => classes.filter(Boolean).map(c => styles[c] || c).join(' ');`
  );

  // 2. Replace static classNames: className="foo bar" -> className={cx("foo", "bar")}
  jsx = jsx.replace(/className="([^"]+)"/g, (match, classes) => {
    const parts = classes.split(' ').filter(Boolean);
    const args = parts.map(p => `'${p}'`).join(', ');
    return `className={cx(${args})}`;
  });

  // 3. Replace simple template literals: className={`foo ${bar}`} -> className={cx('foo', bar)}
  jsx = jsx.replace(/className=\{`([^`]+)`\}/g, (match, template) => {
    // A bit hacky but works for most cases like `risk-bar ${classeRisco}`
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
    
    // For nested ternaries like leito.tipo === 'extra' ? 'extra' : ''
    // we can just leave them as they evaluate to strings.
    return `className={cx(${parts.join(', ')})}`;
  });

  fs.writeFileSync(jsxPath, jsx, 'utf8');

  // 4. Rename CSS file
  if (fs.existsSync(cssPath)) {
    const newCssPath = cssPath.replace('.css', '.module.css');
    fs.renameSync(cssPath, newCssPath);
  }
}

// Migrate PainelCards
migrateFileToCssModule('src/pages/painel/PainelCards.jsx', 'src/pages/painel/PainelCards.css');

console.log('Migrated PainelCards to CSS Modules');
