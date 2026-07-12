const fs = require('fs');
const path = require('path');
const glob = require('glob');

// mapping of portuguese comments to english (c1 level, casual but professional)
const translations = {
  // general
  'Configuração': 'config',
  'configuração': 'config',
  'Variáveis de ambiente': 'environment variables',
  'variáveis de ambiente': 'environment variables',
  'Banco de dados': 'database',
  'banco de dados': 'database',
  'Conexão': 'connection',
  'conexão': 'connection',

  // rate limiting
  'Rate limiter geral para toda a API': 'general api rate limiter',
  'Rate limiter estrito para criação de eventos': 'strict rate limiter for event creation',
  'simula fintech': 'fintech pattern',
  'Rate limiter para webhooks': 'rate limiter for webhook operations',
  'Rate limit por IP': 'rate limit by ip',
  'opcional API key no futuro': 'could add api key later',

  // time
  'minuto': 'minute',
  'minutos': 'minutes',
  'segundo': 'second',
  'segundos': 'seconds',
  'hora': 'hour',
  'horas': 'hours',
  'dia': 'day',
  'dias': 'days',

  // actions
  'Criar': 'create',
  'criar': 'create',
  'Atualizar': 'update',
  'atualizar': 'update',
  'Deletar': 'delete',
  'deletar': 'delete',
  'Buscar': 'fetch',
  'buscar': 'fetch',
  'Listar': 'list',
  'listar': 'list',
  'Validar': 'validate',
  'validar': 'validate',
  'Processar': 'process',
  'processar': 'process',
  'Enviar': 'send',
  'enviar': 'send',
  'Receber': 'receive',
  'receber': 'receive',

  // status
  'sucesso': 'success',
  'Sucesso': 'success',
  'falha': 'failure',
  'Falha': 'failure',
  'erro': 'error',
  'Erro': 'error',
  'pendente': 'pending',
  'Pendente': 'pending',

  // others
  'Retornar': 'return',
  'retornar': 'return',
  'Se': 'if',
  'se': 'if',
  'Verificar': 'check',
  'verificar': 'check',
  'Adicionar': 'add',
  'adicionar': 'add',
  'Remover': 'remove',
  'remover': 'remove',
};

// patterns to remove completely (trivial comments)
const removePatterns = [
  /\/\/ \d+ (req\/min|events\/min|webhook operations\/min)/,
  /\/\/ em prod$/,
  /\/\/ Return rate limit info in headers/,
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // remove patterns
  removePatterns.forEach(pattern => {
    const newContent = content.replace(pattern, '');
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  // translate comments
  Object.entries(translations).forEach(([pt, en]) => {
    const commentPattern = new RegExp(`(\/\/|\/\\\*\\\*?)\\s*${pt}`, 'gi');
    const newContent = content.replace(commentPattern, (match, prefix) => {
      return `${prefix} ${en}`;
    });
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[OK] ${path.relative(process.cwd(), filePath)}`);
  }
}

// process all ts files
const files = glob.sync('src/**/*.ts');
console.log(`[*] processing ${files.length} files...`);
files.forEach(processFile);
console.log('[SUCCESS] all files processed');
