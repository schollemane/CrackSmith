import https from 'https';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import archiver from 'archiver';
import path from "path";
import { BrowserWindow, dialog, shell, ipcMain } from "electron";
import { ModBundle, PackageData } from './preload';
import { exec } from 'child_process';

function initCustomBehavior(window: BrowserWindow) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
});
  ipcMain.handle('application:minimize', async () => {
    window.minimize();
  });
  
  ipcMain.handle('application:maximize', async () => {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  });
  
  ipcMain.handle('application:exit', async () => {
    window.close();
  });

  ipcMain.handle('modApi:selectFolder', async (e, dialogTitle: string) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      title: dialogTitle,
      properties: ['openDirectory']
    });
    if (canceled) {
      return '';
    } else {
      return filePaths[0];
    }
  });

  ipcMain.handle('modApi:showFile', async (e, path: string) => {
    shell.showItemInFolder(path);
  });

  ipcMain.handle('modApi:getAssemblies', async (e, libFolderPath: string) => {
    return await getAssemblies(libFolderPath);
  });

  ipcMain.handle('modApi:exportMod', async (e, bundle: ModBundle) => {  
    // Destructure the data from the bundle
    const { modName, csproj, exportFolder, scripts } = bundle;
    
    let result;
    let buildOutput = '';

    try {
      // Create the export directory if it doesn't exist
      await fs.mkdir(exportFolder, { recursive: true });
  
      // Create the .csproj file in the target location
      const csprojPath = path.join(exportFolder, `${modName}.csproj`);
      await fs.writeFile(csprojPath, csproj);
  
      // Create the src directory
      const srcFolderPath = path.join(exportFolder, 'src');
      await fs.mkdir(srcFolderPath, { recursive: true });
  
      // Create each script file in the src folder
      for (const script of scripts) {
        const scriptPath = path.join(srcFolderPath, `${script.name}.cs`);
        await fs.writeFile(scriptPath, script.content);
      }

      // Build the project
      const csprojFilePath = path.join(exportFolder, `${modName}.csproj`);
      const buildCommand = `dotnet build "${csprojFilePath}" -c Release`;
  
      // Execute the build command in the export folder
      await new Promise((resolve, reject) => {
        exec(buildCommand, { cwd: exportFolder }, (error, stdout, stderr) => {
          if (error) {
            console.error('Build error:', error);
            buildOutput = stdout;
            return reject(error);
          }
          console.log('Build stdout:', stdout);
          console.error('Build stderr:', stderr);
          buildOutput = stdout;
          resolve({ stdout });
        });
      });

      // Move binary from bin to export folder
      const binaryPath = path.join(exportFolder, 'bin', 'Release', 'netstandard2.1', `${modName}.dll`);
      const binaryDest = path.join(exportFolder, `${modName}.dll`);
      await fs.rename(binaryPath, binaryDest);

      result = {
        status: 'success',
        binary: binaryDest,
        output: buildOutput
      }
    } catch (error) {
      console.error('Error creating mod:', error);
      result = {
        status: 'error',
        message: error,
        output: buildOutput
      }
    }

    // Cleanup files from build process
    await fs.rm(path.join(exportFolder, 'bin'), { recursive: true, force: true });
    await fs.rm(path.join(exportFolder, 'obj'), { recursive: true, force: true });
    await fs.rm(path.join(exportFolder, 'src'), { recursive: true, force: true });
    await fs.rm(path.join(exportFolder, `${modName}.csproj`));

    return result;
  });

  ipcMain.handle('modApi:exportPackage', async (e, packageData: PackageData) => {
    const { manifest, dllPath, iconUrl, readme, destination } = packageData;

    const modName = path.parse(dllPath).name;

    const contentFolder = path.join(destination, `${modName}-Package-Contents`);
    await fs.mkdir(contentFolder, { recursive: true });

    await fs.copyFile(dllPath, path.join(contentFolder, path.basename(dllPath)));
    await fs.writeFile(path.join(contentFolder, 'manifest.json'), manifest);
    await fs.writeFile(path.join(contentFolder, 'README.md'), readme);

    await downloadFile(iconUrl, contentFolder, 'icon.png');

    const zipPath = path.join(destination, `${modName}-Thunderstore-Package.zip`);
    await zipDirectory(contentFolder, zipPath);

    return zipPath;
  })
}

async function zipDirectory(sourceDir, outPath) {
  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = fsSync.createWriteStream(outPath);

  const result = await new Promise<{success: boolean}>((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', err => resolve({success: false}))
      .pipe(stream)
    ;

    stream.on('close', () => resolve({success: true}));
    archive.finalize();
  });

  if (result.success) {
    stream.close();
  } else {
    await fs.unlink(outPath);
  }
}

async function downloadFile(url: string, folder: string, filename: string) {
  const destination = path.join(folder, filename)
  const iconFile = fsSync.createWriteStream(destination);
  const result = await new Promise<{success: boolean}>((resolve, reject) => {
    const request = https.get(url, response => {
      response.pipe(iconFile);
      iconFile.on('finish', () => {
        resolve({ success: true });
      })
    }).on('error', err => {
      resolve({ success: false });
    });
  });
  if (result.success) {
    iconFile.close();
  } else {
    await fs.unlink(destination);
  }
}

async function getAssemblies(libFolder: string) {
  const contents = await fs.readdir(libFolder, { withFileTypes: true });

  const assemblies = contents.filter(file => file.isFile() && path.extname(file.name) === '.dll');
  const assemblyPaths = assemblies.map(folder => path.join(libFolder, folder.name));

  const results = assemblyPaths.map(p => {
    const fileNameWithExtension = path.basename(p);
    const fileName = path.parse(fileNameWithExtension).name;
    return {
      path: p,
      name: fileName
    }
  });

  return results;
}

export default initCustomBehavior;