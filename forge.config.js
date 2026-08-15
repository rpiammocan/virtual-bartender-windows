module.exports = {
  packagerConfig: {
    asar: true,
    name: 'Virtual Bartender',
    executableName: 'Virtual Bartender',
    icon: './assets/virtual-bartender-icon.ico',
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
        setupIcon: './assets/virtual-bartender-icon.ico',
        iconUrl: 'https://raw.githubusercontent.com/rpiammocan/virtual-bartender-windows/main/assets/virtual-bartender-icon.ico',
        noMsi: true
      }
    }
  ]
};
