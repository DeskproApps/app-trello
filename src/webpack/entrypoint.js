import { createApp, createToolbar } from '@deskpro/apps-sdk-react';
import '../main/sass/index.scss';

/**
 * Called when sdk-core has created the app
 *
 * @param {*} dpapp
 */
createApp(function(dpapp) {
  // DPAPP_MANIFEST is exported by webpack.
  dpapp.manifest = DPAPP_MANIFEST;

  // Adds the app toolbar to the frame.
  const container = document.getElementById('deskpro-app');
  const toolbar   = createToolbar(dpapp, dpapp.manifest.title, '../assets/icon.png');
  container.parentNode.insertBefore(toolbar, container);

  // Calls deskproapp() when it exists, which can be used for by apps written in plain
  // JS/jQuery, or else calls the runApp() function to launch the React code.
  if (window.deskproapp !== undefined) {
    return window.deskproapp(dpapp);
  }
  require('../main/javascript').runApp(dpapp);
});
