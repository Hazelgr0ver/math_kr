import { defineConfig } from 'vite';

// Скрипты подключены обычными <script> (не модулями), чтобы сайт открывался и двойным кликом.
// Vite не отслеживает такие файлы, поэтому при любом изменении просто перезагружаем страницу.
export default defineConfig({
  plugins: [{
    name: 'full-reload-on-change',
    handleHotUpdate({ file, server }) {
      server.config.logger.info(`изменён ${file.split('/').slice(-2).join('/')} — перезагружаю страницу`, { timestamp: true });
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  }],
});
