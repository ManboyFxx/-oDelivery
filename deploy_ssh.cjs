const { Client } = require('ssh2');

const config = {
  host: 'br-asc-web1665.main-hosting.eu', // Trying main server host
  port: 65002,
  username: 'u525023092',
  password: 'Vertinho1@',
  readyTimeout: 15000
};

console.log('Tentando conectar via SSH em', config.host, 'na porta', config.port);

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Cliente SSH Pronto! Executando git pull e build...');
  
  // Concat commands into one execution context
  const cmd = `cd domains/oodelivery.online/public_html && git pull origin main && npm run build`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('❌ Erro enviando comando:', err);
      conn.end();
      return;
    }
    
    stream.on('close', (code, signal) => {
      console.log('🚪 Conexão finalizada. Código:', code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('error', (err) => {
  console.error('❌ Erro de Conexão:', err.message);
  
  // Try fallback FTP host with port 65002
  if (config.host === 'br-asc-web1665.main-hosting.eu') {
      console.log('\nRetentando com host alternativo ftp.oodelivery.online...');
      config.host = 'ftp.oodelivery.online';
      const conn2 = new Client();
      conn2.on('ready', () => {
        console.log('✅ Cliente SSH (Backup) Pronto!');
        conn2.exec(`cd domains/oodelivery.online/public_html && git pull origin main && npm run build`, (err, stream) => {
          if (err) throw err;
          stream.on('close', () => conn2.end()).on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
        });
      }).on('error', e => console.error('Backup falhou:', e.message)).connect(config);
  }
}).connect(config);
