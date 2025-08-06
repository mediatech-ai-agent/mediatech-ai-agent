module.exports = {
  apps: [{
    name: 'mediatech-ai-agent',
    script: 'serve',
    args: [
      '-s',           // SPA 모드 (모든 경로를 index.html로)
      'dist',         // Vite 빌드 결과 디렉토리
      '-l',           // 포트 설정
      '3001'
    ],
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
