module.exports = {
  packagerConfig: {
    asar: true,
    name: 'Virtual Bartender',
    executableName: 'Virtual Bartender',
    extraResource: [
      './runtime/backend',
      './runtime/frontend'
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'virtual_bartender',
        setupExe: 'VirtualBartender-Setup.exe',
        noMsi: true
      }
    }
  ]
};
