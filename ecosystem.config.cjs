module.exports = {
  apps: [{
    name: 'mediatech-ai-agent',
    script: 'serve',
    args: '-s dist -l 3001',  // SPA 모드로 dist 폴더를 3001 포트에서 서빙
    instances: 2,     // CPU 코어 수에 따라 조정 (8코어 중 2개 사용)
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
